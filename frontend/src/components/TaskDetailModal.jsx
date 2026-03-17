import React from 'react';
import { X, Clock, CheckCircle2, AlertCircle, CalendarDays, User, UserCheck } from 'lucide-react';
import { getInitials } from '../utils/helpers';

export default function TaskDetailModal({ task, onClose }) {
    if (!task) return null;

    const priorityConfig = {
        High: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]' },
        Medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]' },
        Low: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' },
    };

    const statusConfig = {
        Pending: { bg: 'bg-slate-500/15', text: 'text-slate-400', icon: <Clock className="w-4 h-4" />, label: 'Pending' },
        'In Progress': { bg: 'bg-blue-500/15', text: 'text-blue-400', icon: <AlertCircle className="w-4 h-4" />, label: 'In Progress' },
        Completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: <CheckCircle2 className="w-4 h-4" />, label: 'Completed' },
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Not set';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

    const p = priorityConfig[task.priority] || priorityConfig.Medium;
    const s = statusConfig[task.status] || statusConfig.Pending;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl animate-in"
                onClick={e => e.stopPropagation()}
                style={{ animation: 'modalSlideIn 0.25s ease-out' }}
            >
                {/* Priority Accent Bar */}
                <div className={`h-1.5 w-full ${task.priority === 'High' ? 'bg-gradient-to-r from-red-500 to-red-400' : task.priority === 'Medium' ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} />

                {/* Header */}
                <div className="p-6 sm:p-8 pb-0">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-3">
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${p.bg} ${p.text} border ${p.border}`}>
                                    {task.priority} Priority
                                </span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${s.bg} ${s.text}`}>
                                    {s.icon}
                                    {s.label}
                                </span>
                                {isOverdue && (
                                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                                        ⚠ Overdue
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                                {task.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl glass-input flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-6">
                    {/* Description */}
                    {task.description && (
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h4>
                            <p className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                        </div>
                    )}

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Assigned To */}
                        <div className="glass-input rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2.5">
                                <User className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Assigned To {task.assignees && `(${task.assignees.length})`}
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2">
                                {task.assignees ? task.assignees.map(a => (
                                    <div key={a.id} className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-[#2d204a] flex items-center justify-center text-primary text-[10px] font-bold border border-primary/30 shrink-0 overflow-hidden">
                                            {a.profilePhotoUrl ? (
                                                <img src={a.profilePhotoUrl} alt={a.name} className="w-full h-full object-cover" />
                                            ) : (
                                                getInitials(a.name)
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-white truncate">{a.name}</p>
                                    </div>
                                )) : (
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-[#2d204a] flex items-center justify-center text-primary text-[10px] font-bold border border-primary/30 shrink-0 overflow-hidden">
                                            {getInitials(task.assignedToName || 'Unknown')}
                                        </div>
                                        <p className="text-sm font-semibold text-white truncate">{task.assignedToName || 'Unknown'}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Assigned By */}
                        <div className="glass-input rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2.5">
                                <UserCheck className="w-3.5 h-3.5 text-accent-teal" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned By</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#2d204a] flex items-center justify-center text-accent-teal text-xs font-bold border border-accent-teal/30 shrink-0 overflow-hidden">
                                    {getInitials(task.assignedByName)}
                                </div>
                                <p className="text-sm font-semibold text-white truncate">{task.assignedByName}</p>
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="glass-input rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2.5">
                                <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Date</span>
                            </div>
                            <p className={`text-sm font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                                {formatDate(task.dueDate)}
                            </p>
                        </div>

                        {/* Created At */}
                        <div className="glass-input rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Created</span>
                            </div>
                            <p className="text-sm font-semibold text-white">
                                {formatDate(task.createdAt)}
                            </p>
                            {task.createdAt && (
                                <p className="text-xs text-slate-500 mt-0.5">{formatTime(task.createdAt)}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
