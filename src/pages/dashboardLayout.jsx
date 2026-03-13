import { useState } from "react";
import Sidebar from "../components/sidebar.jsx"
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Loading from "../components/loading.jsx";
import { Menu } from "lucide-react";

function DashboardLayout({ employees, globalLoading }) {
    const token = localStorage.getItem("token");
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    if (!token) return <Navigate to="/" />;

    // Role-based route protection
    let userRole = "";
    try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) userRole = JSON.parse(storedUser)?.dbRole || "";
    } catch {}

    const adminOnlyRoutes = ["/dashboard", "/employees", "/departments"];
    if (userRole === "Employee" && adminOnlyRoutes.includes(location.pathname)) {
        return <Navigate to="/profile" replace />;
    }
    
    if (globalLoading) return <Loading />;
    return (
        <div className="flex flex-col lg:flex-row" style={{ background: 'var(--color-dark)', minHeight: '100vh' }}>
            {/* Background Orbs */}
            <div className="orb-container">
                <div className="gradient-orb orb-purple" />
                <div className="gradient-orb orb-teal" />
                <div className="gradient-orb orb-blue" />
            </div>

            {/* Mobile Top Navbar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-30 glass-sidebar border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black tracking-tighter text-white neon-glow-purple">OFFIFY</h1>
                </div>
            </header>

            {/* Sidebar */}
            <Sidebar
                employees={employees}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="flex-1 relative z-10 overflow-y-auto lg:ml-[260px] pt-16 lg:pt-0">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;