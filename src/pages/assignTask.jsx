import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronDown, Search, Users } from 'lucide-react';
import EmployeeData from '../data/EmployeeData';
import TaskData from '../data/TaskData';
import { getInitials } from '../utils/helpers';

export default function AssignTask() {
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [empSearch, setEmpSearch] = useState('');
    const dropdownRef = useRef(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        selectedEmployees: [], // array of { id, name, jobRole }
        priority: 'Medium',
        dueDate: '',
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            setLoading(true);
            try {
                const data = await EmployeeData.getEmployees();
                setEmployees(data);
            } catch (err) {
                console.error("Error fetching employees:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const toggleEmployee = (emp) => {
        setForm(prev => {
            const exists = prev.selectedEmployees.find(e => e.id === emp._id);
            if (exists) {
                return { ...prev, selectedEmployees: prev.selectedEmployees.filter(e => e.id !== emp._id) };
            }
            return {
                ...prev,
                selectedEmployees: [...prev.selectedEmployees, { id: emp._id, name: emp.name, jobRole: emp.jobRole }]
            };
        });
    };

    const removeEmployee = (id) => {
        setForm(prev => ({
            ...prev,
            selectedEmployees: prev.selectedEmployees.filter(e => e.id !== id)
        }));
    };

    const selectAll = () => {
        const allEmp = filteredEmployees.map(emp => ({ id: emp._id, name: emp.name, jobRole: emp.jobRole }));
        setForm(prev => ({ ...prev, selectedEmployees: allEmp }));
    };

    const clearAll = () => {
        setForm(prev => ({ ...prev, selectedEmployees: [] }));
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        emp.jobRole?.toLowerCase().includes(empSearch.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.title.trim()) return setError('Please enter a task title');
        if (form.selectedEmployees.length === 0) return setError('Please select at least one employee');
        if (!form.dueDate) return setError('Please select a due date');

        setSubmitting(true);
        try {
            await TaskData.createTask({
                title: form.title,
                description: form.description,
                assignees: form.selectedEmployees.map(e => ({ id: e.id, name: e.name })),
                priority: form.priority,
                dueDate: form.dueDate,
            });
            const count = form.selectedEmployees.length;
            setSuccess(`Task assigned to ${count} employee${count > 1 ? 's' : ''} successfully!`);
            setTimeout(() => navigate('/tasks'), 1200);
        } catch (err) {
            setError('Failed to assign task. Please try again.');
            console.error("Error assigning task:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-3 sm:p-8 lg:p-12 min-h-screen relative overflow-hidden">
            {/* Translucent Background Orbs */}
            <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
            <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>

            <div className="max-w-3xl mx-auto relative z-10">
                {/* Header */}
                <header className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight neon-glow-purple">Assign New Task</h2>
                    <p className="text-slate-400 text-base mt-1">Create and assign a task to one or multiple team members.</p>
                </header>

                {/* Success/Error Messages */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {success}
                    </div>
                )}

                {/* Form */}
                <div className="glass-card rounded-2xl p-6 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-7">

                        {/* Task Title */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                                Task Title
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Q4 Financial Audit"
                                value={form.title}
                                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full glass-input rounded-xl py-3.5 px-5 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-slate-500 text-white"
                            />
                        </div>

                        {/* Task Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                                Task Description
                            </label>
                            <textarea
                                placeholder="Briefly describe the objectives and requirements..."
                                rows="4"
                                value={form.description}
                                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                className="w-full glass-input rounded-xl py-3.5 px-5 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-slate-500 text-white resize-none"
                            ></textarea>
                        </div>

                        {/* Multi-Select Assignees */}
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                                Assign To
                                {form.selectedEmployees.length > 0 && (
                                    <span className="ml-2 text-primary normal-case">
                                        ({form.selectedEmployees.length} selected)
                                    </span>
                                )}
                            </label>

                            {/* Selected Chips */}
                            {form.selectedEmployees.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {form.selectedEmployees.map(emp => (
                                        <span
                                            key={emp.id}
                                            className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-semibold"
                                        >
                                            <span className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[9px] font-bold text-white">
                                                {getInitials(emp.name)}
                                            </span>
                                            {emp.name}
                                            <button
                                                type="button"
                                                onClick={() => removeEmployee(emp.id)}
                                                className="ml-0.5 w-4 h-4 rounded-full hover:bg-primary/30 flex items-center justify-center transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            )}

                            {/* Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="w-full glass-input rounded-xl py-3.5 px-5 text-sm focus:outline-none focus:border-primary/50 transition-colors text-left flex items-center justify-between"
                                >
                                    <span className={form.selectedEmployees.length > 0 ? 'text-white' : 'text-slate-500'}>
                                        {form.selectedEmployees.length > 0
                                            ? `${form.selectedEmployees.length} employee${form.selectedEmployees.length > 1 ? 's' : ''} selected`
                                            : 'Click to select employees...'
                                        }
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute z-50 top-full mt-2 w-full bg-[#1A1625] rounded-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden">
                                        {/* Search */}
                                        <div className="p-3 border-b border-white/5">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Search employees..."
                                                    value={empSearch}
                                                    onChange={e => setEmpSearch(e.target.value)}
                                                    className="w-full bg-white/5 rounded-lg py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:bg-white/8 transition-colors"
                                                />
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    type="button"
                                                    onClick={selectAll}
                                                    className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-wider"
                                                >
                                                    Select All
                                                </button>
                                                <span className="text-slate-600">•</span>
                                                <button
                                                    type="button"
                                                    onClick={clearAll}
                                                    className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                                                >
                                                    Clear All
                                                </button>
                                            </div>
                                        </div>

                                        {/* Employee List */}
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredEmployees.length === 0 ? (
                                                <div className="p-4 text-center text-sm text-slate-500">No employees found</div>
                                            ) : (
                                                filteredEmployees.map(emp => {
                                                    const isSelected = form.selectedEmployees.some(e => e.id === emp._id);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={emp._id}
                                                            onClick={() => toggleEmployee(emp)}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors ${isSelected ? 'bg-primary/10' : ''}`}
                                                        >
                                                            {/* Checkbox */}
                                                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${isSelected
                                                                ? 'bg-primary border-primary'
                                                                : 'border-slate-600 hover:border-slate-400'
                                                                }`}>
                                                                {isSelected && (
                                                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                            {/* Avatar */}
                                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/30 shrink-0">
                                                                {getInitials(emp.name)}
                                                            </div>
                                                            {/* Info */}
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-white truncate">{emp.name}</p>
                                                                <p className="text-[11px] text-slate-400 truncate">{emp.jobRole}</p>
                                                            </div>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                            {/* Priority Level */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                                    Priority Level
                                </label>
                                <div className="flex gap-3">
                                    {['Low', 'Medium', 'High'].map(level => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, priority: level }))}
                                            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${form.priority === level
                                                ? level === 'High'
                                                    ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                                                    : level === 'Medium'
                                                        ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                                        : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                                                : 'glass-input text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                                    Due Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={form.dueDate}
                                        onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                        className="w-full glass-input rounded-xl py-3.5 pl-5 pr-10 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/tasks')}
                                className="px-8 py-3.5 rounded-xl glass-input text-white font-bold hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-bold shadow-[0_0_20px_rgba(124,59,237,0.4)] hover:shadow-[0_0_30px_rgba(124,59,237,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Assigning...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Assign Task {form.selectedEmployees.length > 1 ? `to ${form.selectedEmployees.length}` : ''}
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
