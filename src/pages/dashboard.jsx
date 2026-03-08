import StatCard from "../components/statCard.jsx";


function Dashboard({employees}) {

  // filter status and update counts
  const active = employees.filter(emp => emp.estatus === "active").length;
  const onleave = employees.filter(emp => emp.estatus === "onleave").length;


  return (
    <>
    <div className="w-full flex justify-center">
      <div className="w-[70vw] justify-self-center ml-20 my-8">
    <div>
      <div className="w-full my-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your team overview.</p>
      </div>

      <div className="w-full justify-self-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Employees" value={employees.length} />
        <StatCard title="Active" value={active}/>
        <StatCard title="On Leave" value={onleave}/>
        <StatCard title="Departments" value="0"/>
      </div>

      <div className="w-full justify-self-center grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Department breakdown */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-4">Department Breakdown</h3>
          <div className="space-y-3">
            {/* {Object.entries(deptData).map(([dept, count]) => (
              <div key={dept}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-card-foreground font-medium">{dept}</span>
                  <span className="text-muted-foreground">{count} employees</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${(count / employees.length) * 100}%` }}
                  />
                </div>
              </div>
            ))} */}
          </div>
        </div>

        {/* Recent hires */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-card-foreground mb-4">Recent Hires</h3>
          <div className="space-y-3">
            {/* {recentEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center gap-3 py-2">
                <img src={emp.avatar} alt={emp.name} className="w-9 h-9 rounded-full bg-muted" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground truncate">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.role}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(emp.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
            ))} */}
          </div>
        </div>
      </div>
    </div>
    


    {/* <div style={{ padding: "40px" }}>
      <h1>MongoDB Atlas + Vite</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}

          
          />
        <input
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          />
        <input
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          />
        <input
          placeholder="Estatus"
          value={estatus}
          onChange={(e) => setEstatus(e.target.value)}
          />
        <input
          placeholder="Join Date (YYYY-MM-DD)"
          value={joinDate}
          onChange={(e) => setJoinDate(e.target.value)}
          />
        <button type="submit">Add User</button>
      </form>

      <h2>Users List</h2>
      {users.map((user) => (
          <div key={user._id}>
          {user.name} - {user.email} - {user.role} - {user.department} - {user.estatus} - {new Date(user.joinDate).toLocaleDateString()}
        </div>
      ))}
    </div> */}
      </div>
      </div>

      </>
  );
}

export default Dashboard;
