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
  altphone : {
    type: Number,
    required: false
  },
  joinDate : {
    type: Date,
    required: true
  },
  estatus : {
    type: String,
    required: true
  },
},

{ collection: "employees" }
);

export default mongoose.model("Employee", userSchema);
