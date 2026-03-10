
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BadgeCheck, Zap, CalendarX, Building, MoreHorizontal } from 'lucide-react';

export default function Dashboard({ employees = [] }) {
  const total = employees.length;
  const active = employees.filter(emp => emp.estatus === "active").length;
  const onleave = employees.filter(emp => emp.estatus === "onleave").length;
  const inactive = employees.filter(emp => emp.estatus === "inactive").length;

  // Calculate Department Breakdown
  const deptCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.entries(deptCounts).map(([name, count]) => {
    return {
      name,
      pct: total > 0 ? Math.round((count / total) * 100) : 0
    };
  }).sort((a, b) => b.pct - a.pct).slice(0, 5); // Top 5

  const colors = [
    { from: "from-primary", to: "to-accent-teal" },
    { from: "from-primary", to: "to-purple-400" },
    { from: "from-accent-teal", to: "to-emerald-400" },
    { from: "from-amber-400", to: "to-orange-500" },
    { from: "from-slate-400", to: "to-slate-200" }
  ];

  // Get Recent Hires (Top 4 sorted by joiningDate descending)
  const recentHires = [...employees]
    .filter(emp => emp.joiningDate)
    .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
    .slice(0, 4);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen w-full selection:bg-primary/30">
      <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
      <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>
      <div className="liquid-orb w-[300px] h-[300px] bg-purple-900 top-[20%] right-[10%]"></div>
      <div className="flex min-h-screen">

        <main className="flex-1 ml-[260px] p-8 lg:p-12 overflow-y-auto">
          <header className="mb-10">
            <h2 className="text-4xl font-black text-white tracking-tight neon-glow-purple">Dashboard</h2>
            <p className="text-slate-400 text-lg mt-2">Welcome back! Here's your team overview.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="text-white w-14 h-14" />
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(124,59,237,0.3)]">
                <BadgeCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Employees</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-white">{total.toLocaleString()}</h3>
                  <span className="text-accent-green text-xs font-bold">+12%</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-accent-teal/20 flex items-center justify-center text-accent-teal shadow-[0_0_15px_rgba(45,212,191,0.3)]">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Active Now</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-white">{active.toLocaleString()}</h3>
                  <span className="text-rose-500 text-xs font-bold">-5%</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <CalendarX className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">On Leave</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-white">{onleave.toLocaleString()}</h3>
                  <span className="text-rose-500 text-xs font-bold">-2%</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-6 rounded-xl flex flex-col gap-4 relative overflow-hidden group">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Inactive</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-white">{inactive.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-xl">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-bold text-white">Department Breakdown</h4>
                <MoreHorizontal className="text-slate-500 cursor-pointer hover:text-white transition-colors w-6 h-6" />
              </div>
              <div className="space-y-6">
                {departmentData.map((dept, idx) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-medium">{dept.name}</span>
                      <span className="text-white font-bold">{dept.pct}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${colors[idx % colors.length].from} ${colors[idx % colors.length].to} rounded-full`} style={{ width: `${dept.pct}%` }}></div>
                    </div>
                  </div>
                ))}
                {departmentData.length === 0 && (
                  <p className="text-sm text-slate-500">No department data available.</p>
                )}
              </div>
            </div>
            <div className="glass-card p-8 rounded-xl">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-bold text-white">Recent Hires</h4>
                <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">View All</button>
              </div>
              <div className="space-y-5">
                {recentHires.map((emp) => (
                  <div key={emp._id || emp.email} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                    <img
                      className="w-12 h-12 rounded-full border-2 border-primary/30 object-cover"
                      alt={`${emp.name} Avatar`}
                      src={`https://i.pravatar.cc/150?u=${emp.email || emp.name}`}
                    />
                    <div className="flex-1">
                      <h5 className="text-white font-bold text-sm">{emp.name}</h5>
                      <p className="text-slate-400 text-xs font-medium">{emp.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-xs font-bold">{new Date(emp.joiningDate).toLocaleDateString()}</p>
                      <p className="text-primary text-[10px] font-bold uppercase tracking-wider">{emp.department}</p>
                    </div>
                  </div>
                ))}
                {recentHires.length === 0 && (
                  <p className="text-sm text-slate-500">No recent hires found.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}