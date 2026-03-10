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


function App() {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    const data = await EmployeeData.getEmployees();
    setEmployees(data);
    return data;
  };

  const addEmployee = async (data) => {
    try {
      const savedEmployee = await EmployeeData.createEmployees(data);
      await fetchEmployees();
    } catch (error) {
      console.error("Error adding employee:", error);
    }
  };

  const editEmployee = async (updatedData) => {
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
    }
  };

  const deleteEmployee = async (id) => {
    try {
      await EmployeeData.deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          {/* Public Pages (no sidebar) */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard Pages (with sidebar) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard employees={employees} />} />
            <Route path="/employees" element={<Employees employees={employees} onAdd={addEmployee} onDelete={deleteEmployee} onEdit={editEmployee} />} />
            <Route path="/departments" element={<Departments employees={employees} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
