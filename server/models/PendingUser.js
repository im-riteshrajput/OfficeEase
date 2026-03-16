import mongoose from "mongoose";

const pendingUserSchema = new mongoose.Schema({
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
    default: "pending"
  },
  address : {
    type: String,
    required: false
  },
  skills : {
    type: String,
    required: false
  },
  profilePhotoUrl: {
    type: String,
    required: false
  },
  profilePhotoPublicId: {
    type: String,
    required: false
  }
},

{ timestamps: true }
);

const PendingUser = mongoose.model("PendingUser", pendingUserSchema, "pending_users");

export default PendingUser;
