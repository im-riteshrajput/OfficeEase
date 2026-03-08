function Departments() {
    return (

        <div className="w-full justify-self-center">
            <div className="w-[80vw] justify-self-center p-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Departments</h1>
                    <p className="text-muted-foreground mt-1">15 Total Departments</p>
                </div>
            </div>
            <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* {Object.entries(deptData).map(([dept, members]) => {
          const activeCount = members.filter((m) => m.status === "active").length;
          return (
            <div key={dept} className="bg-card rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">{dept}</h3>
                  <p className="text-xs text-muted-foreground">{members.length} members · {activeCount} active</p>
                </div>
              </div>
              <div className="space-y-2">
                {members.slice(0, 4).map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <img src={m.avatar} alt={m.name} className="w-7 h-7 rounded-full bg-muted" />
                    <div className="min-w-0">
                      <p className="text-sm text-card-foreground truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                    </div>
                  </div>
                ))}
                {members.length > 4 && (
                  <p className="text-xs text-muted-foreground pl-9">+{members.length - 4} more</p>
                )}
              </div>
            </div>
          );
        })} */}
                </div>
            </div>
        </div>
    );
}

export default Departments;