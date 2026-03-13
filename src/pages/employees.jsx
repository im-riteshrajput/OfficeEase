import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Search, Filter, ChevronDown, Trash2, ChevronLeft, ChevronRight, Mail, UserCircle } from 'lucide-react';
import EmployeeModal from '../components/employeeModal.jsx';

export default function Employees({ employees = [], onAdd, onEdit, onDelete }) {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [department, setDepartment] = useState("All");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // Reset pagination when search or department changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, department]);

    const filtered = employees.filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.role?.toLowerCase().includes(search.toLowerCase());
        const matchesDept = department === "All" || e.department === department;
        return matchesSearch && matchesDept;
    });

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    const paginatedEmployees = filtered.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const activeCount = employees.filter(e => e.estatus === 'active').length;



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
        <div className="bg-background-dark font-display text-slate-100 min-h-[calc(100vh-64px)] overflow-x-hidden relative w-full">
            <div className="gradient-orb bg-primary top-[-10%] left-[-10%]"></div>
            <div className="gradient-orb bg-indigo-600 bottom-[-10%] right-[-10%]"></div>
            <div className="flex w-full min-w-0">

                <main className="flex-1 p-3 sm:p-8 lg:p-12 w-full min-w-0 overflow-x-hidden">
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 w-full">
                        <div className="min-w-0">
                            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight neon-glow-purple truncate">Employees</h2>
                            <p className="text-slate-400 text-sm sm:text-lg mt-1 sm:mt-2 line-clamp-2">Manage your team members and their roles here.</p>
                        </div>
                        <button
                            onClick={() => { setEditingEmployee(null); setModalOpen(true); }}
                            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-95 text-sm sm:text-base w-full sm:w-auto shrink-0"
                        >
                            <UserPlus className="w-5 h-5 shrink-0" />
                            <span>Add Employee</span>
                        </button>
                    </header>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 w-full">
                        <div className="md:col-span-8 min-w-0 w-full">
                            <div className="relative group w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors shrink-0" />
                                <input
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-500 text-sm sm:text-base text-ellipsis"
                                    placeholder="Search employees..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="md:col-span-4 min-w-0 w-full">
                            <div className="relative liquid-glass rounded-xl px-4 py-3 cursor-pointer group hover:bg-white/10 transition-colors w-full">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-3 sm:p-6">
                                {paginatedEmployees.map((employee) => {
                                    const statusConfig = {
                                        active: { label: "Active", color: "bg-emerald-500", text: "text-emerald-400" },
                                        onleave: { label: "On Leave", color: "bg-amber-500", text: "text-amber-400" },
                                        inactive: { label: "Inactive", color: "bg-rose-500", text: "text-rose-400" }
                                    };
                                    const status = statusConfig[employee.estatus] || statusConfig.active;

                                    return (
                                        <div key={employee._id || employee.id} className="bg-[#252136]/50 border border-white/5 rounded-3xl p-4 sm:p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-white/10 transition-colors">
                                            {/* Avatar */}
                                            <div className="relative mb-4">
                                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-b from-primary/50 to-transparent flex items-center justify-center">
                                                    <UserCircle className="w-full h-full text-slate-400 rounded-full" strokeWidth={1} />
                                                </div>
                                                <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#1E1B2E] ${status.color}`}></div>
                                            </div>

                                            {/* Info */}
                                            <h3 className="text-xl font-bold text-white mb-1 w-full px-2 break-words leading-tight">{employee.name}</h3>
                                            <p className="text-primary text-sm font-medium mb-6 w-full px-2 break-words leading-snug">{employee.jobRole || 'Team Member'}</p>

                                            {/* Status & Dept Block */}
                                            <div className="w-full bg-[#1A1625] rounded-2xl p-3 sm:p-4 flex items-center justify-between mb-6 border border-white/5 gap-3">
                                                <div className="text-left shrink-0">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">STATUS</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full z-0 shrink-0 ${status.color}`}></div>
                                                        <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right min-w-0">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">DEPARTMENT</p>
                                                    <p className="text-xs font-medium text-slate-300 truncate">{employee.department}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                                                <button onClick={() => navigate(`/employee/${employee._id || employee.id}`)} className="w-full sm:flex-1 bg-[#2D2842] hover:bg-[#352F4D] text-white text-sm font-medium py-2.5 rounded-xl transition-colors">
                                                    View Profile
                                                </button>
                                                <button onClick={() => onDelete(employee._id || employee.id)} className="w-full sm:w-11 h-11 bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center rounded-xl text-rose-500 transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                    <span className="sm:hidden ml-2 font-medium text-sm">Delete Employee</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 border-t border-white/5 shrink-0">
                            <p className="text-[10px] sm:text-xs text-slate-500 text-center sm:text-left">
                                Showing <span className="text-slate-300 font-bold">{paginatedEmployees.length}</span> of <span className="text-slate-300 font-bold">{filtered.length}</span> results
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className={`size-8 rounded-lg liquid-glass flex items-center justify-center transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`size-8 rounded-lg text-xs font-bold transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'liquid-glass hover:bg-white/10 text-slate-400 hover:text-white'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className={`size-8 rounded-lg liquid-glass flex items-center justify-center transition-all ${currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                                >
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
