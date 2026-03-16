import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../data/api';

export default function AttendanceReview() {
    const navigate = useNavigate();
    
    // Core state
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState("today"); // today | leaves | regularizations
    
    // Data states
    const [todayLogs, setTodayLogs] = useState([]);
    const [allLeaves, setAllLeaves] = useState([]);
    const [allRegularizations, setAllRegularizations] = useState([]);
    
    // Filters
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [loading, setLoading] = useState(true);

    // Modals
    const [selectedEmployee, setSelectedEmployee] = useState(null); // For history modal
    const [employeeHistory, setEmployeeHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const formatTime = (dateStr) => {
        if (!dateStr) return "--:--";
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const statusBadge = (status) => {
        const cfg = {
            Pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
            Approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
            Rejected: "bg-rose-500/10 border-rose-500/30 text-rose-400",
            Present: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
            Late: "bg-amber-500/10 border-amber-500/30 text-amber-400",
            Absent: "bg-rose-500/10 border-rose-500/30 text-rose-400"
        };
        return cfg[status] || cfg.Pending;
    };

    // --- Data Fetching ---
    
    const fetchTeamStats = async (date) => {
        try {
            const res = await API.get(`/attendance/team-stats?date=${date}`);
            if (res.data.success) setStats(res.data.data);
        } catch (err) { console.error("Error fetching stats:", err); }
    };

    const fetchTodayLogs = async (date) => {
        setLoading(true);
        try {
            const res = await API.get(`/attendance/all?date=${date}`);
            if (res.data.success) setTodayLogs(res.data.data);
        } catch (err) { 
            console.error("Error fetching today logs:", err); 
            if (err.response?.status === 401) navigate("/login");
        } finally { setLoading(false); }
    };

    const fetchAllLeaves = async () => {
        setLoading(true);
        try {
            const res = await API.get("/leaves/all");
            if (res.data.success) setAllLeaves(res.data.data);
        } catch (err) { console.error("Error fetching leaves:", err); } 
        finally { setLoading(false); }
    };

    const fetchAllRegularizations = async () => {
        setLoading(true);
        try {
            const res = await API.get("/regularizations/all");
            if (res.data.success) setAllRegularizations(res.data.data);
        } catch (err) { console.error("Error fetching regularizations:", err); }
        finally { setLoading(false); }
    };

    // Load initial data based on tab/date
    useEffect(() => {
        if (activeTab === "today") {
            fetchTeamStats(dateFilter);
            fetchTodayLogs(dateFilter);
        } else if (activeTab === "leaves") {
            fetchAllLeaves();
        } else if (activeTab === "regularizations") {
            fetchAllRegularizations();
        }
    }, [activeTab, dateFilter]);


    // --- Actions ---

    const handleExportCSV = async () => {
        try {
            const res = await API.get(`/attendance/export?date=${dateFilter}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${dateFilter}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Failed to export:", err);
            alert("Failed to export CSV");
        }
    };

    const handleReviewLeave = async (id, status) => {
        try {
            const res = await API.put(`/leaves/${id}/review`, { status });
            if (res.data.success) {
                fetchAllLeaves();
                if (dateFilter === new Date().toISOString().split('T')[0]) fetchTeamStats(dateFilter);
            }
        } catch (err) { alert(err.response?.data?.message || "Error reviewing leave"); }
    };

    const handleReviewRegularization = async (id, status) => {
        try {
            const res = await API.put(`/regularizations/${id}/review`, { status });
            if (res.data.success) {
                fetchAllRegularizations();
                if (activeTab === "today") fetchTodayLogs(dateFilter);
            }
        } catch (err) { alert(err.response?.data?.message || "Error reviewing request"); }
    };

    const openEmployeeHistory = async (employee) => {
        setSelectedEmployee(employee);
        setHistoryLoading(true);
        try {
            // Fetch last 30 days
            const to = new Date().toISOString().split('T')[0];
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 30);
            const from = fromDate.toISOString().split('T')[0];
            
            const res = await API.get(`/attendance/employee/${employee._id || employee.id}?from=${from}&to=${to}`);
            if (res.data.success) setEmployeeHistory(res.data.data.logs);
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    // --- Filter logic ---
    const filteredLogs = todayLogs.filter(log => {
        const uName = log.user?.name || "";
        return uName.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    const filteredLeaves = allLeaves.filter(req => {
        const uName = req.user?.name || "";
        return uName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const filteredRegs = allRegularizations.filter(req => {
        const uName = req.user?.name || "";
        return uName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="font-display bg-background-dark text-slate-100 min-h-screen selection:bg-primary/30 relative overflow-hidden">
            <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
            <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>

            <div className="relative z-10 p-4 sm:p-8 lg:p-12">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Attendance Review</h1>
                            <p className="text-slate-400 text-base">Monitor team presence and leave requests in real-time.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                           <input 
                                type="date" 
                                value={dateFilter} 
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none min-w-[150px]"
                            />
                            <Link
                                to="/attendance"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-bold shadow-[0_0_20px_rgba(124,59,237,0.4)] hover:shadow-[0_0_30px_rgba(124,59,237,0.6)] transition-all text-sm justify-center"
                            >
                                <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                                My Attendance
                            </Link>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                        <div className="glass-card border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <span className="material-symbols-outlined text-purple-400">group</span>
                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-white/5 px-2 py-1 rounded-md">Live</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Total Present</p>
                            <p className="text-4xl font-bold text-white leading-none">{stats?.present || 0} <span className="text-xl text-slate-500">/ {stats?.totalEmployees || 0}</span></p>
                        </div>
                        <div className="glass-card border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <span className="material-symbols-outlined text-amber-400">schedule</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Late Today</p>
                            <p className="text-4xl font-bold text-white leading-none">{stats?.late || 0}</p>
                        </div>
                        <div className="glass-card border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <span className="material-symbols-outlined text-blue-400">calendar_today</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400 mb-1">On Leave</p>
                            <p className="text-4xl font-bold text-white leading-none">{stats?.onLeave || 0}</p>
                        </div>
                        <div className="glass-card border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col">
                            <div className="flex justify-between items-start mb-6">
                                <span className="material-symbols-outlined text-emerald-400">bar_chart</span>
                            </div>
                            <p className="text-sm font-medium text-slate-400 mb-1">Attendance Rate</p>
                            <p className="text-4xl font-bold text-white leading-none">{stats?.attendanceRate || "0%"}</p>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap gap-1 mb-6 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                        {[
                            { key: "today", label: "Daily Logs", icon: "today" },
                            { key: "leaves", label: "Leave Requests", icon: "beach_access" },
                            { key: "regularizations", label: "Regularization Specs", icon: "edit_note" },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                    activeTab === tab.key
                                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                                <span>{tab.label}</span>
                                {tab.key === "leaves" && allLeaves.filter(l => l.status === "Pending").length > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                                        {allLeaves.filter(l => l.status === "Pending").length}
                                    </span>
                                )}
                                {tab.key === "regularizations" && allRegularizations.filter(l => l.status === "Pending").length > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                                        {allRegularizations.filter(l => l.status === "Pending").length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="glass-card border border-white/10 rounded-[24px] overflow-hidden">
                        <div className="p-4 lg:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <h3 className="text-xl font-bold text-white uppercase tracking-wide">
                                {activeTab === "today" ? `Logs for ${new Date(dateFilter).toLocaleDateString()}` : activeTab === "leaves" ? "Manage Leave Requests" : "Manage Regularizations"}
                            </h3>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <div className="relative flex-1 sm:flex-none">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search employee..."
                                        className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 w-full sm:w-64"
                                    />
                                </div>
                                {activeTab === "today" && (
                                    <button onClick={handleExportCSV} title="Export CSV for Date" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors shrink-0">
                                        <span className="material-symbols-outlined text-[20px]">download</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    {activeTab === "today" && (
                                        <tr className="glass-panel border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4">Department</th>
                                            <th className="px-6 py-4">Check-In</th>
                                            <th className="px-6 py-4">Check-Out</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    )}
                                    {activeTab === "leaves" && (
                                        <tr className="glass-panel border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4">Type</th>
                                            <th className="px-6 py-4">Dates</th>
                                            <th className="px-6 py-4">Reason</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    )}
                                    {activeTab === "regularizations" && (
                                        <tr className="glass-panel border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="px-6 py-4">Employee</th>
                                            <th className="px-6 py-4">Date / Type</th>
                                            <th className="px-6 py-4">Requested Time</th>
                                            <th className="px-6 py-4">Reason</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {loading ? (
                                        <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading records...</td></tr>
                                    ) : activeTab === "today" && filteredLogs.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">No attendance records found for this date.</td></tr>
                                    ) : activeTab === "leaves" && filteredLeaves.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No leave requests found.</td></tr>
                                    ) : activeTab === "regularizations" && filteredRegs.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No regularization requests found.</td></tr>
                                    ) : activeTab === "today" ? (
                                        filteredLogs.map((log) => {
                                            const uName = log.user?.name || "Unknown Employee";
                                            const uEmail = log.user?.email || "N/A";
                                            const uDept = log.user?.department || "N/A";
                                            return (
                                                <tr key={log._id} className="hover:bg-white/[0.05] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 p-0.5 shrink-0 overflow-hidden">
                                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${uName}`} alt={uName} className="w-full h-full rounded-full object-cover" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="font-bold text-white truncate">{uName}</p>
                                                                <p className="text-xs text-slate-400 truncate">{uEmail}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300">{uDept}</td>
                                                    <td className="px-6 py-4 text-slate-300">{formatTime(log.clockIn)}</td>
                                                    <td className="px-6 py-4 text-slate-300">{formatTime(log.clockOut)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${statusBadge(log.status)}`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => openEmployeeHistory(log.user)}
                                                            className="text-[11px] font-bold text-purple-400 hover:text-purple-300 tracking-widest uppercase flex items-center justify-end gap-1 w-full group"
                                                        >
                                                            <span>History</span>
                                                            <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">history</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : activeTab === "leaves" ? (
                                        filteredLeaves.map((leave) => {
                                            const uName = leave.user?.name || "Unknown Employee";
                                            const days = Math.floor((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                                            return (
                                                <tr key={leave._id} className="hover:bg-white/[0.05] transition-colors">
                                                    <td className="px-6 py-4 font-bold text-white">{uName}</td>
                                                    <td className="px-6 py-4 text-slate-300">{leave.leaveType}</td>
                                                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                                                        {new Date(leave.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(leave.endDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        <span className="ml-2 text-xs text-slate-500 font-bold">({days}d)</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300 max-w-[200px] truncate" title={leave.reason}>{leave.reason}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {leave.status === "Pending" ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => handleReviewLeave(leave._id, "Approved")} className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors" title="Approve">
                                                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                                                </button>
                                                                <button onClick={() => handleReviewLeave(leave._id, "Rejected")} className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-colors" title="Reject">
                                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${statusBadge(leave.status)}`}>
                                                                {leave.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        filteredRegs.map((req) => {
                                            const uName = req.user?.name || "Unknown Employee";
                                            return (
                                                <tr key={req._id} className="hover:bg-white/[0.05] transition-colors">
                                                    <td className="px-6 py-4 font-bold text-white">{uName}</td>
                                                    <td className="px-6 py-4 text-slate-300">
                                                        <span className="font-bold text-white block mb-1">{new Date(req.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span>
                                                        <span className="text-xs">{req.requestType}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300 whitespace-nowrap text-xs">
                                                        {req.requestedClockIn && `In: ${req.requestedClockIn}`}
                                                        {req.requestedClockIn && req.requestedClockOut && " | "}
                                                        {req.requestedClockOut && `Out: ${req.requestedClockOut}`}
                                                        {!req.requestedClockIn && !req.requestedClockOut && "--"}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-300 max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {req.status === "Pending" ? (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => handleReviewRegularization(req._id, "Approved")} className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/20 transition-colors" title="Approve">
                                                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                                                </button>
                                                                <button onClick={() => handleReviewRegularization(req._id, "Rejected")} className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-colors" title="Reject">
                                                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${statusBadge(req.status)}`}>
                                                                {req.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="p-4 lg:p-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                                Showing {activeTab === "today" ? filteredLogs.length : activeTab === "leaves" ? filteredLeaves.length : filteredRegs.length} Records
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ======== EMPLOYEE HISTORY MODAL ======== */}
            {selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedEmployee(null)}>
                    <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] flex flex-col relative animate-fade-in" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedEmployee(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 p-1 shrink-0">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedEmployee.name}`} alt={selectedEmployee.name} className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{selectedEmployee.name}</h1>
                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedEmployee.department} — {selectedEmployee.jobRole}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                            <h3 className="text-lg font-bold text-white uppercase tracking-wide mb-4">Last 30 Days History</h3>
                            {historyLoading ? (
                                <p className="text-center text-slate-400 py-8">Loading history...</p>
                            ) : employeeHistory.length === 0 ? (
                                <p className="text-center text-slate-400 py-8">No attendance records found in the last 30 days.</p>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                            <th className="py-3 font-bold">Date</th>
                                            <th className="py-3 font-bold">In / Out</th>
                                            <th className="py-3 font-bold">Overtime</th>
                                            <th className="py-3 font-bold text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-white/5">
                                        {employeeHistory.map((log) => (
                                            <tr key={log._id}>
                                                <td className="py-3 font-bold text-white">{new Date(log.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                                                <td className="py-3 text-slate-300">
                                                    {formatTime(log.clockIn)} - {formatTime(log.clockOut)}
                                                </td>
                                                <td className="py-3 text-cyan-400 font-medium">{log.overtimeHours ? `${log.overtimeHours}h` : "--"}</td>
                                                <td className="py-3 text-right">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${statusBadge(log.status)}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Present' ? 'bg-emerald-400' : log.status === 'Late' ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
