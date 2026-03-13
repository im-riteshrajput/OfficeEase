import { Building2, UserCircle } from "lucide-react";
import React from "react";

const deptList = [
  { name: "Engineering", color: "#7C3AED" },
  { name: "Design", color: "#06B6D4" },
  { name: "Marketing", color: "#3B82F6" },
  { name: "Human Resources", color: "#10B981" },
  { name: "Product", color: "#F59E0B" },
  { name: "Sales", color: "#EF4444" },
];

export default function Departments({ employees = [] }) {
  return (
    <div className="font-display bg-background-dark text-slate-100 min-h-screen selection:bg-primary/30">
      <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
      <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>
      <div className="flex min-h-screen w-full">
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto z-10">
          <header className="mb-10">
            <h2 className="text-4xl font-black text-white tracking-tight neon-glow-purple">Departments</h2>
            <p className="text-slate-400 text-lg mt-2">{deptList.length} Total Departments</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deptList.map((dept) => {
              const deptEmployees = employees.filter(emp => emp.department === dept.name);
              const activeCount = deptEmployees.filter(emp => emp.estatus === "active").length;

              return (
                <div key={dept.name} className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group cursor-pointer hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-4 mb-2">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${dept.color}20`,
                        boxShadow: `0 0 15px ${dept.color}30`,
                      }}
                    >
                      <Building2 className="w-6 h-6" style={{ color: dept.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{dept.name}</h3>
                      <p className="text-sm text-slate-400">
                        {deptEmployees.length} members · <span className="text-accent-green">{activeCount} active</span>
                      </p>
                    </div>
                  </div>

                  {/* Preview of members */}
                  <div className="mt-2 flex -space-x-3 overflow-hidden p-1">
                    {deptEmployees.slice(0, 5).map((emp, idx) => (
                      <UserCircle
                        key={emp._id || idx}
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-background-dark text-slate-400"
                        strokeWidth={1.5}
                        title={emp.name}
                      />
                    ))}
                    {deptEmployees.length > 5 && (
                      <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-background-dark bg-white/10 text-xs font-bold text-white shadow-inner">
                        +{deptEmployees.length - 5}
                      </div>
                    )}
                    {deptEmployees.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No members assigned yet.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}