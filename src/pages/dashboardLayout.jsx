import Sidebar from "../components/sidebar.jsx"
import { Outlet } from "react-router-dom";
import Loading from "../components/loading.jsx";

function DashboardLayout({ employees, globalLoading }) {
    if (globalLoading) return <Loading />;
    return (
        <div className="flex" style={{ background: 'var(--color-dark)', minHeight: '100vh' }}>
            {/* Background Orbs */}
            <div className="orb-container">
                <div className="gradient-orb orb-purple" />
                <div className="gradient-orb orb-teal" />
                <div className="gradient-orb orb-blue" />
            </div>

            {/* Sidebar */}
            <Sidebar employees={employees} />

            {/* Main Content */}
            <main className="flex-1 relative z-10 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;