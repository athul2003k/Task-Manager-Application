import React, { useState, useEffect } from 'react';

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

interface TaskDetailsModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onUpdateStatus: (taskId: string, newStatus: string) => void;
    readOnly?: boolean;
}

export default function TaskDetailsModal({ isOpen, task, onClose, onUpdateStatus, readOnly = false }: TaskDetailsModalProps) {
    const [selectedStatus, setSelectedStatus] = useState(task?.status || 'TODO');

    // Sync selectedStatus with task.status whenever task changes
    useEffect(() => {
        if (task) {
            setSelectedStatus(task.status);
        }
    }, [task]);

    if (!isOpen || !task) return null;

    const handleSave = () => {
        if (selectedStatus !== task.status) {
            onUpdateStatus(task._id, selectedStatus);
        }
        onClose();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'No deadline set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'TODO': return 'bg-gray-100 text-gray-700';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700';
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                        <p className="text-lg font-semibold text-gray-900">{task.title}</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                        <p className="text-gray-700">{task.description || 'No description provided'}</p>
                    </div>

                    {/* Assigned To */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Assigned To</label>
                        <p className="text-gray-900">
                            {task.assignedTo ? (
                                <>
                                    <span className="font-medium">{task.assignedTo.name || 'No Name'}</span>
                                    <span className="text-gray-500 ml-2">({task.assignedTo.email})</span>
                                </>
                            ) : (
                                'Unassigned'
                            )}
                        </p>
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Deadline</label>
                        <p className="text-gray-900">{formatDate(task.deadline)}</p>
                    </div>

                    {/* Current Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Current Status</label>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Update Status - Only show if not readOnly */}
                    {!readOnly && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                            >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {readOnly ? 'Close' : 'Cancel'}
                    </button>
                    {!readOnly && (
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
