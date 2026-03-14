import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  assignees: [{
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  assignedByName: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  dueDate: {
    type: Date,
    required: true
  }
}, { timestamps: true });

const Task = mongoose.model("Task", taskSchema, "tasks");

export default Task;
