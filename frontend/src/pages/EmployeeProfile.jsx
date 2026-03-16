import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Calendar, Shield, Edit3, Save, X, UserCircle, MapPin, Sparkles, Camera, Loader2 } from 'lucide-react';
import { API } from '../data/api';
import { getInitials } from '../utils/helpers';

export default function EmployeeProfile({ employees = [], onEdit }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [currentUser, setCurrentUser] = useState(null);
    const location = useLocation();
    const isPastMember = location.state?.isPastMember || false;

    // Password Change State
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    // Photo Upload State
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const fileInputRef = React.useRef(null);

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
        if (location.state?.employee) {
            setProfileData(location.state.employee);
            setIsOwnProfile(false);
        } else if (id) {
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
            shiftStart: profileData?.shiftStart || "09:00",
            shiftEnd: profileData?.shiftEnd || "17:00",
            workingDaysPerWeek: profileData?.workingDaysPerWeek || 5,
            casualLeaves: profileData?.casualLeaves !== undefined ? profileData?.casualLeaves : 12,
            sickLeaves: profileData?.sickLeaves !== undefined ? profileData?.sickLeaves : 12,
        });
        setEditing(true);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert("File size should not exceed 5MB.");
            return;
        }

        const formData = new FormData();
        formData.append("photo", file);

        setIsUploadingPhoto(true);
        try {
            const token = localStorage.getItem('token');
            const targetId = profileData._id || profileData.id;
            const res = await API.post(`/employees/${targetId}/photo`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            const updatedProfile = res.data.user;
            setProfileData(updatedProfile);
            
            if (isOwnProfile) {
                localStorage.setItem("user", JSON.stringify(updatedProfile));
            }
            
            if (onEdit) {
                 await onEdit(updatedProfile);
            }
        } catch (error) {
            console.error("Photo upload failed:", error);
            alert("Failed to upload photo. " + (error.response?.data?.message || ""));
        } finally {
            setIsUploadingPhoto(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleEditSave = async () => {
        if (editForm.phone && editForm.phone.toString().length !== 10) {
            alert("Phone number must be exactly 10 digits");
            return;
        }
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

    const handleChangePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        
        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }
        
        if (passwordForm.newPassword.length < 8) {
            setPasswordError('New password must be at least 8 characters');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await API.put('/auth/change-password', 
                { 
                    oldPassword: passwordForm.oldPassword, 
                    newPassword: passwordForm.newPassword 
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setPasswordSuccess(res.data.message || 'Password changed successfully');
            setTimeout(() => {
                setShowPasswordForm(false);
                setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordSuccess('');
            }, 3000);
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
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
                <div className="max-w-[1100px] mx-auto">
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

                    <div className="flex flex-col gap-8">
                {/* Profile Header Card */}
                <div className="liquid-glass rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Shield className="w-32 h-32 md:w-48 md:h-48 text-white" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 relative z-10 w-full md:w-auto">
                        <div className="relative group/avatar cursor-pointer">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_20px_rgba(124,59,237,0.3)] flex items-center justify-center bg-primary/20 text-primary font-black text-4xl relative">
                                {profileData.profilePhotoUrl ? (
                                    <img 
                                        src={profileData.profilePhotoUrl} 
                                        alt={profileData.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    getInitials(profileData.name)
                                )}
                                
                                {isOwnProfile && (
                                    <div 
                                        className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {isUploadingPhoto ? (
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        ) : (
                                            <Camera className="w-8 h-8 text-white" />
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-[3px] border-[#1a1625] ${status.color} shadow-lg ${status.glow} z-10`}></div>
                            
                            {isOwnProfile && (
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept="image/png, image/jpeg, image/jpg, image/webp"
                                    onChange={handlePhotoUpload}
                                    disabled={isUploadingPhoto}
                                />
                            )}
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
                            !isPastMember && (isOwnProfile || isAdminOrHR) && (
                                <button
                                    onClick={handleEditStart}
                                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(124,59,237,0.4)] text-sm w-full md:w-auto"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            )
                        )}
                        {!editing && isOwnProfile && (
                            <button
                                onClick={() => {
                                    setShowPasswordForm(!showPasswordForm);
                                    setPasswordError('');
                                    setPasswordSuccess('');
                                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg border border-white/5 text-sm w-full md:w-auto"
                            >
                                <Shield className="w-4 h-4" />
                                {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Password Change Form Section */}
                {showPasswordForm && (
                    <div className="liquid-glass rounded-3xl p-6 md:p-8 mb-8 relative overflow-hidden animate-fade-in border border-primary/20">
                        <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shadow-[0_0_15px_rgba(124,59,237,0.3)]">
                                <Shield className="w-5 h-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-white">Change Password</h2>
                        </div>
                        
                        {passwordError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
                                {passwordError}
                            </div>
                        )}
                        
                        {passwordSuccess && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                {passwordSuccess}
                            </div>
                        )}

                        <form onSubmit={handleChangePasswordSubmit} className="space-y-4 max-w-2xl relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1">Current Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                                        placeholder="Enter current password"
                                        value={passwordForm.oldPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                                        placeholder="Min. 8 characters"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 ml-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-slate-600"
                                        placeholder="Re-enter new password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(124,59,237,0.4)] text-sm w-full md:w-auto"
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

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
                                        maxLength={10}
                                        value={editForm.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            if (val.length <= 10) setEditForm({ ...editForm, phone: val });
                                        }}
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
                                <p className="text-white font-medium font-mono text-sm">{profileData.employeeId || profileData._id || profileData.id || "N/A"}</p>
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

                    {/* Attendance & Leave Configuration (Admin/HR Only) */}
                    {(isAdminOrHR || isOwnProfile) && (
                        <div className="liquid-glass rounded-3xl p-8 relative overflow-hidden group lg:col-span-2">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <Calendar className="w-24 h-24 text-white" />
                            </div>

                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                    <Calendar className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Attendance Configuration</h2>
                                    <p className="text-xs text-slate-400 font-bold tracking-wider mt-1 uppercase">Shift Timings & Leave Allowances</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Shift Start Time</p>
                                    {editing && isAdminOrHR ? (
                                        <input
                                            type="time"
                                            className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/50 w-full"
                                            value={editForm.shiftStart}
                                            onChange={(e) => setEditForm({ ...editForm, shiftStart: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-white font-medium text-lg">{profileData.shiftStart || "09:00"}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Shift End Time</p>
                                    {editing && isAdminOrHR ? (
                                        <input
                                            type="time"
                                            className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/50 w-full"
                                            value={editForm.shiftEnd}
                                            onChange={(e) => setEditForm({ ...editForm, shiftEnd: e.target.value })}
                                        />
                                    ) : (
                                        <p className="text-white font-medium text-lg">{profileData.shiftEnd || "17:00"}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Working Days / Week</p>
                                    {editing && isAdminOrHR ? (
                                        <input
                                            type="number"
                                            min="1"
                                            max="7"
                                            className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/50 w-full"
                                            value={editForm.workingDaysPerWeek}
                                            onChange={(e) => setEditForm({ ...editForm, workingDaysPerWeek: parseInt(e.target.value) || 5 })}
                                        />
                                    ) : (
                                        <p className="text-white font-medium text-lg">{profileData.workingDaysPerWeek || 5} Days</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Casual Leaves (Yearly)</p>
                                    {editing && isAdminOrHR ? (
                                        <input
                                            type="number"
                                            min="0"
                                            className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/50 w-full"
                                            value={editForm.casualLeaves}
                                            onChange={(e) => setEditForm({ ...editForm, casualLeaves: parseInt(e.target.value) || 0 })}
                                        />
                                    ) : (
                                        <p className="text-white font-medium text-lg">{profileData.casualLeaves !== undefined ? profileData.casualLeaves : 12}</p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 tracking-wider mb-1 uppercase">Sick Leaves (Yearly)</p>
                                    {editing && isAdminOrHR ? (
                                        <input
                                            type="number"
                                            min="0"
                                            className="text-white font-medium bg-white/5 border border-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500/50 w-full"
                                            value={editForm.sickLeaves}
                                            onChange={(e) => setEditForm({ ...editForm, sickLeaves: parseInt(e.target.value) || 0 })}
                                        />
                                    ) : (
                                        <p className="text-white font-medium text-lg">{profileData.sickLeaves !== undefined ? profileData.sickLeaves : 12}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            </div>
            </div>
        </div>
    );
}
