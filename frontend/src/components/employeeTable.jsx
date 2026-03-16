import { Pencil, Trash2 } from "lucide-react";


const statusStyles = {
    "active": "bg-green-100 text-success",
    "onleave": "bg-yellow-100 text-warning",
    "inactive": "bg-red-100 text-muted-foreground",
};

const EmployeeTable = ({employees, onEdit, onDelete }) => {



    return (
        <div className="w-[80vw] min-w-lg justify-self-center bg-card rounded-xl border border-border shadow-sm">
            <div className="">
                <table className="w-full ">
                    <thead>
                        <tr className="">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Department</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Join Date</th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>

                        {employees.map((emp) => (
                            <tr key={emp._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium text-sm text-card-foreground">{emp.name}</p>
                                            <p className="text-xs text-muted-foreground">{emp.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-card-foreground">{emp.jobRole}</td>
                                <td className="py-3 px-4 text-sm text-card-foreground">{emp.department}</td>
                                <td className="py-3 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[emp.estatus] || "bg-green-100 text-success"}`}>
                                        {emp.estatus === "onleave" ? "On Leave" : emp.estatus}
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-muted-foreground">{new Date(emp.joinDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                                <td className="py-3 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <button onClick={() => onEdit(emp)} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors text-gray-500 hover:text-card-foreground">
                                            <Pencil className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDelete(emp._id)} className="p-1.5 rounded-md hover:bg-red-100 transition-colors text-gray-500 hover:text-red-600">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}


                        {employees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-muted-foreground">No employees found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeTable;
