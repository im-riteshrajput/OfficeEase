import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../data/api';

export default function Attendance() {
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clocking, setClocking] = useState(false);
    const [stats, setStats] = useState(null);
    const [activeTab, setActiveTab] = useState("logs"); // logs | leaves | regularizations
    const [myLeaves, setMyLeaves] = useState([]);
    const [myRegularizations, setMyRegularizations] = useState([]);

    // Leave Request Modal
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [leaveForm, setLeaveForm] = useState({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
    const [leaveSubmitting, setLeaveSubmitting] = useState(false);

    // Regularization Modal
    const [showRegModal, setShowRegModal] = useState(false);
    const [regForm, setRegForm] = useState({ date: "", requestType: "Missed Clock-In", requestedClockIn: "", requestedClockOut: "", reason: "" });
    const [regSubmitting, setRegSubmitting] = useState(false);

    // Confirmation Modals
    const [showClockInConfirm, setShowClockInConfirm] = useState(false);
    const [showClockOutConfirm, setShowClockOutConfirm] = useState(false);

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : { name: "Employee", jobRole: "Staff" };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await API.get("/attendance/me");
            if (res.data.success) setLogs(res.data.data);
        } catch (error) {
            console.error("Error fetching logs:", error);
            if (error.response?.status === 401) navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await API.get("/attendance/my-stats");
            if (res.data.success) setStats(res.data.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchMyLeaves = async () => {
        try {
            const res = await API.get("/leaves/me");
            if (res.data.success) setMyLeaves(res.data.data);
        } catch (error) {
            console.error("Error fetching leaves:", error);
        }
    };

    const fetchMyRegularizations = async () => {
        try {
            const res = await API.get("/regularizations/me");
            if (res.data.success) setMyRegularizations(res.data.data);
        } catch (error) {
            console.error("Error fetching regularizations:", error);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchStats();
        fetchMyLeaves();
        fetchMyRegularizations();
    }, []);

    const handleClockIn = async () => {
        setClocking(true);
        try {
            const res = await API.post("/attendance/clock-in");
            if (res.data.success) { 
                fetchLogs(); 
                fetchStats(); 
                setShowClockInConfirm(false);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to clock in");
            setShowClockInConfirm(false);
        } finally { setClocking(false); }
    };

    const handleClockOut = async () => {
        setClocking(true);
        try {
            const res = await API.post("/attendance/clock-out");
            if (res.data.success) { 
                fetchLogs(); 
                fetchStats(); 
                setShowClockOutConfirm(false);
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to clock out");
            setShowClockOutConfirm(false);
        } finally { setClocking(false); }
    };

    const handleLeaveSubmit = async (e) => {
        e.preventDefault();
        setLeaveSubmitting(true);
        try {
            const res = await API.post("/leaves/apply", leaveForm);
            if (res.data.success) {
                setShowLeaveModal(false);
                setLeaveForm({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
                fetchMyLeaves();
                fetchStats();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit leave");
        } finally { setLeaveSubmitting(false); }
    };

    const handleRegSubmit = async (e) => {
        e.preventDefault();
        setRegSubmitting(true);
        try {
            const res = await API.post("/regularizations/request", regForm);
            if (res.data.success) {
                setShowRegModal(false);
                setRegForm({ date: "", requestType: "Missed Clock-In", requestedClockIn: "", requestedClockOut: "", reason: "" });
                fetchMyRegularizations();
            }
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit request");
        } finally { setRegSubmitting(false); }
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = logs.find(log => log.date === todayStr);
    const hasClockedIn = !!todayLog;
    const hasClockedOut = hasClockedIn && !!todayLog.clockOut;

    const formatTime = (dateStr) => {
        if (!dateStr) return "--:--";
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const calculateTotalHours = (clockIn, clockOut) => {
        if (!clockIn || !clockOut) return "--";
        const diffMs = new Date(clockOut) - new Date(clockIn);
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHrs}h ${diffMins}m`;
    };

    const weeklyHours = stats?.weekly?.totalHours?.toFixed(1) || "0.0";
    const weeklyOvertime = stats?.weekly?.totalOvertime?.toFixed(1) || "0.0";
    const totalLeaveRemaining = stats?.leaves?.totalRemaining ?? "--";

    const statusBadge = (status) => {
        const cfg = {
            Pending: "bg-amber-500/10 border-amber-500/30 text-amber-400",
            Approved: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
            Rejected: "bg-rose-500/10 border-rose-500/30 text-rose-400",
        };
        return cfg[status] || cfg.Pending;
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 text-sm";
    const selectClass = `${inputClass} appearance-none cursor-pointer`;

    return (
        <div className="font-display bg-background-dark text-slate-100 min-h-screen selection:bg-primary/30 relative overflow-hidden">
            <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
            <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>
            
            <div className="relative z-10 p-4 sm:p-8 lg:p-12">
                <div className="max-w-5xl mx-auto">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Attendance</h1>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                                <span>{currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4 gap-8 backdrop-blur-md w-full md:w-auto overflow-x-auto custom-scrollbar">
                            <div>
                                <p className="text-[10px] font-bold text-purple-400 tracking-widest uppercase mb-1">Current Time</p>
                                <p className="text-3xl font-bold text-white leading-none whitespace-nowrap">{formatTime(currentTime)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Grid Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

                        {/* Clock In/Out Card */}
                        <div className="lg:col-span-2 glass-card border border-white/10 rounded-[32px] p-6 lg:p-10 flex flex-col items-center justify-center relative overflow-hidden min-h-[400px]">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl z-10 backdrop-blur-md">
                                <span className={`material-symbols-outlined text-4xl ${hasClockedIn && !hasClockedOut ? 'text-amber-400' : hasClockedOut ? 'text-emerald-400' : 'text-purple-400'}`}>
                                    {hasClockedIn && !hasClockedOut ? 'history_toggle_off' : hasClockedOut ? 'check_circle' : 'fingerprint'}
                                </span>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2 z-10 text-center">
                                {!hasClockedIn ? "Ready to start your shift?" : (!hasClockedOut ? "Currently on shift" : "Shift Completed")}
                            </h2>
                            <p className="text-slate-400 text-sm mb-10 z-10 text-center max-w-md">
                                {!hasClockedIn
                                    ? `Good morning, ${user.name?.split(' ')[0] || 'Employee'}. Tap the button below to clock in.`
                                    : (!hasClockedOut
                                        ? `You clocked in at ${formatTime(todayLog.clockIn)}. Don't forget to clock out.`
                                        : `Great job today! You clocked out at ${formatTime(todayLog.clockOut)}.`)}
                            </p>

                            {!hasClockedIn && (
                                <button onClick={() => setShowClockInConfirm(true)} disabled={clocking} className="relative group z-10">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                                    <div className="relative px-8 lg:px-12 py-4 bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full flex items-center gap-3 text-white font-bold text-lg shadow-xl shadow-purple-500/20 hover:scale-[1.02] transition-transform">
                                        <span className="material-symbols-outlined">login</span>
                                        CLOCK IN
                                    </div>
                                </button>
                            )}

                            {hasClockedIn && !hasClockedOut && (
                                <button onClick={() => setShowClockOutConfirm(true)} disabled={clocking} className="relative group z-10">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-orange-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-200"></div>
                                    <div className="relative px-8 lg:px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full flex items-center gap-3 text-white font-bold text-lg shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-transform">
                                        <span className="material-symbols-outlined">logout</span>
                                        CLOCK OUT
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div className="flex flex-col gap-6">
                            {/* Weekly Hours */}
                            <div className="glass-card border border-white/10 rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col justify-center">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <span className="material-symbols-outlined">schedule</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Target 40h</span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-1">Weekly Hours</p>
                                <p className="text-2xl font-bold text-white">{weeklyHours} <span className="text-slate-500 text-xl">/ 40</span></p>
                            </div>

                            {/* Overtime */}
                            <div className="glass-card border border-white/10 rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col justify-center">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-400"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                        <span className="material-symbols-outlined">trending_up</span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold tracking-widest uppercase">This Week</span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-1">Overtime</p>
                                <p className="text-2xl font-bold text-white">{weeklyOvertime}h</p>
                            </div>

                            {/* Remaining Leave */}
                            <div className="glass-card border border-white/10 rounded-2xl p-6 relative overflow-hidden flex-1 flex flex-col justify-center">
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <span className="material-symbols-outlined">beach_access</span>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase">Accrued</span>
                                </div>
                                <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-1">Remaining Leave</p>
                                <p className="text-2xl font-bold text-white">{totalLeaveRemaining} Days</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button onClick={() => setShowLeaveModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors font-bold text-sm">
                            <span className="material-symbols-outlined text-[20px]">event_busy</span>
                            Apply for Leave
                        </button>
                        <button onClick={() => setShowRegModal(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors font-bold text-sm">
                            <span className="material-symbols-outlined text-[20px]">edit_note</span>
                            Request Regularization
                        </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
                        {[
                            { key: "logs", label: "Attendance Logs", icon: "list_alt" },
                            { key: "leaves", label: "Leave History", icon: "beach_access" },
                            { key: "regularizations", label: "Regularizations", icon: "edit_note" },
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
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="glass-card border border-white/10 rounded-[24px] overflow-hidden">
                        {/* Attendance Logs Tab */}
                        {activeTab === "logs" && (
                            <>
                                <div className="p-4 lg:p-6 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">Attendance Logs</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="glass-panel border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="px-6 py-4 font-bold">Date</th>
                                                <th className="px-6 py-4 font-bold">Check-In</th>
                                                <th className="px-6 py-4 font-bold">Check-Out</th>
                                                <th className="px-6 py-4 font-bold">Total Hours</th>
                                                <th className="px-6 py-4 font-bold">Overtime</th>
                                                <th className="px-6 py-4 font-bold text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-white/5">
                                            {loading ? (
                                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading logs...</td></tr>
                                            ) : logs.length === 0 ? (
                                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">No attendance records found.</td></tr>
                                            ) : (
                                                logs.map((log) => (
                                                    <tr key={log._id} className="hover:bg-white/[0.05] transition-colors">
                                                        <td className="px-6 py-5 font-bold text-white">
                                                            {new Date(log.date).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-5 text-slate-300">{formatTime(log.clockIn)}</td>
                                                        <td className="px-6 py-5 text-slate-300">{formatTime(log.clockOut)}</td>
                                                        <td className="px-6 py-5 text-slate-300">{calculateTotalHours(log.clockIn, log.clockOut)}</td>
                                                        <td className="px-6 py-5 text-cyan-400 font-medium">{log.overtimeHours ? `${log.overtimeHours}h` : "--"}</td>
                                                        <td className="px-6 py-5 text-right">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                                                                log.status === 'Present' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                                                                : log.status === 'Late' ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                                                : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                                                            }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Present' ? 'bg-emerald-400' : log.status === 'Late' ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Leave History Tab */}
                        {activeTab === "leaves" && (
                            <>
                                <div className="p-4 lg:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">Leave History</h3>
                                    {stats?.leaves?.balance && (
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(stats.leaves.balance).filter(([t]) => t !== "Unpaid").map(([type, info]) => (
                                                <span key={type} className="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                                                    {type}: <span className="text-white">{info.remaining}</span>/{info.total}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="glass-panel border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">From</th>
                                                <th className="px-6 py-4">To</th>
                                                <th className="px-6 py-4">Days</th>
                                                <th className="px-6 py-4">Reason</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-white/5">
                                            {myLeaves.length === 0 ? (
                                                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">No leave requests found.</td></tr>
                                            ) : (
                                                myLeaves.map((leave) => {
                                                    const days = Math.floor((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1;
                                                    return (
                                                        <tr key={leave._id} className="hover:bg-white/[0.05] transition-colors">
                                                            <td className="px-6 py-5 font-bold text-white">{leave.leaveType}</td>
                                                            <td className="px-6 py-5 text-slate-300">{new Date(leave.startDate).toLocaleDateString([], { day: 'numeric', month: 'short' })}</td>
                                                            <td className="px-6 py-5 text-slate-300">{new Date(leave.endDate).toLocaleDateString([], { day: 'numeric', month: 'short' })}</td>
                                                            <td className="px-6 py-5 text-white font-medium">{days}</td>
                                                            <td className="px-6 py-5 text-slate-300 max-w-[200px] truncate">{leave.reason}</td>
                                                            <td className="px-6 py-5 text-right">
                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${statusBadge(leave.status)}`}>
                                                                    {leave.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* Regularizations Tab */}
                        {activeTab === "regularizations" && (
                            <>
                                <div className="p-4 lg:p-6 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">Regularization Requests</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="glass-panel border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Type</th>
                                                <th className="px-6 py-4">Requested Time</th>
                                                <th className="px-6 py-4">Reason</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm divide-y divide-white/5">
                                            {myRegularizations.length === 0 ? (
                                                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No regularization requests found.</td></tr>
                                            ) : (
                                                myRegularizations.map((req) => (
                                                    <tr key={req._id} className="hover:bg-white/[0.05] transition-colors">
                                                        <td className="px-6 py-5 font-bold text-white">{new Date(req.date).toLocaleDateString([], { day: 'numeric', month: 'short' })}</td>
                                                        <td className="px-6 py-5 text-slate-300">{req.requestType}</td>
                                                        <td className="px-6 py-5 text-slate-300">
                                                            {req.requestedClockIn && `In: ${req.requestedClockIn}`}
                                                            {req.requestedClockIn && req.requestedClockOut && " | "}
                                                            {req.requestedClockOut && `Out: ${req.requestedClockOut}`}
                                                            {!req.requestedClockIn && !req.requestedClockOut && "--"}
                                                        </td>
                                                        <td className="px-6 py-5 text-slate-300 max-w-[200px] truncate">{req.reason}</td>
                                                        <td className="px-6 py-5 text-right">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${statusBadge(req.status)}`}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ======== LEAVE REQUEST MODAL ======== */}
            {showLeaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowLeaveModal(false)}>
                    <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg relative animate-fade-in" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowLeaveModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-400">event_busy</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">Apply for Leave</h2>
                        </div>
                        <form onSubmit={handleLeaveSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">Leave Type</label>
                                <select className={selectClass} value={leaveForm.leaveType} onChange={e => setLeaveForm({...leaveForm, leaveType: e.target.value})}>
                                    <option value="Casual" className="bg-slate-800">Casual Leave</option>
                                    <option value="Sick" className="bg-slate-800">Sick Leave</option>
                                    <option value="Paid" className="bg-slate-800">Paid Leave</option>
                                    <option value="Unpaid" className="bg-slate-800">Unpaid Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">Start Date</label>
                                    <input type="date" required className={inputClass} value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">End Date</label>
                                    <input type="date" required className={inputClass} value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">Reason</label>
                                <textarea required rows={3} className={`${inputClass} resize-none`} placeholder="Provide a reason..." value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} />
                            </div>
                            <button type="submit" disabled={leaveSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-blue-500/20">
                                {leaveSubmitting ? "Submitting..." : "Submit Leave Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ======== REGULARIZATION MODAL ======== */}
            {showRegModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowRegModal(false)}>
                    <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-lg relative animate-fade-in" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowRegModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-amber-400">edit_note</span>
                            </div>
                            <h2 className="text-xl font-bold text-white">Request Regularization</h2>
                        </div>
                        <form onSubmit={handleRegSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">Date</label>
                                <input type="date" required className={inputClass} value={regForm.date} onChange={e => setRegForm({...regForm, date: e.target.value})} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">Request Type</label>
                                <select className={selectClass} value={regForm.requestType} onChange={e => setRegForm({...regForm, requestType: e.target.value})}>
                                    <option value="Missed Clock-In" className="bg-slate-800">Missed Clock-In</option>
                                    <option value="Missed Clock-Out" className="bg-slate-800">Missed Clock-Out</option>
                                    <option value="Wrong Time" className="bg-slate-800">Wrong Time</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">Correct Clock-In</label>
                                    <input type="time" className={inputClass} value={regForm.requestedClockIn} onChange={e => setRegForm({...regForm, requestedClockIn: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">Correct Clock-Out</label>
                                    <input type="time" className={inputClass} value={regForm.requestedClockOut} onChange={e => setRegForm({...regForm, requestedClockOut: e.target.value})} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2 block">Reason</label>
                                <textarea required rows={3} className={`${inputClass} resize-none`} placeholder="Explain why correction is needed..." value={regForm.reason} onChange={e => setRegForm({...regForm, reason: e.target.value})} />
                            </div>
                            <button type="submit" disabled={regSubmitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-amber-500/20">
                                {regSubmitting ? "Submitting..." : "Submit Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ======== CLOCK IN CONFIRM MODAL ======== */}
            {showClockInConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowClockInConfirm(false)}>
                    <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center relative animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-purple-400 text-3xl">login</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Confirm Clock In</h2>
                        <p className="text-slate-400 text-sm mb-6">Are you sure you want to clock in now? The time recorded will be <span className="text-white font-bold">{formatTime(currentTime)}</span>.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowClockInConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleClockIn} disabled={clocking} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                                {clocking ? "Clocking In..." : "Yes, Clock In"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ======== CLOCK OUT CONFIRM MODAL ======== */}
            {showClockOutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowClockOutConfirm(false)}>
                    <div className="glass-card border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center relative animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-amber-400 text-3xl">logout</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Confirm Clock Out</h2>
                        <p className="text-slate-400 text-sm mb-6">Are you sure you want to clock out? Ensure your shift is complete or you may be marked for a Half Day.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowClockOutConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleClockOut} disabled={clocking} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                                {clocking ? "Clocking Out..." : "Yes, Clock Out"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
