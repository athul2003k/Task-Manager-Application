import React from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: string;
    assignedTo?: {
        name: string;
        email: string;
    };
}

interface KanbanBoardProps {
    tasks: Task[];
    onStatusChange: (taskId: string, newStatus: string) => void;
    readOnly?: boolean;
    onDelete?: (taskId: string) => void;
    onTaskClick?: (task: Task) => void;
}

const COLUMNS = [
    { id: "TODO", title: "To Do", color: "bg-gray-100", headerColor: "border-gray-300" },
    { id: "IN_PROGRESS", title: "In Progress", color: "bg-blue-50", headerColor: "border-blue-300" },
    { id: "COMPLETED", title: "Completed", color: "bg-green-50", headerColor: "border-green-300" },
];

export default function KanbanBoard({ tasks, onStatusChange, readOnly = false, onDelete, onTaskClick }: KanbanBoardProps) {
    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || readOnly) return;

        const { draggableId, destination, source } = result;

        if (destination.droppableId !== source.droppableId) {
            onStatusChange(draggableId, destination.droppableId);
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
                {COLUMNS.map((column) => (
                    <div key={column.id} className={`flex flex-col h-full rounded-xl ${column.color} p-4`}>
                        <div className={`flex items-center justify-between mb-4 pb-2 border-b-2 ${column.headerColor}`}>
                            <h3 className="font-bold text-gray-700">{column.title}</h3>
                            <span className="bg-white/50 px-2 py-0.5 rounded text-xs font-medium text-gray-500">
                                {tasks.filter(t => t.status === column.id).length}
                            </span>
                        </div>

                        <Droppable droppableId={column.id}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex-1 transition-colors rounded-lg overflow-y-auto min-h-[200px] ${snapshot.isDraggingOver ? "bg-white/50 ring-2 ring-indigo-200" : ""
                                        }`}
                                >
                                    {tasks
                                        .filter(task => task.status === column.id)
                                        .map((task, index) => (
                                            <Draggable
                                                key={task._id}
                                                draggableId={task._id}
                                                index={index}
                                                isDragDisabled={readOnly}
                                            >
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            ...provided.draggableProps.style,
                                                            opacity: snapshot.isDragging ? 0.8 : 1,
                                                        }}
                                                    >
                                                        <TaskCard task={task} onDelete={onDelete} onClick={onTaskClick} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
