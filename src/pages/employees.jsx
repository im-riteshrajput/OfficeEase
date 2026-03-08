import { useEffect, useState } from "react";
import EmployeeTable from "../components/employeeTable.jsx";
import { departments } from "../data/data.js";
import EmployeeModal from "../components/employeeModal.jsx";

const Employees = ({ employees, onAdd, onEdit, onDelete }) => {
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const filtered = employees.filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
        const matchesDept = department === "All" || e.department === department;
        return matchesSearch && matchesDept;
    });

    const handleEdit = (emp) => {
        setEditingEmployee(emp);
        setModalOpen(true);
    };

const handleSave = async (data) => {
  if (editingEmployee) {
    await onEdit({ ...editingEmployee, ...data });
  } else {
    await onAdd(data);
  }
};



    return (
        <div className="w-full justify-self-center">
            <div className="w-[80vw] flex justify-between items-center justify-self-center my-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Employees</h1>
                    <p className="text-muted-foreground mt-1">{employees.length} Total Employee</p>
                </div>

                <button
                    onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-80 transition-opacity"
                >
                    Add Employee
                </button>
            </div>

            <div className="flex gap-4 w-[80vw] justify-self-center mb-8">
                <input
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                    placeholder="Search employees..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    className="pl-10 pr-8 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none transition-colors"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                >
                    {departments.map((d) => (
                        <option key={d} value={d}>{d}</option>
                    ))}
                </select>
            </div>



            <div>
                <EmployeeTable employees={filtered} onEdit={handleEdit} onDelete={onDelete} />
                <EmployeeModal
                    isOpen={modalOpen}
                    onClose={() => { setModalOpen(false); setEditingEmployee(null); }}
                    onSave={handleSave}
                    employee={editingEmployee}
                />
            </div>
        </div>
    )
}

export default Employees