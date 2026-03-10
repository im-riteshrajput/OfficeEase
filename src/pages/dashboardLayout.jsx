import Sidebar from "../components/sidebar.jsx"
import { Outlet } from "react-router-dom";

function DashboardLayout() {
    return (
        <div className="flex flex-row">
            <Sidebar />

            <div className="flex-1 w-full">
                <Outlet />
            </div>
        </div>
    );
}

export default DashboardLayout;