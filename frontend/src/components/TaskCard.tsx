import React from "react";

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

interface TaskCardProps {
    task: Task;
    onDelete?: (taskId: string) => void;
    onClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onClick }) => {
    return (
        <div
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow mb-3 relative group cursor-pointer"
            onClick={() => onClick?.(task)}
        >
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(task._id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md"
                    title="Delete task"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
            <h4 className="font-semibold text-gray-800 mb-2">{task.title}</h4>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {task.description || "No description"}
            </p>

            <div className="flex justify-between items-center text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                    }`}>
                    {task.status.replace('_', ' ')}
                </span>

                {task.assignedTo && typeof task.assignedTo === 'object' && (
                    <span className="flex items-center gap-1" title={task.assignedTo.email}>
                        <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[9px]">
                            {task.assignedTo.name ? task.assignedTo.name.charAt(0).toUpperCase() : (task.assignedTo.email ? task.assignedTo.email.charAt(0).toUpperCase() : '?')}
                        </div>
                    </span>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
