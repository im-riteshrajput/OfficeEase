// import StatCard from "../components/statCard.jsx";

// function Dashboard({ employees }) {
//   const active = employees.filter(emp => emp.estatus === "active").length;
//   const onleave = employees.filter(emp => emp.estatus === "onleave").length;

//   return (
//     <div className="w-full flex justify-center animate-fade-in">
//       <div className="w-full max-w-6xl px-8 py-8">
//         {/* Page Title */}
//         <div className="mb-8">
//           <h1 className="page-title">Dashboard</h1>
//           <p className="page-subtitle">Welcome back! Here's your team overview.</p>
//         </div>

//         {/* Stat Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
//           <StatCard title="Total Employees" value="1,284" trend="+12%" trendColor="emerald" />
//           <StatCard title="Active Now" value="1,150" trend="-5%" trendColor="red" />
//           <StatCard title="On Leave" value="42" trend="-2%" trendColor="red" />
//           <StatCard title="Departments" value="12" trend="Stable" trendColor="gray" />
//         </div>

//         {/* Info Panels */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//           {/* Department Breakdown */}
//           <div className="glass-panel-static p-6 rounded-2xl flex flex-col">
//             <div className="flex justify-between items-center mb-6">
//                 <h3 className="font-semibold text-lg" style={{ color: 'var(--color-light)' }}>Department Breakdown</h3>
//                 <button className="text-gray-400 hover:text-white transition-colors">
//                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
//                     </svg>
//                 </button>
//             </div>
//             <div className="space-y-6">
//               {[
//                 { name: "Engineering", pct: 42, color1: "#06B6D4", color2: "#3B82F6" },
//                 { name: "Marketing", pct: 28, color1: "#A855F7", color2: "#7C3AED" },
//                 { name: "Design", pct: 15, color1: "#10B981", color2: "#059669" },
//                 { name: "Sales", pct: 10, color1: "#F59E0B", color2: "#D97706" },
//                 { name: "Legal & HR", pct: 5, color1: "#9CA3AF", color2: "#6B7280" }
//               ].map((dept) => {
//                 return (
//                   <div key={dept.name}>
//                     <div className="flex justify-between text-sm mb-2">
//                       <span style={{ color: 'var(--color-light)' }} className="font-medium">{dept.name}</span>
//                       <span style={{ color: 'var(--color-light)' }} className="font-bold">{dept.pct}%</span>
//                     </div>
//                     <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
//                       <div
//                         className="h-full rounded-full transition-all duration-500 shadow-md"
//                         style={{
//                           width: `${dept.pct}%`,
//                           background: `linear-gradient(90deg, ${dept.color1}, ${dept.color2})`,
//                           boxShadow: `0 0 10px ${dept.color1}80`
//                         }}
//                       />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Recent Hires */}
//           <div className="glass-panel-static p-6 rounded-2xl flex flex-col">
//             <div className="flex justify-between items-center mb-6">
//                 <h3 className="font-semibold text-lg" style={{ color: 'var(--color-light)' }}>Recent Hires</h3>
//                 <button className="text-sm font-semibold transition-colors hover:text-purple-300" style={{ color: 'var(--color-purple)' }}>
//                     View All
//                 </button>
//             </div>
//             <div className="space-y-5">
//               {[
//                   { name: "Sarah Jenkins", role: "Senior UI Designer", date: "Oct 12, 2023", dept: "DESIGN", color: "#10B981" },
//                   { name: "Marcus Thorne", role: "Backend Engineer", date: "Oct 09, 2023", dept: "ENGINEERING", color: "#A855F7" },
//                   { name: "Elena Rodriguez", role: "Growth Lead", date: "Oct 05, 2023", dept: "MARKETING", color: "#EC4899" },
//                   { name: "Julian Black", role: "Product Manager", date: "Sep 28, 2023", dept: "PRODUCT", color: "#F59E0B" }
//               ].map((emp, idx) => (
//                 <div key={idx} className="flex items-center gap-4 py-1">
//                   <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden border border-white/10"
//                     style={{ background: 'rgba(255,255,255,0.05)' }}>
//                     <img src={`https://i.pravatar.cc/150?u=${emp.name}`} alt={emp.name} className="w-full h-full object-cover" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-light)' }}>{emp.name}</p>
//                     <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{emp.role}</p>
//                   </div>
//                   <div className="text-right">
//                       <p className="text-xs font-semibold whitespace-nowrap mb-1" style={{ color: 'var(--color-light)' }}>
//                         {emp.date}
//                       </p>
//                       <p className="text-[10px] font-bold tracking-wider" style={{ color: emp.color }}>
//                         {emp.dept}
//                       </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BadgeCheck, Zap, CalendarX, Building, MoreHorizontal, UserCircle } from 'lucide-react';

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

  // Get Recent Hires (Top 4 sorted by joinDate descending)
  const recentHires = [...employees]
    .filter(emp => emp.joinDate)
    .sort((a, b) => {
      const dateA = new Date(a.joinDate?.$date || a.joinDate);
      const dateB = new Date(b.joinDate?.$date || b.joinDate);
      return dateB - dateA;
    })
    .slice(0, 4);

  return (
    <div className="font-display bg-background-dark text-slate-100 min-h-screen selection:bg-primary/30">
      <div className="liquid-orb w-[500px] h-[500px] bg-primary top-[-10%] left-[-5%]"></div>
      <div className="liquid-orb w-[400px] h-[400px] bg-accent-teal bottom-[-10%] right-[-5%]"></div>
      <div className="liquid-orb w-[300px] h-[300px] bg-purple-900 top-[20%] right-[10%]"></div>
      <div className="flex min-h-screen w-full min-w-0">

        <main className="flex-1 p-3 sm:p-8 lg:p-12 overflow-y-auto w-full min-w-0 overflow-x-hidden">
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
                  {/* <span className="text-accent-green text-xs font-bold">+12%</span> */}
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
                  {/* <span className="text-rose-500 text-xs font-bold">-5%</span> */}
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
                  {/* <span className="text-rose-500 text-xs font-bold">-2%</span> */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 w-full min-w-0">
            <div className="glass-card p-4 sm:p-8 rounded-xl w-full min-w-0">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h4 className="text-lg sm:text-xl font-bold text-white">Department Breakdown</h4>
                <MoreHorizontal className="text-slate-500 cursor-pointer hover:text-white transition-colors w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              </div>
              <div className="space-y-4 sm:space-y-6">
                {departmentData.map((dept, idx) => (
                  <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-slate-300 font-medium truncate pr-2">{dept.name}</span>
                      <span className="text-white font-bold shrink-0">{dept.pct}%</span>
                    </div>
                    <div className="h-2 sm:h-3 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${colors[idx % colors.length].from} ${colors[idx % colors.length].to} rounded-full`} style={{ width: `${dept.pct}%` }}></div>
                    </div>
                  </div>
                ))}
                {departmentData.length === 0 && (
                  <p className="text-sm text-slate-500">No department data available.</p>
                )}
              </div>
            </div>
            <div className="glass-card p-4 sm:p-8 rounded-xl w-full min-w-0">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <h4 className="text-lg sm:text-xl font-bold text-white">Recent Hires</h4>
                <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">View All</button>
              </div>
              <div className="space-y-3 sm:space-y-5">
                {recentHires.map((emp) => (
                  <div key={emp._id || emp.email} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer">
                    <UserCircle
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full text-slate-400 shrink-0"
                      strokeWidth={1.5}
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-white font-bold text-xs sm:text-sm truncate">{emp.name}</h5>
                      <p className="text-slate-400 text-[10px] sm:text-xs font-medium truncate">{emp.jobRole || emp.role}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-[10px] sm:text-sm text-white font-medium">
                        {emp.joinDate ? new Date(emp.joinDate?.$date || emp.joinDate).toLocaleDateString() : "N/A"}
                      </p>
                      <p className="text-primary text-[8px] sm:text-[10px] font-bold uppercase tracking-wider truncate max-w-[60px] sm:max-w-none">{emp.department}</p>
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
