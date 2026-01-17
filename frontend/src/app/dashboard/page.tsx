"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import KanbanBoard from "@/components/KanbanBoard";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";
import socket from "@/socket";

interface Task {
    _id: string;
    title: string;
    description?: string;
    status: string;
    deadline?: string;
    assignedTo?: {
        name: string;
        email: string;
    };
}

export default function DashboardPage() {
    const { user, token, backendUser } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Fetch tasks
    useEffect(() => {
        if (token) {
            api(token).getTasks()
                .then((data: unknown) => {
                    setTasks(data as Task[]);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch tasks", err);
                    setLoading(false);
                });
        }
    }, [token]);

    // Socket listeners for real-time updates
useEffect(() => {
    if (!token) return;
    // Handler functions
    const handleTaskCreated = (data: { task: Task }) => {
        console.log("Socket: Task created", data.task);
        setTasks(prev => [...prev, data.task]);
    };
    const handleTaskUpdated = (data: { task: Task }) => {
        console.log("Socket: Task updated", data.task);
        setTasks(prev => 
            prev.map(t => t._id === data.task._id ? data.task : t)
        );
    };
    const handleTaskDeleted = (data: { taskId: string }) => {
        console.log("Socket: Task deleted", data.taskId);
        setTasks(prev => prev.filter(t => t._id !== data.taskId));
    };
    // Register listeners
    socket.on("taskCreated", handleTaskCreated);
    socket.on("taskUpdated", handleTaskUpdated);
    socket.on("taskDeleted", handleTaskDeleted);
    // Cleanup function - CRITICAL to prevent memory leaks
    return () => {
        socket.off("taskCreated", handleTaskCreated);
        socket.off("taskUpdated", handleTaskUpdated);
        socket.off("taskDeleted", handleTaskDeleted);
    };
}, [token]);

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        if (!token) return;

        const task = tasks.find(t => t._id === taskId);
        if (!task) return;

        // Frontend Role Logic
        // "if user.role === USER"
        // Assuming backendUser structure has 'role'. 
        // If backendUser is null, we might optimistically allow or wait, 
        // but better to be safe.

        const userRole = (backendUser as { role?: string })?.role;
        console.log('Attempting status change:', { taskId, currentStatus: task.status, newStatus, userRole, backendUser });

        if (userRole === 'USER') {
            const canMove = () => {
                // Rule: Cannot move backwards
                // TODO -> IN_PROGRESS -> COMPLETED
                if (task.status === 'COMPLETED') return false;
                if (task.status === 'IN_PROGRESS' && newStatus === 'TODO') return false;

                return true;
            };

            if (!canMove()) {
                alert("You are not allowed to move tasks backwards or from completed.");
                return;
            }
        }

        // Optimistic Update
        const originalTasks = [...tasks];
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

        try {
            await api(token).updateTaskStatus(taskId, newStatus);
        } catch (err) {
            console.error("Failed to update task status", err);
            // Revert
            setTasks(originalTasks);
            alert("Failed to update status");
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailsModalOpen(true);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading tasks...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Project Board</h1>
                    <p className="text-gray-500 mt-1">Manage your tasks and progress</p>
                </div>

                <div className="flex items-center gap-3">
                    {(backendUser as { role?: string })?.role && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold tracking-wider uppercase">
                            {(backendUser as { role?: string }).role}
                        </span>
                    )}
                    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-200">

                        {user?.photoURL ? (
                            <Image src={user.photoURL} alt="User" width={32} height={32} className="w-8 h-8 rounded-full" unoptimized={user.photoURL.startsWith('http')} />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="text-sm font-medium text-gray-700">{user?.displayName || user?.email}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </header>

            <main className="h-[calc(100vh-12rem)]">
                <KanbanBoard tasks={tasks} onStatusChange={handleStatusChange} onTaskClick={handleTaskClick} />
            </main>

            <TaskDetailsModal
                isOpen={isDetailsModalOpen}
                task={selectedTask}
                onClose={() => setIsDetailsModalOpen(false)}
                onUpdateStatus={handleStatusChange}
                readOnly={true}
            />
        </div>
    );
}
