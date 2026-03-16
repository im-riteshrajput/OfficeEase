import mongoose from "mongoose";

const regularizationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  requestType: {
    type: String,
    enum: ["Missed Clock-In", "Missed Clock-Out", "Wrong Time"],
    required: true
  },
  requestedClockIn: {
    type: String, // HH:MM format
    default: null
  },
  requestedClockOut: {
    type: String, // HH:MM format
    default: null
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
  }
}, { timestamps: true });

const Regularization = mongoose.model("Regularization", regularizationSchema, "regularizations");
export default Regularization;
