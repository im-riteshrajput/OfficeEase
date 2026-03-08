import { NavLink, useNavigate } from "react-router-dom"


function Sidebar() {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        localStorage.removeItem("token"); // remove JWT
        navigate("/"); // redirect to login page
    };



    return (
        <>
            <nav className="w-64 h-screen flex bg-black z-10">
                <div className="flex flex-col justify-between justify-self-center ml-10 my-8">


                    <span className="text-xl font-bold text-white">Employee Management</span>

                    <div className="flex flex-col space-x-4 mt-20 mb-50">
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "rounded-md bg-gray-950/50 px-3 py-2 text-lg font-medium text-green-400" : "rounded-md bg-gray-950/50 px-3 py-2 text-md font-medium text-white hover:text-green-600"}>Dashboard</NavLink>
                        <NavLink to="/employees" className={({ isActive }) => isActive ? "rounded-md bg-gray-950/50 px-3 py-2 text-lg font-medium text-green-400" : "rounded-md bg-gray-950/50 px-3 py-2 text-md font-medium text-white hover:text-green-600"}>Employees</NavLink>
                        <NavLink to="/departments" className={({ isActive }) => isActive ? "rounded-md bg-gray-950/50 px-3 py-2 text-lg font-medium text-green-400" : "rounded-md bg-gray-950/50 px-3 py-2 text-md font-medium text-white hover:text-green-600"}>Departments</NavLink>
                        <NavLink to="/authentication" className={({ isActive }) => isActive ? "rounded-md bg-gray-950/50 px-3 py-2 text-lg font-medium text-green-400" : "rounded-md bg-gray-950/50 px-3 py-2 text-md font-medium text-white hover:text-green-600"}>Test Login</NavLink>
                        <NavLink to="/about" className={({ isActive }) => isActive ? "rounded-md bg-gray-950/50 px-3 py-2 text-lg font-medium text-green-400" : "rounded-md bg-gray-950/50 px-3 py-2 text-md font-medium text-white hover:text-green-600"}>About Me</NavLink>
                        <NavLink to="/testimonials" className={({ isActive }) => isActive ? "rounded-md bg-gray-950/50 px-3 py-2 text-lg font-medium text-green-400" : "rounded-md bg-gray-950/50 px-3 py-2 text-md font-medium text-white hover:text-green-600"}>Testimonials</NavLink>
                    </div>

                    <div className="navbtn  gap-4 items-center hidden lg:flex flex-row">
                        <svg className="w-[25px] h-[25px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M12 5V3m0 18v-2M7.05 7.05 5.636 5.636m12.728 12.728L16.95 16.95M5 12H3m18 0h-2M7.05 16.95l-1.414 1.414M18.364 5.636 16.95 7.05M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
                        </svg>


                        <button onClick={handleLogout} className="bg-green-500 px-4 py-2 text-black rounded-full hover:bg-green-600 text-sm font-medium">LOGOUT</button>
                    </div>
                    <button type="button" command="--toggle" commandfor="mobile-menu" className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500 lg:hidden">
                        <span className="absolute -inset-0.5"></span>
                        <span className="sr-only">Open main menu</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" data-slot="icon" aria-hidden="true" className="size-6 in-aria-expanded:hidden">
                            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" data-slot="icon" aria-hidden="true" className="size-6 not-in-aria-expanded:hidden">
                            <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                </div>
            </nav>
        </>
    )
}

export default Sidebar