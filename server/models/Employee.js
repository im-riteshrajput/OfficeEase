import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true
   },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  jobRole : {
    type: String,
    required: true
  },
  dbRole : {
    type: String,
    required: true
  },
  department : {
    type: String,
    required: true
  },
  phone : {
    type: Number,
    required: true
  },

  joinDate : {
    type: Date,
    required: true
  },
  estatus : {
    type: String,
    required: true
  },
  address : {
    type: String,
    required: false
  },
  skills : {
    type: String,
    required: false
  },
},

{ timestamps: true }
);

const Admin = mongoose.model("Admin", userSchema, "admins");
const HR = mongoose.model("HR", userSchema, "hr_staff");
const Employee = mongoose.model("Employee", userSchema, "standard_employees");

export { Admin, HR, Employee };
export default Employee;
