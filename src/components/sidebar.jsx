import React from 'react'
import { Link, NavLink, useNavigate } from "react-router-dom"
import { LayoutDashboard, Users, Building2, Info, MessageSquare, LogOut } from "lucide-react"

function Sidebar({ employees = [] }) {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const fetchUser = () => {
            // 1. Try direct localStorage
            const storedUser = localStorage.getItem("user");
            if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
                try {
                    const parsed = JSON.parse(storedUser);
                    setUser(parsed);
                    console.log("Sidebar: Profile loaded from localStorage", parsed);
                    return;
                } catch (e) {
                    console.error("Sidebar: Error parsing user from localStorage", e);
                }
            }

            // 2. Fallback: Decode token and find in employees list
            const token = localStorage.getItem("token");
            console.log("Sidebar: Attempting token fallback. Employees count:", employees.length);

            if (token && employees.length > 0) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const userId = payload.id;
                    const foundUser = employees.find(emp => (emp._id || emp.id) === userId);
                    if (foundUser) {
                        setUser(foundUser);
                        console.log("Sidebar: Profile recovered via token fallback", foundUser);
                        localStorage.setItem("user", JSON.stringify(foundUser));
                    } else {
                        console.warn("Sidebar: User ID in token not found in employees list", userId);
                    }
                } catch (e) {
                    console.error("Sidebar: JWT Fallback failed", e);
                }
            } else if (!token) {
                console.log("Sidebar: No token found in localStorage");
            }
        };

        fetchUser();
    }, [employees]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const navItems = [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/employees", label: "Employees", icon: Users },
        { to: "/departments", label: "Departments", icon: Building2 },
        // { to: "/about", label: "About", icon: Info },
        // { to: "/testimonials", label: "Testimonials", icon: MessageSquare },
    ];

    return (
        <aside className="w-[260px] glass-sidebar border-r border-white/10 flex flex-col fixed inset-y-0 z-50">
            <div className="p-8">
                <h1 className="text-3xl font-black tracking-tighter text-white neon-glow-purple">OFFIFY</h1>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest">Management</p>
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
                            <NavLink key={label} to={to} className={classes}>
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
                        <a key={label} href={to} className={classes({ isActive: false })}>
                            <Icon className={`w-5 h-5 ${iconClasses({ isActive: false })}`} />
                            <span className="text-sm font-medium">{label}</span>
                        </a>
                    );
                })}
            </nav>
            <div className="p-6 mt-auto">
                <div className="px-4 mb-3 py-4 rounded-xl liquid-glass">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-cover bg-center border border-white/10"
                            style={{ backgroundImage: `url('https://i.pravatar.cc/150?u=${user?.email || "Alex"}')` }}></div>
                        <div className="overflow-hidden">
                            <p className="text-sm text-white font-bold truncate">{user?.name || "Alex Morgan"}</p>
                            <p className="text-xs text-slate-400 truncate">{user?.jobRole || "HR Manager"}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-accent-green/20 hover:bg-accent-green/30 text-accent-green border border-accent-green/30 py-3 rounded-xl transition-all font-bold text-sm"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </div>
        </aside>
    )
}

export default Sidebar