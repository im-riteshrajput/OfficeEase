import React from 'react'
import { Link, NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, Building2, Info, MessageSquare, LogOut, X, ClipboardList, ClipboardCheck, UserCircle, Clock } from "lucide-react"
import { getInitials } from '../utils/helpers';
import LogoutConfirmModal from './logoutConfirmModal';

function Sidebar({ employees = [], isOpen, onClose }) {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

    React.useEffect(() => {
        const fetchUser = () => {
            // 1. Try direct localStorage
            const storedUser = localStorage.getItem("user");
            if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    return;
                } catch (e) {
                    console.error("Sidebar: Error parsing user from localStorage", e);
                }
            }

            // 2. Fallback: Decode token and find in employees list
            const token = localStorage.getItem("token");

            if (token && employees.length > 0) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userId = payload.id;
                    const foundUser = employees.find(emp => (emp._id || emp.id) === userId);
                    if (foundUser) {
                        setUser(foundUser);
                        // console.log("Sidebar: Profile recovered via token fallback", foundUser);
                        localStorage.setItem("user", JSON.stringify(foundUser));
                    } else {
                        console.warn("Sidebar: User ID in token not found in employees list", userId);
                    }
                } catch (e) {
                    console.error("Sidebar: JWT Fallback failed", e);
                }
            } else if (!token) {
                // console.log("Sidebar: No token found in localStorage");
            }
        };

        fetchUser();
    }, [employees]);

    const handleLogoutClick = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleNavClick = () => {
        // Close sidebar on mobile when a nav item is clicked
        if (onClose) onClose();
    };

    const userRole = user?.dbRole || "";
    const isEmployee = userRole === "Employee";

    const adminNavItems = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/employees", label: "Employees", icon: Users },
        { to: "/departments", label: "Departments", icon: Building2 },
        { to: "/applications", label: "Applications", icon: ClipboardList },
        { to: "/tasks", label: "Tasks", icon: ClipboardCheck },
        { to: "/attendance-review", label: "Attendance", icon: Clock },
    ];

    const employeeNavItems = [
        { to: "/profile", label: "My Profile", icon: UserCircle },
        { to: "/my-tasks", label: "My Tasks", icon: ClipboardCheck },
        { to: "/attendance", label: "Attendance", icon: Clock },
    ];

    const navItems = isEmployee ? employeeNavItems : adminNavItems;

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-[260px] glass-sidebar border-r border-white/10 flex flex-col fixed inset-y-0 z-50
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                <div className="p-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-white neon-glow-purple">OFFIFY</h1>
                        <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">Management</p>
                    </div>
                    {/* Close button on mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map(({ to, label, icon: Icon }) => {
                        const isLink = to !== "#";

                        const classes = ({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive
                                ? "bg-white/10 border-l-4 border-accent-teal text-white"
                                : "hover:bg-white/5 text-slate-400 hover:text-white"
                            }`;

                        const iconClasses = ({ isActive }) =>
                            `group-hover:scale-110 transition-transform ${isActive ? "text-primary" : ""
                            }`;

                        if (isLink) {
                            return (
                                <NavLink key={label} to={to} className={classes} onClick={handleNavClick}>
                                    {({ isActive }) => (
                                        <>
                                            <Icon className={`w-5 h-5 ${iconClasses({ isActive })}`} />
                                            <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>
                                                {label}
                                            </span>
                                        </>
                                    )}
                                </NavLink>
                            );
                        }

                        return (
                            <a key={label} href={to} className={classes({ isActive: false })} onClick={handleNavClick}>
                                <Icon className={`w-5 h-5 ${iconClasses({ isActive: false })}`} />
                                <span className="text-sm font-medium">{label}</span>
                            </a>
                        );
                    })}
                </nav>
                <div className="p-6 mt-auto">
                    {!isEmployee && (
                        <div
                            onClick={() => { navigate("/profile"); handleNavClick(); }}
                            className="px-4 mb-3 py-4 rounded-xl liquid-glass cursor-pointer hover:bg-white/10 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex flex-shrink-0 items-center justify-center text-primary font-bold border border-primary/30 shadow-[0_0_10px_rgba(124,59,237,0.3)]">
                                    {getInitials(user?.name || "Admin User")}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm text-white font-bold truncate">{user?.name || "Alex Morgan"}</p>
                                    <p className="text-xs text-slate-400 truncate">{user?.jobRole || "HR Manager"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 py-3 rounded-xl transition-all font-bold text-sm"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            <LogoutConfirmModal 
                isOpen={showLogoutConfirm} 
                onClose={() => setShowLogoutConfirm(false)} 
                onConfirm={confirmLogout} 
            />
        </>
    )
}

export default Sidebar