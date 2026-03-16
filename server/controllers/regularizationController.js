import Regularization from "../models/Regularization.js";
import Attendance from "../models/Attendance.js";
import { Admin, HR, Employee } from "../models/Employee.js";

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
// REQUEST REGULARIZATION (Employee)
// ========================
export const requestRegularization = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, requestType, requestedClockIn, requestedClockOut, reason } = req.body;

    if (!date || !requestType || !reason) {
      return res.status(400).json({ success: false, message: "Date, request type, and reason are required" });
    }

    // Check for duplicate pending request
    const existing = await Regularization.findOne({
      userId,
      date,
      status: "Pending",
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "You already have a pending request for this date" });
    }

    const newRequest = new Regularization({
      userId,
      date,
      requestType,
      requestedClockIn: requestedClockIn || null,
      requestedClockOut: requestedClockOut || null,
      reason,
    });

    await newRequest.save();
    res.status(201).json({ success: true, message: "Regularization request submitted", data: newRequest });
  } catch (error) {
    console.error("Request Regularization Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET MY REGULARIZATIONS (Employee)
// ========================
export const getMyRegularizations = async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await Regularization.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("Get My Regularizations Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// GET ALL REGULARIZATIONS (Admin/HR)
// ========================
export const getAllRegularizations = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const requests = await Regularization.find(filter).sort({ createdAt: -1 });

    const fullRequests = await Promise.all(
      requests.map(async (req) => {
        const user = await findUserById(req.userId);
        return { ...req._doc, user: user || null };
      })
    );

    res.status(200).json({ success: true, data: fullRequests });
  } catch (error) {
    console.error("Get All Regularizations Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ========================
// REVIEW REGULARIZATION (Admin/HR — approve/reject)
// ========================
export const reviewRegularization = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reviewerId = req.user.id;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be Approved or Rejected" });
    }

    const request = await Regularization.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Request already reviewed" });
    }

    const reviewer = await findUserById(reviewerId);

    request.status = status;
    request.reviewedBy = reviewerId;
    request.reviewerName = reviewer?.name || "Unknown";
    request.reviewedAt = new Date();

    await request.save();

    // If approved, update the attendance record
    if (status === "Approved") {
      let attendance = await Attendance.findOne({ userId: request.userId, date: request.date });

      if (request.requestType === "Missed Clock-In" && request.requestedClockIn) {
        // Create or update attendance record with the corrected clock-in
        const [hours, minutes] = request.requestedClockIn.split(":");
        const clockInDate = new Date(request.date);
        clockInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        if (!attendance) {
          attendance = new Attendance({
            userId: request.userId,
            date: request.date,
            clockIn: clockInDate,
            status: "Present",
          });
        } else {
          attendance.clockIn = clockInDate;
        }
        await attendance.save();
      }

      if (request.requestType === "Missed Clock-Out" && request.requestedClockOut) {
        if (attendance) {
          const [hours, minutes] = request.requestedClockOut.split(":");
          const clockOutDate = new Date(request.date);
          clockOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          attendance.clockOut = clockOutDate;

          // Recalculate overtime
          const diffHrs = (clockOutDate - new Date(attendance.clockIn)) / (1000 * 60 * 60);
          attendance.overtimeHours = Math.max(0, Math.round((diffHrs - 8) * 100) / 100);
          await attendance.save();
        }
      }

      if (request.requestType === "Wrong Time") {
        if (attendance) {
          if (request.requestedClockIn) {
            const [h, m] = request.requestedClockIn.split(":");
            const d = new Date(request.date);
            d.setHours(parseInt(h), parseInt(m), 0, 0);
            attendance.clockIn = d;
          }
          if (request.requestedClockOut) {
            const [h, m] = request.requestedClockOut.split(":");
            const d = new Date(request.date);
            d.setHours(parseInt(h), parseInt(m), 0, 0);
            attendance.clockOut = d;
          }
          if (attendance.clockIn && attendance.clockOut) {
            const diffHrs = (new Date(attendance.clockOut) - new Date(attendance.clockIn)) / (1000 * 60 * 60);
            attendance.overtimeHours = Math.max(0, Math.round((diffHrs - 8) * 100) / 100);
          }
          await attendance.save();
        }
      }
    }

    res.status(200).json({ success: true, message: `Request ${status.toLowerCase()}`, data: request });
  } catch (error) {
    console.error("Review Regularization Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
