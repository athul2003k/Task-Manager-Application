"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { signOut } from "firebase/auth";
import CreateTaskModal from "@/components/CreateTaskModal";
import TaskDetailsModal from "@/components/TaskDetailsModal";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { auth } from "@/lib/firebase";

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

export default function AdminPage() {
    const { user, token } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [users, setUsers] = useState<{ _id: string; name?: string; email: string }[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Fetch initial data
    useEffect(() => {
        if (token) {
            Promise.all([
                api(token).getTasks(),
                api(token).getUsers()
            ]).then(([tasksData, usersData]) => {
                setTasks(tasksData as Task[]);
                setUsers(usersData as { _id: string; name?: string; email: string }[]);
                setLoading(false);
            }).catch(err => {
                console.error("Failed to fetch admin data", err);
                if (err.message && (err.message.includes("Forbidden") || err.message.includes("403"))) {
                    window.location.href = "/dashboard";
                }
                setLoading(false);
            });
        }
    }, [token]);

    const handleCreateTask = async (data: { title: string; description: string; assignedTo: string; deadline?: string }) => {
        if (token) {
            try {
                const assignedUser = users.find(u => u._id === data.assignedTo);

                const createdTask = await api(token).createTask({
                    title: data.title,
                    description: data.description,
                    assignedTo: data.assignedTo,
                    deadline: data.deadline
                });

                const newTaskWithUser = {
                    ...createdTask,
                    assignedTo: assignedUser ? { name: assignedUser.name, email: assignedUser.email } : undefined,
                };

                setTasks(prev => [...prev, newTaskWithUser]);
            } catch (e) {
                console.error("Create failed", e);
                alert("Failed to create task");
            }
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!window.confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
            return;
        }

        if (!token) return;

        const originalTasks = [...tasks];
        setTasks(prev => prev.filter(t => t._id !== taskId));

        try {
            await api(token).deleteTask(taskId);
        } catch (e) {
            console.error("Delete failed", e);
            alert("Failed to delete task");
            setTasks(originalTasks);
        }
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsDetailsModalOpen(true);
    };

    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        if (!token) return;

        const originalTasks = [...tasks];
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));

        try {
            await api(token).updateTaskStatus(taskId, newStatus);
        } catch (e) {
            console.error("Status update failed", e);
            alert("Failed to update status");
            setTasks(originalTasks);
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

    // Filter tasks based on search query
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'TODO': return 'bg-gray-100 text-gray-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No deadline';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (loading) return <div className="p-8">Loading admin dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <header className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">Manage tasks and users</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold tracking-wider">
                            ADMIN
                        </span>
                        <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full shadow-sm border border-gray-200">
                            {user?.photoURL ? (
                                <Image src={user.photoURL} alt="User" width={32} height={32} className="w-8 h-8 rounded-full" unoptimized={user.photoURL.startsWith('http')} />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
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
                </div>

                {/* Search and Create Button */}
                <div className="flex gap-4 items-center">
                    <div className="flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search by Task Title"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400"
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
                    >
                        + New Task
                    </button>
                </div>
            </header>

            {/* Task Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTasks.map(task => (
                    <div
                        key={task._id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative group cursor-pointer"
                        onClick={() => handleTaskClick(task)}
                    >
                        {/* Delete Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task._id);
                            }}
                            className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-md"
                            title="Delete task"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

                        {/* Task Title */}
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 pr-8">
                            {task.title}
                        </h3>

                        {/* Task Details */}
                        <div className="space-y-3">
                            {/* Assigned To */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500 font-medium w-24">Assigned to:</span>
                                <span className="text-gray-900">
                                    {task.assignedTo ? (task.assignedTo.name || task.assignedTo.email) : 'Unassigned'}
                                </span>
                            </div>

                            {/* Deadline */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500 font-medium w-24">Deadline:</span>
                                <span className="text-gray-900">{formatDate(task.deadline)}</span>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500 font-medium w-24">Status:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredTasks.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {searchQuery ? 'No tasks found matching your search.' : 'No tasks yet. Create one to get started!'}
                    </p>
                </div>
            )}

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateTask}
                users={users}
            />

            <TaskDetailsModal
                isOpen={isDetailsModalOpen}
                task={selectedTask}
                onClose={() => setIsDetailsModalOpen(false)}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    );
}
