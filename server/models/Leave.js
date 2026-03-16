import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  leaveType: {
    type: String,
    enum: ["Sick", "Casual", "Paid", "Unpaid"],
    required: true
  },
  startDate: {
    type: String, // YYYY-MM-DD
    required: true
  },
  endDate: {
    type: String, // YYYY-MM-DD
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  reviewerName: {
    type: String,
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  }
}, { timestamps: true });

const Leave = mongoose.model("Leave", leaveSchema, "leaves");
export default Leave;
