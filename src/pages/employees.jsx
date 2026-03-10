import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Filter, ChevronDown, MoreVertical, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
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
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen overflow-x-hidden">
            <div className="gradient-orb bg-primary top-[-10%] left-[-10%]"></div>
            <div className="gradient-orb bg-indigo-600 bottom-[-10%] right-[-10%]"></div>
            <div className="flex min-h-screen w-full">

                <main className="ml-72 flex-1 p-8 lg:p-12">
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
                            {/* Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {filtered.map((employee) => {
                                    const statusConfig = {
                                        active: { label: "Active", color: "bg-emerald-500", text: "text-emerald-400" },
                                        onleave: { label: "On Leave", color: "bg-amber-500", text: "text-amber-400" },
                                        inactive: { label: "Inactive", color: "bg-rose-500", text: "text-rose-400" }
                                    };
                                    const status = statusConfig[employee.estatus] || statusConfig.active;

                                    return (
                                        <div key={employee._id || employee.id} className="bg-[#252136]/50 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-white/10 transition-colors">
                                            {/* Avatar */}
                                            <div className="relative mb-4">
                                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-primary/50 to-transparent">
                                                    <img src={`https://i.pravatar.cc/150?u=${employee.email || employee.name}`} alt={employee.name} className="w-full h-full rounded-full object-cover border-4 border-[#1E1B2E]" />
                                                </div>
                                                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1E1B2E] ${status.color}`}></div>
                                            </div>

                                            {/* Info */}
                                            <h3 className="text-xl font-bold text-white mb-1">{employee.name}</h3>
                                            <p className="text-primary text-sm font-medium mb-6">{employee.jobRole || 'Team Member'}</p>

                                            {/* Status & Dept Block */}
                                            <div className="w-full bg-[#1A1625] rounded-2xl p-4 flex items-center justify-between mb-6 border border-white/5">
                                                <div className="text-left">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">STATUS</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${status.color}`}></div>
                                                        <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">DEPARTMENT</p>
                                                    <p className="text-xs font-medium text-slate-300">{employee.department}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="w-full flex items-center gap-3">
                                                <button onClick={() => handleEdit(employee)} className="flex-1 bg-[#2D2842] hover:bg-[#352F4D] text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                                                    Edit Profile
                                                </button>
                                                <button onClick={() => onDelete(employee._id || employee.id)} className="w-11 h-11 bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center rounded-xl text-rose-500 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
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
