import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import { Employee, Admin, HR } from "../models/Employee.js";
import {
  getUserConfig,
  calculateHours,
  calculateOvertimeHoursUser,
  calculateWeeklyHours,
  calculateMonthlyStats,
  getLeaveBalance,
  getAllActiveEmployeeIds,
} from "../utils/attendanceHelpers.js";

// Helper to format date as YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Helper to find user across all collections
const findUserById = async (id) => {
  const [admin, hr, emp] = await Promise.all([
    Admin.findById(id).select("name email department jobRole dbRole employeeId profilePhotoUrl"),
    HR.findById(id).select("name email department jobRole dbRole employeeId profilePhotoUrl"),
    Employee.findById(id).select("name email department jobRole dbRole employeeId profilePhotoUrl"),
  ]);
  return admin || hr || emp;
};

// ========================
// CLOCK IN
// ========================
export const clockIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = getTodayDateString();

    const existingRecord = await Attendance.findOne({ userId, date: todayStr });
    if (existingRecord) {
      return res.status(400).json({ success: false, message: "Already clocked in today" });
    }

    const config = await getUserConfig(userId);
    const now = new Date();

    // Parse shiftStart
    const [startH, startM] = config.shiftStart.split(":").map(Number);
    const shiftStartTime = new Date();
    shiftStartTime.setHours(startH, startM, 0, 0);

    // Rule: Cannot clock in BEFORE shift start
    if (now < shiftStartTime) {
      return res.status(400).json({ 
        success: false, 
        message: `You cannot clock in before your shift starts (${config.shiftStart})` 
      });
    }

    // Late threshold is 15 mins after shift start
    const lateThreshold = new Date(shiftStartTime.getTime() + 15 * 60 * 1000);
    
    // Shift length in hours
    const [endH, endM] = config.shiftEnd.split(":").map(Number);
    const shiftEndTimeForLength = new Date();
    shiftEndTimeForLength.setHours(endH, endM, 0, 0);
    const shiftLengthHours = (endH + endM/60) - (startH + startM/60);

    // If more than half the shift has passed, mark as Half Day
    const halfDayThreshold = new Date(shiftStartTime.getTime() + (shiftLengthHours / 2) * 60 * 60 * 1000);
    
    let status = "Present";
    if (now > halfDayThreshold) {
      status = "Half Day";
    } else if (now > lateThreshold) {
      status = "Late";
    }

    const newAttendance = new Attendance({
      userId,
      date: todayStr,
      clockIn: now,
      status,
    });

    await newAttendance.save();
    res.status(200).json({ success: true, message: "Clocked in successfully", data: newAttendance });
  } catch (error) {
    console.error("Clock In Error:", error);
    if (error.message === "User not found") return res.status(404).json({ success: false, message: "User account not found" });
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// CLOCK OUT (with overtime calculation)
// ========================
export const clockOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStr = getTodayDateString();

    const record = await Attendance.findOne({ userId, date: todayStr });
    if (!record) {
      return res.status(400).json({ success: false, message: "No clock-in record found for today" });
    }
    if (record.clockOut) {
      return res.status(400).json({ success: false, message: "Already clocked out today" });
    }

    const config = await getUserConfig(userId);
    const now = new Date();

    // Parse shift times
    const [startH, startM] = config.shiftStart.split(":").map(Number);
    const [endH, endM] = config.shiftEnd.split(":").map(Number);
    
    const shiftEndTime = new Date();
    shiftEndTime.setHours(endH, endM, 0, 0);

    // Shift length in hours
    const shiftLengthHours = (endH + endM/60) - (startH + startM/60);

    // Rule: Cannot clock out BEFORE shift end
    if (now < shiftEndTime) {
       // Check if less than half the shift is completed
       const workedHours = calculateHours(record.clockIn, now);
       if (workedHours < (shiftLengthHours / 2)) {
         record.status = "Half Day";
         // We allow clocking out early but it marks them as Half Day
       } else {
         return res.status(400).json({ 
          success: false, 
          message: `You cannot clock out before your shift ends (${config.shiftEnd}) unless it's a Half Day (less than ${Math.round(shiftLengthHours/2)} hours).` 
        });
       }
    }

    record.clockOut = now;

    // Calculate overtime dynamically
    record.overtimeHours = Math.round((await calculateOvertimeHoursUser(userId, record.clockIn, now)) * 100) / 100;

    await record.save();
    res.status(200).json({ success: true, message: "Clocked out successfully", data: record });
  } catch (error) {
    console.error("Clock Out Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET MY LOGS (with date range support)
// ========================
export const getMyLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    let filter = { userId };
    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    } else if (from) {
      filter.date = { $gte: from };
    } else if (to) {
      filter.date = { $lte: to };
    }

    const logs = await Attendance.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error("Get My Logs Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET MY STATS (real weekly hours, overtime, leave balance)
// ========================
export const getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const [weeklyData, leaveData] = await Promise.all([
      calculateWeeklyHours(userId),
      getLeaveBalance(userId),
    ]);

    // Monthly stats for current month
    const now = new Date();
    const monthlyData = await calculateMonthlyStats(userId, now.getFullYear(), now.getMonth());

    res.status(200).json({
      success: true,
      data: {
        weekly: weeklyData,
        monthly: monthlyData,
        leaves: leaveData,
      },
    });
  } catch (error) {
    console.error("Get My Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET ALL LOGS (Admin/HR — with date range + department filter)
// ========================
export const getAllLogs = async (req, res) => {
  try {
    const { date, from, to, department } = req.query;
    let filter = {};

    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    } else if (date) {
      filter.date = date;
    } else {
      filter.date = getTodayDateString();
    }

    const logs = await Attendance.find(filter).sort({ clockIn: -1 });

    // Manually populate user info from all collections
    const fullLogs = await Promise.all(
      logs.map(async (log) => {
        const user = await findUserById(log.userId);
        return {
          ...log._doc,
          user: user || null,
        };
      })
    );

    // Filter by department if specified
    const filteredLogs = department
      ? fullLogs.filter((l) => l.user?.department === department)
      : fullLogs;

    res.status(200).json({ success: true, data: filteredLogs });
  } catch (error) {
    console.error("Get All Logs Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET TEAM STATS (Admin/HR — real dynamic stats)
// ========================
export const getTeamStats = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || getTodayDateString();

    // Get all active employee IDs
    const allIds = await getAllActiveEmployeeIds();
    const totalEmployees = allIds.length;

    // Get today's attendance logs
    const todayLogs = await Attendance.find({ date: targetDate });
    const presentIds = todayLogs.map((l) => l.userId.toString());

    const presentCount = todayLogs.filter((l) => l.status === "Present").length;
    const lateCount = todayLogs.filter((l) => l.status === "Late").length;

    // Get approved leaves for target date
    const onLeaveCount = await Leave.countDocuments({
      status: "Approved",
      startDate: { $lte: targetDate },
      endDate: { $gte: targetDate },
    });

    // Absent = total - (present + late + on leave)
    const absentCount = Math.max(0, totalEmployees - presentCount - lateCount - onLeaveCount);

    // Attendance rate
    const attendanceRate = totalEmployees > 0
      ? Math.round(((presentCount + lateCount) / totalEmployees) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        present: presentCount,
        late: lateCount,
        onLeave: onLeaveCount,
        absent: absentCount,
        attendanceRate: `${attendanceRate}%`,
      },
    });
  } catch (error) {
    console.error("Get Team Stats Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET EMPLOYEE HISTORY (Admin/HR — specific employee)
// ========================
export const getEmployeeHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { from, to } = req.query;

    let filter = { userId: employeeId };
    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    }

    const logs = await Attendance.find(filter).sort({ date: -1 });
    const user = await findUserById(employeeId);

    res.status(200).json({
      success: true,
      data: {
        employee: user,
        logs,
      },
    });
  } catch (error) {
    console.error("Get Employee History Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// EXPORT ATTENDANCE CSV
// ========================
export const exportAttendanceCSV = async (req, res) => {
  try {
    const { from, to, date } = req.query;

    let filter = {};
    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    } else if (date) {
      filter.date = date;
    } else {
      filter.date = getTodayDateString();
    }

    const logs = await Attendance.find(filter).sort({ date: -1 });

    // Populate user info
    const fullLogs = await Promise.all(
      logs.map(async (log) => {
        const user = await findUserById(log.userId);
        return { ...log._doc, user };
      })
    );

    // Build CSV
    const headers = "Employee Name,Email,Department,Date,Clock In,Clock Out,Total Hours,Overtime,Status\n";
    const rows = fullLogs.map((log) => {
      const totalHours = calculateHours(log.clockIn, log.clockOut);
      const clockInTime = log.clockIn ? new Date(log.clockIn).toLocaleTimeString() : "N/A";
      const clockOutTime = log.clockOut ? new Date(log.clockOut).toLocaleTimeString() : "N/A";
      return `"${log.user?.name || "Unknown"}","${log.user?.email || "N/A"}","${log.user?.department || "N/A"}","${log.date}","${clockInTime}","${clockOutTime}","${totalHours.toFixed(2)}","${log.overtimeHours || 0}","${log.status}"`;
    });

    const csv = headers + rows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=attendance_report.csv`);
    res.status(200).send(csv);
  } catch (error) {
    console.error("Export CSV Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
