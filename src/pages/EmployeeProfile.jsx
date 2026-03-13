import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, Shield, Edit3, Save, X, UserCircle, MapPin, Sparkles } from 'lucide-react';
import { getInitials } from '../utils/helpers';

export default function EmployeeProfile({ employees = [], onEdit }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser && storedUser !== "undefined") {
            try {
                setCurrentUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user:", e);
            }
        }
    }, []);

    const isAdmin = currentUser?.dbRole === "Admin";
    const isHR = currentUser?.dbRole === "Human Resources";
    const isAdminOrHR = isAdmin || isHR;

    // Status edit permission logic:
    // Admin -> can change everyone's status
    // HR -> can change others' status, but NOT their own
    // Employee -> cannot change any status
    const canEditStatus = isAdmin || (isHR && !isOwnProfile);

    const DEPARTMENTS = ["Engineering", "Design", "Marketing", "Human Resources", "Sales"];

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
            dbRole: profileData?.dbRole || "Employee",
            jobRole: profileData?.jobRole || "",
            department: profileData?.department || "",
            address: profileData?.address || "",
            skills: profileData?.skills || "",
            estatus: profileData?.estatus || "active",
        });
        setEditing(true);
    };

    const handleEditSave = async () => {
        const updated = { ...profileData, ...editForm };
        
        try {
            if (onEdit) {
                await onEdit(updated);
            }
            
            setProfileData(updated);
            if (isOwnProfile) {
                localStorage.setItem("user", JSON.stringify(updated));
            }
            setEditing(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
            // Optionally add error handling UI here
        }
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
        <div className="font-display bg-background-dark text-slate-100 min-h-screen selection:bg-primary/30 relative overflow-hidden">
            <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
            <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>
            
            <div className="relative z-10 p-8 lg:p-12">
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
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight neon-glow-purple leading-tight">
                            {isOwnProfile ? "My Profile" : "Employee Profile"}
                        </h2>
                        <p className="text-slate-400 text-sm md:text-lg mt-1 md:mt-2">
                            {isOwnProfile ? "View and manage your profile details." : `Viewing ${profileData.name}'s profile.`}
                        </p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-8 max-w-[1100px]">
                {/* Profile Header Card */}
                <div className="liquid-glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Shield className="w-32 h-32 md:w-48 md:h-48 text-white" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_20px_rgba(124,59,237,0.3)] flex items-center justify-center bg-primary/20 text-primary font-black text-4xl">
                                {getInitials(profileData.name)}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#1a1625] ${status.color} shadow-lg ${status.glow}`}></div>
                        </div>

                        <div className="text-center md:text-left flex flex-col items-center md:items-start w-full md:w-auto">
                            {editing ? (
                                <input
                                    className="text-2xl font-black text-white tracking-tight bg-white/5 border border-white/10 rounded-xl px-3 py-1 outline-none focus:ring-2 focus:ring-primary/50 mb-1 w-full text-center md:text-left"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            ) : (
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-1">{profileData.name}</h1>
                            )}
                            <p className="text-primary font-bold mb-3 md:mb-2">{profileData.jobRole || "Team Member"}</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-4 text-sm text-slate-400 font-medium">
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

                    <div className="flex flex-col sm:flex-row gap-3 mt-6 md:mt-0 relative z-10 w-full md:w-auto">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleEditSave}
                                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold transition-colors text-sm w-full md:w-auto"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                                <button
                                    onClick={handleEditCancel}
                                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 px-5 py-2.5 rounded-xl font-bold transition-colors text-sm w-full md:w-auto"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </>
                        ) : (
                            (isOwnProfile || isAdminOrHR) && (
                                <button
                                    onClick={handleEditStart}
                                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(124,59,237,0.4)] text-sm w-full md:w-auto"
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
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Status</p>
                                {editing && canEditStatus ? (
                                    <select
                                        className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 w-full appearance-none cursor-pointer"
                                        value={editForm.estatus}
                                        onChange={(e) => setEditForm({ ...editForm, estatus: e.target.value })}
                                    >
                                        <option value="active" className="bg-slate-800">Active</option>
                                        <option value="onleave" className="bg-slate-800">On Leave</option>
                                        <option value="inactive" className="bg-slate-800">Inactive</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                        <span className={`text-sm font-semibold ${status.text}`}>{status.label}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Address</p>
                                {editing ? (
                                    <textarea
                                        className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 w-full resize-none"
                                        rows={2}
                                        placeholder="Enter address..."
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <p className="text-white font-medium">{profileData.address || "Not provided"}</p>
                                    </div>
                                )}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                    <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">System Role {editing ? (isAdmin ? '(Editable)' : '(Locked)') : ''}</p>
                                    {editing && isAdmin ? (
                                        <select
                                            className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 w-full appearance-none cursor-pointer"
                                            value={editForm.dbRole}
                                            onChange={(e) => setEditForm({ ...editForm, dbRole: e.target.value })}
                                        >
                                            <option value="Employee" className="bg-slate-800">Employee</option>
                                            <option value="Human Resources" className="bg-slate-800">Human Resources</option>
                                            <option value="Admin" className="bg-slate-800">Admin</option>
                                        </select>
                                    ) : (
                                        <p className="text-white font-medium">{profileData.dbRole}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Department</p>
                                {editing ? (
                                    <select
                                        className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 w-full appearance-none cursor-pointer"
                                        value={editForm.department}
                                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                    >
                                        <option value="" disabled className="bg-slate-800">Select Department</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept} className="bg-slate-800">{dept}</option>
                                        ))}
                                    </select>
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

                            <div>
                                <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Skills</p>
                                {editing ? (
                                    <input
                                        className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/50 w-full"
                                        placeholder="e.g. React, Node.js, Python"
                                        value={editForm.skills}
                                        onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                                    />
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profileData.skills ? (
                                            profileData.skills.split(',').map((skill, i) => (
                                                <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold border border-primary/20">
                                                    <Sparkles className="w-3 h-3" />
                                                    {skill.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-white font-medium">Not provided</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
