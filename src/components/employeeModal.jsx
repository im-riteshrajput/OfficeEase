import { useState, useEffect } from "react";
import { X } from "lucide-react";

const emptyForm = { name: "", email: "", jobRole: "", department: "", estatus: "active", joinDate: "", phone: "", dbRole: "Employee" };

const EmployeeModal = ({ isOpen, onClose, onSave, employee, currentUserRole }) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name, email: employee.email, jobRole: employee.jobRole, department: employee.department, estatus: employee.estatus, joinDate: employee.joinDate
          ? new Date(employee.joinDate).toISOString().split("T")[0]
          : "", phone: employee.phone, dbRole: employee.dbRole || "Employee"
      });
    } else {
      setForm(emptyForm);
    }
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors";
  const labelClass = "block text-sm font-medium text-foreground mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-lg" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-xl border border-border w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">{employee ? "Edit Employee" : "Add New Employee"}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input required type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Job Role</label>
              <input required className={inputClass} value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} placeholder="Software Engineer" />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input required className={inputClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>System Role ({currentUserRole === 'Admin' ? 'Editable' : 'Locked by Admin'})</label>
              <select 
                className={`${inputClass} ${currentUserRole !== 'Admin' ? 'bg-muted cursor-not-allowed opacity-70' : ''}`}
                value={form.dbRole} 
                onChange={(e) => setForm({ ...form, dbRole: e.target.value })}
                disabled={currentUserRole !== 'Admin'}
              >
                <option value="Employee">Employee</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input 
                className={inputClass} 
                maxLength={10}
                value={form.phone} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) setForm({ ...form, phone: val });
                }} 
                placeholder="0000000000" 
              />
            </div>
            <div>
              <label className={labelClass}>Join Date</label>
              <input required type="date" className={inputClass} value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.estatus} onChange={(e) => setForm({ ...form, estatus: e.target.value })}>
              <option value="active">Active</option>
              <option value="onleave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-4 py-2.5 rounded-lg bg-black text-white text-sm font-medium hover:opacity-70 transition-opacity">
              {employee ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
