import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../data/api';
import { getInitials } from '../utils/helpers';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function Applications() {
    const navigate = useNavigate();
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchPending = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const res = await API.get('/employees/pending');
            setPendingUsers(res.data);
        } catch (err) {
            console.error("Error fetching pending users:", err);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchPending();
        
        // Poll for new applications every 10 seconds silently
        const intervalId = setInterval(() => {
            fetchPending(true);
        }, 10000);
        
        return () => clearInterval(intervalId);
    }, []);

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await API.put(`/employees/${id}/approve`);
            setPendingUsers(prev => prev.filter(u => u._id !== id));
        } catch (err) {
            console.error("Error approving user:", err);
            alert(err.response?.data?.message || "Failed to approve");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this application? This cannot be undone.")) return;
        setActionLoading(id);
        try {
            await API.delete(`/employees/${id}/reject`);
            setPendingUsers(prev => prev.filter(u => u._id !== id));
        } catch (err) {
            console.error("Error rejecting user:", err);
            alert(err.response?.data?.message || "Failed to reject");
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="font-display bg-background-dark text-slate-100 min-h-screen selection:bg-primary/30 relative overflow-hidden">
            <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
            <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>
            
            <div className="relative z-10 p-4 sm:p-8 lg:p-12">
                <div className="max-w-5xl mx-auto">
                <header className="mb-10">
                    <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase mb-2">Application Reviews</h2>
                    <p className="text-slate-400 text-lg">Manage and review pending employee applications.</p>
                </header>

                {/* Table Card */}
                <div className="glass-card rounded-2xl overflow-hidden mb-8">
                    {/* Table Header */}
                    <div className="hidden sm:grid grid-cols-[1fr_auto] p-6 border-b border-white/10 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div>Applicant</div>
                        <div className="text-right">Actions</div>
                    </div>

                    {/* Table Body */}
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4 block mx-auto" />
                            Loading pending applications...
                        </div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <CheckCircle2 className="w-10 h-10 mb-4 block text-accent-teal mx-auto" />
                            <p className="text-lg font-semibold text-white mb-1">All caught up!</p>
                            <p>No pending applications at the moment.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/10">
                            {pendingUsers.map((applicant) => (
                                <div
                                    key={applicant._id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 hover:bg-white/5 transition-colors gap-4"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-[#2d204a] border border-primary/30 flex items-center justify-center text-primary font-bold text-lg overflow-hidden">
                                            {applicant.profilePhotoUrl ? (
                                                <img src={applicant.profilePhotoUrl} alt={applicant.name} className="w-full h-full object-cover" />
                                            ) : (
                                                getInitials(applicant.name)
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-white font-bold text-base truncate">{applicant.name}</h3>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                                <p className="text-slate-400 text-sm truncate">{applicant.email}</p>
                                                <span className="hidden sm:inline text-slate-600 text-sm font-bold">•</span>
                                                <p className="text-slate-400 text-sm">{applicant.phone}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                                <span className="text-[10px] sm:text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-300 whitespace-nowrap">{applicant.dbRole}</span>
                                                <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">{applicant.department}</span>
                                                <span className="text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">{applicant.jobRole}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => handleApprove(applicant._id)}
                                            disabled={actionLoading === applicant._id}
                                            className="px-4 sm:px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-full border border-accent-teal/50 text-accent-teal hover:bg-accent-teal/10 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                                        >
                                            {actionLoading === applicant._id ? '...' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => handleReject(applicant._id)}
                                            disabled={actionLoading === applicant._id}
                                            className="px-4 sm:px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-full border border-rose-500/50 text-rose-500 hover:bg-rose-500/10 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Count */}
                {!loading && pendingUsers.length > 0 && (
                    <div className="flex items-center justify-between">
                        <p className="text-slate-400 text-sm">Showing {pendingUsers.length} pending application{pendingUsers.length !== 1 ? 's' : ''}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
    );
}
