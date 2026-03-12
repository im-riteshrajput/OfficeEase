import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, Shield, Edit3, Save, X, UserCircle } from 'lucide-react';

export default function EmployeeProfile({ employees = [] }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        if (id) {
            // Viewing another employee's profile (Admin/HR route: /employee/:id)
            const found = employees.find(emp => (emp._id || emp.id) === id);
            if (found) {
                setProfileData(found);
                setIsOwnProfile(false);
            }
        } else {
            // Viewing own profile (/profile)
            const storedUser = localStorage.getItem("user");
            if (storedUser && storedUser !== "undefined") {
                try {
                    const parsed = JSON.parse(storedUser);
                    setProfileData(parsed);
                    setIsOwnProfile(true);
                } catch (e) {
                    console.error("Error parsing user:", e);
                }
            }
        }
    }, [id, employees]);

    const handleEditStart = () => {
        setEditForm({
            name: profileData?.name || "",
            phone: profileData?.phone || "",
            jobRole: profileData?.jobRole || "",
            department: profileData?.department || "",
        });
        setEditing(true);
    };

    const handleEditSave = () => {
        const updated = { ...profileData, ...editForm };
        setProfileData(updated);
        if (isOwnProfile) {
            localStorage.setItem("user", JSON.stringify(updated));
        }
        setEditing(false);
    };

    const handleEditCancel = () => {
        setEditing(false);
        setEditForm({});
    };

    if (!profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-400 text-lg">Loading profile...</p>
            </div>
        );
    }

    const statusConfig = {
        active: { label: "Active", color: "bg-emerald-500", text: "text-emerald-400", glow: "shadow-emerald-500/30" },
        onleave: { label: "On Leave", color: "bg-amber-500", text: "text-amber-400", glow: "shadow-amber-500/30" },
        inactive: { label: "Inactive", color: "bg-rose-500", text: "text-rose-400", glow: "shadow-rose-500/30" }
    };
    const status = statusConfig[profileData.estatus] || statusConfig.active;

    return (
        <div className="font-display text-slate-100 min-h-screen p-8 lg:p-12 ml-[260px]">
            {/* Header */}
            <header className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                    {id && (
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-xl liquid-glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tight neon-glow-purple">
                            {isOwnProfile ? "My Profile" : "Employee Profile"}
                        </h2>
                        <p className="text-slate-400 text-lg mt-2">
                            {isOwnProfile ? "View and manage your profile details." : `Viewing ${profileData.name}'s profile.`}
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-8 max-w-[1100px]">
                {/* Profile Header Card */}
                <div className="liquid-glass rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Shield className="w-32 h-32 text-white" />
                    </div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="relative">
                            <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_20px_rgba(124,59,237,0.3)] flex items-center justify-center bg-white/5">
                                <UserCircle className="w-full h-full text-slate-400" strokeWidth={1} />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#1a1625] ${status.color} shadow-lg ${status.glow}`}></div>
                        </div>

                        <div>
                            {editing ? (
                                <input
                                    className="text-2xl font-black text-white tracking-tight bg-white/5 border border-white/10 rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary/50 mb-1"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            ) : (
                                <h1 className="text-3xl font-black text-white tracking-tight mb-1">{profileData.name}</h1>
                            )}
                            <p className="text-primary font-bold mb-2">{profileData.jobRole || "Team Member"}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4" />
                                    {profileData.department}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Shield className="w-4 h-4" />
                                    {profileData.dbRole}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 md:mt-0 relative z-10">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleEditSave}
                                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                                <button
                                    onClick={handleEditCancel}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            isOwnProfile && (
                                <button
                                    onClick={handleEditStart}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(124,59,237,0.4)] text-sm"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <div className="liquid-glass rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <UserCircle className="w-24 h-24 text-white" />
                        </div>

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-accent-teal/20 flex items-center justify-center shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                                <Mail className="w-5 h-5 text-teal-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Personal Information</h2>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Email Address</p>
                                <p className="text-white font-medium">{profileData.email}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Phone Number</p>
                                {editing ? (
                                    <input
                                        className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 w-full"
                                        value={editForm.phone}
                                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-white font-medium">{profileData.phone || "Not provided"}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Alternative Phone</p>
                                <p className="text-white font-medium">{profileData.altphone || "Not provided"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Status</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                    <span className={`text-sm font-semibold ${status.text}`}>{status.label}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="liquid-glass rounded-3xl p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Briefcase className="w-24 h-24 text-white" />
                        </div>

                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                                <Briefcase className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Professional Details</h2>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Job Role</p>
                                    {editing ? (
                                        <input
                                            className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 w-full"
                                            value={editForm.jobRole}
                                            onChange={(e) => setEditForm({ ...editForm, jobRole: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-white font-medium">{profileData.jobRole || "N/A"}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">System Role</p>
                                    <p className="text-white font-medium">{profileData.dbRole}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Department</p>
                                {editing ? (
                                    <input
                                        className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 w-full"
                                        value={editForm.department}
                                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                    />
                                ) : (
                                    <p className="text-white font-medium">{profileData.department}</p>
                                )}
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Join Date</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <p className="text-white font-medium">
                                        {profileData.joinDate
                                            ? new Date(profileData.joinDate?.$date || profileData.joinDate).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Employee ID</p>
                                <p className="text-white font-medium font-mono text-sm">{profileData._id || profileData.id || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
