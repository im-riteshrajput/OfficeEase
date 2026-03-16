import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Play, Trophy } from 'lucide-react';
import TaskData from '../data/TaskData';
import TaskDetailModal from '../components/TaskDetailModal';

export default function EmployeeTask() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchTasks = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await TaskData.getMyTasks();
            setTasks(data);
        } catch (error) {
            console.error("Error loading tasks:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        const interval = setInterval(() => fetchTasks(true), 10000);
        return () => clearInterval(interval);
    }, []);

    const handleAccept = async (id) => {
        setActionLoading(id);
        try {
            const updated = await TaskData.acceptTask(id);
            setTasks(prev => prev.map(t => t._id === id ? updated : t));
        } catch (error) {
            console.error("Error accepting task:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleComplete = async (id) => {
        setActionLoading(id);
        try {
            const updated = await TaskData.completeTask(id);
            setTasks(prev => prev.map(t => t._id === id ? updated : t));
        } catch (error) {
            console.error("Error completing task:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const tabs = ['All', 'Pending', 'In Progress', 'Completed'];
    const filtered = tasks.filter(t => activeTab === 'All' || t.status === activeTab);

    const statusCounts = {
        All: tasks.length,
        Pending: tasks.filter(t => t.status === 'Pending').length,
        'In Progress': tasks.filter(t => t.status === 'In Progress').length,
        Completed: tasks.filter(t => t.status === 'Completed').length,
    };

    const priorityStyles = {
        High: 'bg-red-500/15 text-red-400 border border-red-500/20',
        Medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
        Low: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    };

    const statusConfig = {
        Pending: { bg: 'bg-slate-500/15', text: 'text-slate-400', icon: <Clock className="w-4 h-4" /> },
        'In Progress': { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: <AlertCircle className="w-4 h-4" /> },
        Completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4" /> },
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No date';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isOverdue = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date() && true;
    };

    return (
        <div className="p-3 sm:p-8 lg:p-12 min-h-screen">
            {/* Translucent Background Orbs */}
            <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
            <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>
            {/* Header */}
            <header className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight neon-glow-purple">My Tasks</h2>
                <p className="text-slate-400 text-base mt-1">View and manage your assigned tasks</p>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-black text-white">{statusCounts.All}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Total</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-black text-amber-400">{statusCounts.Pending}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Pending</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-black text-blue-400">{statusCounts['In Progress']}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">In Progress</p>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <p className="text-2xl font-black text-emerald-400">{statusCounts.Completed}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Completed</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 flex-wrap mt-6">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab
                                ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(124,59,237,0.2)]'
                                : 'glass-input text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {tab} <span className="ml-1 opacity-60">({statusCounts[tab]})</span>
                        </button>
                    ))}
                </div>
            </header>

            {/* Task List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {activeTab === 'Completed' ? 'No completed tasks yet' : activeTab === 'All' ? 'No tasks assigned' : `No ${activeTab.toLowerCase()} tasks`}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        {activeTab === 'All' ? "You're all caught up! Check back later." : "Try switching to a different tab."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(task => {
                        const sc = statusConfig[task.status];
                        const overdue = isOverdue(task.dueDate) && task.status !== 'Completed';

                        return (
                            <div
                                key={task._id}
                                onClick={() => setSelectedTask(task)}
                                className={`glass-card rounded-2xl p-5 sm:p-6 transition-all relative overflow-hidden cursor-pointer hover:bg-white/[0.04] ${task.status === 'Completed' ? 'opacity-70' : ''
                                    }`}
                            >
                                {/* Priority Accent */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}></div>

                                <div className="flex flex-col sm:flex-row sm:items-center gap-4 pl-3">
                                    {/* Main Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${priorityStyles[task.priority]}`}>
                                                {task.priority}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${sc.bg} ${sc.text}`}>
                                                {sc.icon}
                                                {task.status}
                                            </span>
                                            {overdue && (
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-1">{task.title}</h3>
                                        {task.description && (
                                            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 mb-2 whitespace-pre-wrap">{task.description}</p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Due: {formatDate(task.dueDate)}
                                            </span>
                                            <span>Assigned by: <span className="text-slate-300 font-medium">{task.assignedByName}</span></span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 sm:flex-col sm:items-end shrink-0">
                                        {task.status === 'Pending' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleAccept(task._id); }}
                                                disabled={actionLoading === task._id}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === task._id ? (
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                ) : (
                                                    <Play className="w-4 h-4" />
                                                )}
                                                Accept Task
                                            </button>
                                        )}
                                        {task.status === 'In Progress' && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleComplete(task._id); }}
                                                disabled={actionLoading === task._id}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-sm shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all disabled:opacity-50"
                                            >
                                                {actionLoading === task._id ? (
                                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                ) : (
                                                    <CheckCircle2 className="w-4 h-4" />
                                                )}
                                                Complete Task
                                            </button>
                                        )}
                                        {task.status === 'Completed' && (
                                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                                                <Trophy className="w-4 h-4" />
                                                Done
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
        </div>
    );
}
