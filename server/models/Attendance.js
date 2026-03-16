import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Can also reference Admin/HR but we check via generic ID usually
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD
    required: true
  },
  clockIn: {
    type: Date,
    required: true
  },
  clockOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ["Present", "Late", "Absent", "Half Day"],
    default: "Present"
  },
  overtimeHours: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);
export default Attendance;
