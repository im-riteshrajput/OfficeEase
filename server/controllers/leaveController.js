import Leave from "../models/Leave.js";
import { Admin, HR, Employee } from "../models/Employee.js";
import { getLeaveBalance } from "../utils/attendanceHelpers.js";

// Helper to find user across all collections
const findUserById = async (id) => {
  const [admin, hr, emp] = await Promise.all([
    Admin.findById(id).select("name email department jobRole dbRole"),
    HR.findById(id).select("name email department jobRole dbRole"),
    Employee.findById(id).select("name email department jobRole dbRole"),
  ]);
  return admin || hr || emp;
};

// ========================
// APPLY FOR LEAVE (Employee)
// ========================
export const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: "Start date must be before end date" });
    }

    // Check for overlapping leave requests
    const overlapping = await Leave.findOne({
      userId,
      status: { $ne: "Rejected" },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (overlapping) {
      return res.status(400).json({ success: false, message: "You already have a leave request for those dates" });
    }

    // Check remaining balance
    const { balance } = await getLeaveBalance(userId);
    const requestedDays = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;

    if (leaveType !== "Unpaid" && balance[leaveType]) {
      const remaining = balance[leaveType].remaining;
      if (typeof remaining === "number" && requestedDays > remaining) {
        return res.status(400).json({
          success: false,
          message: `Insufficient ${leaveType} leave balance. You have ${remaining} days remaining.`,
        });
      }
    }

    const newLeave = new Leave({
      userId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    await newLeave.save();
    res.status(201).json({ success: true, message: "Leave request submitted", data: newLeave });
  } catch (error) {
    console.error("Apply Leave Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET MY LEAVES (Employee)
// ========================
export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaves = await Leave.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    console.error("Get My Leaves Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET LEAVE BALANCE (Employee)
// ========================
export const getLeaveBalanceEndpoint = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await getLeaveBalance(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get Leave Balance Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET ALL LEAVE REQUESTS (Admin/HR)
// ========================
export const getAllLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const leaves = await Leave.find(filter).sort({ createdAt: -1 });

    // Populate user info
    const fullLeaves = await Promise.all(
      leaves.map(async (leave) => {
        const user = await findUserById(leave.userId);
        return { ...leave._doc, user: user || null };
      })
    );

    res.status(200).json({ success: true, data: fullLeaves });
  } catch (error) {
    console.error("Get All Leave Requests Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// REVIEW LEAVE (Admin/HR — approve/reject)
// ========================
export const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const reviewerId = req.user.id;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Approved or Rejected" });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave request not found" });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Leave already reviewed" });
    }

    const reviewer = await findUserById(reviewerId);

    leave.status = status;
    leave.reviewedBy = reviewerId;
    leave.reviewerName = reviewer?.name || "Unknown";
    leave.reviewedAt = new Date();
    if (status === "Rejected" && rejectionReason) {
      leave.rejectionReason = rejectionReason;
    }

    await leave.save();
    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()}`, data: leave });
  } catch (error) {
    console.error("Review Leave Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
