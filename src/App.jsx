import './App.css'
import EmployeeData from "./data/EmployeeData.js"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect, useState } from "react"
import Employees from "./pages/employees"
import LoginPage from "./pages/loginPage.jsx"
import DashboardLayout from './pages/dashboardLayout.jsx'
import Dashboard from './pages/dashboard'
import Departments from './pages/departments'
import Landing from './pages/landing.jsx'
import EmployeeProfile from './pages/EmployeeProfile.jsx'
import WaitingPage from './pages/WaitingPage.jsx'
import Applications from './pages/Application'
import Tasks from './pages/task'
import AssignTask from './pages/assignTask'
import EmployeeTask from './pages/employeeTask'


function App() {
  const [employees, setEmployees] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true);

  const fetchEmployees = async (silent = false) => {
    if (!silent) setGlobalLoading(true);
    try {
      const data = await EmployeeData.getEmployees();
      setEmployees(data);
      return data;
    } finally {
      if (!silent) setGlobalLoading(false);
    }
  };

  const addEmployee = async (data) => {
    setGlobalLoading(true);
    try {
      const savedEmployee = await EmployeeData.createEmployees(data);
      await fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const editEmployee = async (updatedData) => {
    setGlobalLoading(true);
    try {
      const updatedEmployee = await EmployeeData.updateEmployee(
        updatedData._id,
        updatedData
      );
      setEmployees((prev) =>
        prev.map((emp) =>
          emp._id === updatedEmployee._id ? updatedEmployee : emp
        )
      );
    } catch (error) {
      console.error("Edit error:", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  const deleteEmployee = async (id) => {
    setGlobalLoading(true);
    try {
      await EmployeeData.deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchEmployees();

      // Global polling for real-time updates every 10 seconds
      const pollInterval = setInterval(() => {
        const currentToken = localStorage.getItem("token");
        if (currentToken) {
          fetchEmployees(true); // silent fetch
        } else {
          clearInterval(pollInterval);
        }
      }, 10000);

      return () => clearInterval(pollInterval);
    } else {
      setGlobalLoading(false);
    }
  }, []);

  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          {/* Public Pages (no sidebar) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage onLogin={fetchEmployees} />} />
          <Route path="/waiting" element={<WaitingPage />} />

          {/* Dashboard Pages (with sidebar) */}
          <Route element={<DashboardLayout employees={employees} globalLoading={globalLoading} />}>
            <Route path="/dashboard" element={<Dashboard employees={employees} />} />
            <Route path="/employees" element={<Employees employees={employees} onAdd={addEmployee} onDelete={deleteEmployee} onEdit={editEmployee} />} />
            <Route path="/departments" element={<Departments employees={employees} />} />
            <Route path="/profile" element={<EmployeeProfile employees={employees} onEdit={editEmployee} />} />
            <Route path="/employee/:id" element={<EmployeeProfile employees={employees} onEdit={editEmployee} />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/assign-task" element={<AssignTask />} />
            <Route path="/my-tasks" element={<EmployeeTask />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
