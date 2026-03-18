import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import { Admin, HR, Employee } from "../models/Employee.js";
import { getNowIST, getTodayIST, getISTYear } from "./istHelper.js";

// Helper to find user across all collections to read their specific config
export const getUserConfig = async (userId) => {
  const [admin, hr, emp] = await Promise.all([
    Admin.findById(userId),
    HR.findById(userId),
    Employee.findById(userId),
  ]);
  const user = admin || hr || emp;
  
  if (!user) throw new Error("User not found");
  
  return {
    shiftStart: user.shiftStart || "09:00",
    shiftEnd: user.shiftEnd || "17:00",
    workingDaysPerWeek: user.workingDaysPerWeek || 5,
    casualLeaves: user.casualLeaves !== undefined ? user.casualLeaves : 12,
    sickLeaves: user.sickLeaves !== undefined ? user.sickLeaves : 12,
  };
};

/**
 * Calculate total hours between clockIn and clockOut
 */
export function calculateHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  const diffMs = new Date(clockOut) - new Date(clockIn);
  return Math.max(0, diffMs / (1000 * 60 * 60));
}

/**
 * Calculate overtime hours (anything beyond standard shift)
 */
export async function calculateOvertimeHoursUser(userId, clockIn, clockOut) {
  const config = await getUserConfig(userId);
  const [startH, startM] = config.shiftStart.split(":").map(Number);
  const [endH, endM] = config.shiftEnd.split(":").map(Number);
  
  let standardHours = (endH + endM/60) - (startH + startM/60);
  if (standardHours <= 0) standardHours = 8; // fallback
  
  const totalHours = calculateHours(clockIn, clockOut);
  return Math.max(0, totalHours - standardHours);
}

/**
 * Get the Monday of the current week (start of week)
 */
function getWeekStart() {
  const ist = getNowIST();
  const day = ist.getUTCDay();
  const diff = ist.getUTCDate() - day + (day === 0 ? -6 : 1); // Monday
  ist.setUTCDate(diff);
  ist.setUTCHours(0, 0, 0, 0);
  return ist;
}

/**
 * Calculate real weekly hours for a user
 */
export async function calculateWeeklyHours(userId) {
  const weekStart = getWeekStart();
  const year = weekStart.getUTCFullYear();
  const month = String(weekStart.getUTCMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getUTCDate()).padStart(2, "0");
  const weekStartStr = `${year}-${month}-${day}`;
  const today = getTodayIST();

  const logs = await Attendance.find({
    userId,
    date: { $gte: weekStartStr, $lte: today },
  });

  let totalHours = 0;
  let totalOvertime = 0;

  logs.forEach((log) => {
    const hours = calculateHours(log.clockIn, log.clockOut);
    totalHours += hours;
    totalOvertime += log.overtimeHours || 0;
  });

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    totalOvertime: Math.round(totalOvertime * 100) / 100,
    daysWorked: logs.length,
  };
}

/**
 * Calculate monthly stats for a user
 */
export async function calculateMonthlyStats(userId, year, month) {
  // month is 0-indexed (0 = January)
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  const logs = await Attendance.find({
    userId,
    date: { $gte: startDate, $lte: endDate },
  });

  const approvedLeaves = await Leave.find({
    userId,
    status: "Approved",
    $or: [
      { startDate: { $gte: startDate, $lte: endDate } },
      { endDate: { $gte: startDate, $lte: endDate } },
    ],
  });

  let totalHours = 0;
  let presentDays = 0;
  let lateDays = 0;
  let halfDays = 0;
  let totalOvertime = 0;

  logs.forEach((log) => {
    totalHours += calculateHours(log.clockIn, log.clockOut);
    totalOvertime += log.overtimeHours || 0;
    if (log.status === "Present") presentDays++;
    if (log.status === "Late") lateDays++;
    if (log.status === "Half Day") halfDays++;
  });

  // Count leave days
  let leaveDays = 0;
  approvedLeaves.forEach((leave) => {
    const start = new Date(Math.max(new Date(leave.startDate), new Date(startDate)));
    const end = new Date(Math.min(new Date(leave.endDate), new Date(endDate)));
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    leaveDays += Math.max(0, days);
  });

  return {
    totalHours: Math.round(totalHours * 100) / 100,
    totalOvertime: Math.round(totalOvertime * 100) / 100,
    presentDays,
    lateDays,
    halfDays,
    leaveDays,
    workedDays: logs.length,
  };
}

/**
 * Get leave balance for a user for the current year
 */
export async function getLeaveBalance(userId) {
  const config = await getUserConfig(userId);
  
  const allowance = {
    Sick: config.sickLeaves,
    Casual: config.casualLeaves,
    Paid: 15, // standard paid leaves
    Unpaid: Infinity, // Unlimited unpaid
  };

  const year = getISTYear();
  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;

  const approvedLeaves = await Leave.find({
    userId,
    status: "Approved",
    startDate: { $gte: startOfYear, $lte: endOfYear },
  });

  // Calculate used days per type
  const used = { Sick: 0, Casual: 0, Paid: 0, Unpaid: 0 };
  approvedLeaves.forEach((leave) => {
    const days = Math.floor(
      (new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)
    ) + 1;
    if (used[leave.leaveType] !== undefined) {
      used[leave.leaveType] += days;
    }
  });

  const balance = {};
  for (const type of Object.keys(allowance)) {
    balance[type] = {
      total: allowance[type] === Infinity ? "Unlimited" : allowance[type],
      used: used[type],
      remaining: allowance[type] === Infinity ? "Unlimited" : Math.max(0, allowance[type] - used[type]),
    };
  }

  // Total remaining (excluding Unpaid)
  const totalRemaining = Object.keys(balance)
    .filter((t) => t !== "Unpaid")
    .reduce((sum, t) => sum + (typeof balance[t].remaining === "number" ? balance[t].remaining : 0), 0);

  return { balance, totalRemaining };
}

/**
 * Get all active employee IDs from all collections
 */
export async function getAllActiveEmployeeIds() {
  const [admins, hrs, employees] = await Promise.all([
    Admin.find({ estatus: "active" }).select("_id"),
    HR.find({ estatus: "active" }).select("_id"),
    Employee.find({ estatus: "active" }).select("_id"),
  ]);
  return [...admins, ...hrs, ...employees].map((u) => u._id.toString());
}
