import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, CheckCircle2, AlertCircle, Search, ClipboardCheck } from 'lucide-react';
import TaskData from '../data/TaskData';
import { getInitials } from '../utils/helpers';
import TaskDetailModal from '../components/TaskDetailModal';

export default function Tasks() {
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);

    const fetchTasks = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const data = await TaskData.getAllTasks();
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

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        setDeletingId(id);
        try {
            await TaskData.deleteTask(id);
            setTasks(prev => prev.filter(t => t._id !== id));
        } catch (error) {
            console.error("Error deleting task:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const tabs = ['All', 'Pending', 'In Progress', 'Completed'];
    const filtered = tasks.filter(t => {
        const matchTab = activeTab === 'All' || t.status === activeTab;
        const q = searchQuery.toLowerCase();
        const matchSearch = !searchQuery ||
            t.title.toLowerCase().includes(q) ||
            (t.assignees && t.assignees.some(a => 
                a.name.toLowerCase().includes(q) || 
                (a.employeeId && a.employeeId.toLowerCase().includes(q))
            )) ||
            (!t.assignees && t.assignedToName && t.assignedToName.toLowerCase().includes(q));
        return matchTab && matchSearch;
    });

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

    const statusStyles = {
        Pending: 'bg-slate-500/15 text-slate-400',
        'In Progress': 'bg-blue-500/15 text-blue-400',
        Completed: 'bg-emerald-500/15 text-emerald-400',
    };

    const statusIcons = {
        Pending: <Clock className="w-3.5 h-3.5" />,
        'In Progress': <AlertCircle className="w-3.5 h-3.5" />,
        Completed: <CheckCircle2 className="w-3.5 h-3.5" />,
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No date';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="p-3 sm:p-8 lg:p-12 min-h-screen">
            <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
            <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight neon-glow-purple">Tasks</h2>
                        <p className="text-slate-400 text-base mt-1">Manage and track all assigned tasks</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => navigate('/my-tasks')}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all text-sm"
                        >
                            <ClipboardCheck className="w-5 h-5 text-accent-teal" />
                            My Tasks
                        </button>
                        <button
                            onClick={() => navigate('/assign-task')}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-bold shadow-[0_0_20px_rgba(124,59,237,0.4)] hover:shadow-[0_0_30px_rgba(124,59,237,0.6)] transition-all text-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Assign Task
                        </button>
                    </div>
                </div>

                {/* Search + Tabs */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search tasks or assignees..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full glass-input rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-slate-500 text-white"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
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
                </div>
            </header>

            {/* Task Cards Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card rounded-2xl p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No tasks found</h3>
                    <p className="text-slate-400 text-sm">
                        {searchQuery ? "Try adjusting your search" : "Click 'Assign New Task' to create one"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(task => (
                        <div
                            key={task._id}
                            onClick={() => setSelectedTask(task)}
                            className="glass-card rounded-2xl p-6 hover:bg-white/[0.04] transition-all group relative overflow-hidden cursor-pointer"
                        >
                            {/* Priority Accent Line */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${task.priority === 'High' ? 'bg-gradient-to-r from-red-500 to-red-400' : task.priority === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`}></div>

                            {/* Top Row */}
                            <div className="flex justify-between items-start mb-3 mt-1">
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${priorityStyles[task.priority]}`}>
                                    {task.priority}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${statusStyles[task.status]}`}>
                                        {statusIcons[task.status]}
                                        {task.status}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(task._id); }}
                                        disabled={deletingId === task._id}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Title + Description */}
                            <h3 className="text-lg font-bold text-white mb-2 leading-snug">{task.title}</h3>
                            {task.description && (
                                <p className="text-sm text-slate-400 mb-4 leading-relaxed line-clamp-2 whitespace-pre-wrap">{task.description}</p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2.5">
                                    {task.assignees ? (
                                        <>
                                            <div className="flex -space-x-2">
                                                {task.assignees.slice(0, 3).map((a, i) => (
                                                    <div key={i} className="w-8 h-8 rounded-full bg-[#2d204a] flex items-center justify-center text-primary text-[10px] font-bold border border-primary/30 ring-2 ring-[#1E1B2E] overflow-hidden">
                                                        {a.profilePhotoUrl ? (
                                                            <img src={a.profilePhotoUrl} alt={a.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getInitials(a.name)
                                                        )}
                                                    </div>
                                                ))}
                                                {task.assignees.length > 3 && (
                                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 text-[10px] font-bold ring-2 ring-[#1E1B2E]">
                                                        +{task.assignees.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-white">
                                                    {task.assignees.length === 1 ? task.assignees[0].name : `${task.assignees.length} Assignees`}
                                                </p>
                                                <p className="text-[10px] text-slate-500">Team</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-8 h-8 rounded-full bg-[#2d204a] flex items-center justify-center text-primary text-xs font-bold border border-primary/30 overflow-hidden">
                                                {getInitials(task.assignedToName || 'Unknown')}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-white">{task.assignedToName || 'Unknown'}</p>
                                                <p className="text-[10px] text-slate-500">Assignee</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Due</p>
                                    <p className="text-xs text-slate-300 font-medium">{formatDate(task.dueDate)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
        </div>
    );
}
