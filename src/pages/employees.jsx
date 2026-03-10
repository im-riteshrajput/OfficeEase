import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Filter, ChevronDown, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import EmployeeModal from '../components/employeeModal.jsx';

export default function Employees({ employees = [], onAdd, onEdit, onDelete }) {
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    const filtered = employees.filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.role?.toLowerCase().includes(search.toLowerCase());
        const matchesDept = department === "All" || e.department === department;
        return matchesSearch && matchesDept;
    });

    const activeCount = employees.filter(e => e.estatus === 'active').length;

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
        setModalOpen(false);
        setEditingEmployee(null);
    };
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen w-full overflow-x-hidden">
            <div className="gradient-orb bg-primary top-[-10%] left-[-10%]"></div>
            <div className="gradient-orb bg-indigo-600 bottom-[-10%] right-[-10%]"></div>
            <div className="flex min-h-screen w-full">

                <main className="ml-[260px] flex-1 p-8 lg:p-12">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tight neon-glow-purple">Employees</h2>
                            <p className="text-slate-400 text-lg mt-2">Manage your team members and their roles here.</p>
                        </div>
                        <button
                            onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-95"
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Employee
                        </button>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
                        <div className="md:col-span-8">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-500"
                                    placeholder="Search by name, email or employee ID..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <div className="relative liquid-glass rounded-xl px-4 py-3 cursor-pointer group hover:bg-white/10 transition-colors">
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full bg-transparent appearance-none outline-none text-sm font-medium text-slate-100 cursor-pointer"
                                    style={{ paddingRight: '1rem' }}
                                >
                                    <option value="All" className="bg-slate-800">All Departments</option>
                                    <option value="Engineering" className="bg-slate-800">Engineering</option>
                                    <option value="Design" className="bg-slate-800">Design</option>
                                    <option value="Marketing" className="bg-slate-800">Marketing</option>
                                    <option value="Human Resources" className="bg-slate-800">Human Resources</option>
                                    <option value="Sales" className="bg-slate-800">Sales</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                    <div className="liquid-glass rounded-2xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Employee</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Department</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Join Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filtered.map((emp) => (
                                        <tr key={emp._id || emp.id || emp.email} className="hover:bg-white/5 transition-all duration-300 group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full border-2 border-primary/20 bg-cover bg-center overflow-hidden" data-alt={`${emp.name} Avatar`} >
                                                        <img src={`https://i.pravatar.cc/150?u=${emp.email || emp.name}`} alt={emp.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{emp.name}</p>
                                                        <p className="text-xs text-slate-500">{emp.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-medium">{emp.role || 'Employee'}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-xs font-bold px-2 py-1 rounded bg-slate-500/10 text-slate-400">{emp.department}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                {emp.estatus === 'active' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-md">
                                                        <span className="size-1.5 rounded-full bg-green-500 mr-2"></span>
                                                        Active
                                                    </span>
                                                ) : emp.estatus === 'onleave' ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-md">
                                                        <span className="size-1.5 rounded-full bg-amber-500 mr-2"></span>
                                                        On Leave
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 backdrop-blur-md">
                                                        <span className="size-1.5 rounded-full bg-red-500 mr-2"></span>
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm text-slate-500">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-5 text-right flex justify-end gap-2">
                                                <button onClick={() => handleEdit(emp)} className="text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg">
                                                    Edit
                                                </button>
                                                <button onClick={() => onDelete(emp._id || emp.id)} className="text-red-400 hover:text-white transition-colors bg-red-500/10 hover:bg-red-500/30 p-2 rounded-lg">
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-slate-500 font-medium">
                                                No employees found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between border-t border-white/5">
                            <p className="text-xs text-slate-500">Showing <span className="text-slate-300 font-bold">{filtered.length}</span> results</p>
                            <div className="flex gap-2">
                                <button className="size-8 rounded-lg liquid-glass flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button className="size-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-primary/20">1</button>
                                <button className="size-8 rounded-lg liquid-glass flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold">2</button>
                                <button className="size-8 rounded-lg liquid-glass flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all text-xs font-bold">3</button>
                                <button className="size-8 rounded-lg liquid-glass flex items-center justify-center hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <EmployeeModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingEmployee(null); }}
                onSave={handleSave}
                employee={editingEmployee}
            />
        </div>
    );
}
