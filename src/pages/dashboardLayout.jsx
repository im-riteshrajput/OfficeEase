import Sidebar from "../components/sidebar.jsx"
import { Outlet } from "react-router-dom";

function DashboardLayout() {
    return (
        <div className="flex flex-row">
            <Sidebar/>

            <Outlet/>
        </div>
    );
}

export default DashboardLayout;