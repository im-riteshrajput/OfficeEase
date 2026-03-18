import express from "express";
import { Admin, HR, Employee } from "../models/Employee.js";
import PastMember from "../models/PastMember.js";
import PendingUser from "../models/PendingUser.js";
import Leave from "../models/Leave.js";
import { verifyToken, authorize } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";
import { generateEmployeeId } from "../utils/employeeIdHelper.js";
import { getTodayIST } from "../utils/istHelper.js";
import { upload, cloudinary } from "../utils/cloudinary.js";

const router = express.Router();

// Helper to calculate dynamic status based on leaves
const assignDynamicStatus = async (users) => {
    const today = getTodayIST();
    const leaves = await Leave.find({
        status: "Approved",
        startDate: { $lte: today },
        endDate: { $gte: today }
    });

    const usersOnLeave = new Set(leaves.map(l => l.userId.toString()));

    return users.map(user => {
        const userObj = user.toObject ? user.toObject() : user;
        if (usersOnLeave.has(userObj._id.toString())) {
            userObj.estatus = "onleave";
        } else {
            userObj.estatus = "active";
        }
        return userObj;
    });
};

// GET all employees (Tiered Access)
router.get("/", verifyToken, async (req, res) => {
  const { role, id } = req.user;

  try {
    let users = [];
    if (role === 'Admin') {
      const [admins, hr, staff] = await Promise.all([
        Admin.find(),
        HR.find(),
        Employee.find()
      ]);
      users = [...admins, ...hr, ...staff];
    } else if (role === 'Human Resources') {
      const [hr, staff] = await Promise.all([
        HR.find(),
        Employee.find()
      ]);
      users = [...hr, ...staff];
    } else {
      // Standard Employee: Only see themselves
      const self = await Employee.findById(id);
      if (!self) {
          return res.status(404).json({ message: "Employee record not found" });
      }
      users = [self];
    }

    const usersWithDynamicStatus = await assignDynamicStatus(users);
    res.json(usersWithDynamicStatus);

  } catch (error) {
    console.error("FETCH ERROR:", error);
    res.status(500).json({ message: "Error fetching segregated data" });
  }
});

// GET all past members (Admin only)
router.get("/past", verifyToken, authorize(['Admin']), async (req, res) => {
  try {
    const pastMembers = await PastMember.find().sort({ createdAt: -1 });
    res.json(pastMembers);
  } catch (error) {
    console.error("FETCH PAST MEMBERS ERROR:", error);
    res.status(500).json({ message: "Error fetching past members" });
  }
});

// GET a specific past member by ID (Admin only)
router.get("/past/:id", verifyToken, authorize(['Admin']), async (req, res) => {
  try {
    const pastMember = await PastMember.findById(req.params.id);
    if (!pastMember) {
      return res.status(404).json({ message: "Past member not found" });
    }
    res.json(pastMember);
  } catch (error) {
    console.error("FETCH PAST MEMBER ERROR:", error);
    res.status(500).json({ message: "Error fetching past member" });
  }
});

// DELETE a past member permanently (Admin only)
router.delete("/past/:id", verifyToken, authorize(['Admin']), async (req, res) => {
  const { password } = req.body;
  const adminId = req.user.id;

  if (!password) {
    return res.status(400).json({ message: "Password is required to confirm permanent deletion" });
  }

  try {
    // Verify admin's password
    const admin = await Admin.findById(adminId);
    if (!admin) {
        return res.status(404).json({ message: "Admin account not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password. Deletion cancelled." });
    }

    const memberToDelete = await PastMember.findById(req.params.id);
    if (!memberToDelete) {
      return res.status(404).json({ message: "Past member not found or already deleted" });
    }

    // Delete photo from Cloudinary if it exists
    if (memberToDelete.profilePhotoPublicId) {
       try {
           await cloudinary.uploader.destroy(memberToDelete.profilePhotoPublicId);
       } catch (cloudinaryError) {
           console.error("Cloudinary deletion error:", cloudinaryError);
           // We continue with member deletion even if cloudinary fails
       }
    }

    const deletedMember = await PastMember.findByIdAndDelete(req.params.id);
    
    if (!deletedMember) {
      return res.status(404).json({ message: "Past member not found or already deleted" });
    }

    res.json({ message: "Past member permanently deleted successfully" });
  } catch (error) {
    console.error("PERMANENT DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET all pending users (Admin/HR only)
router.get("/pending", verifyToken, authorize(['Admin', 'Human Resources']), async (req, res) => {
  try {
    const pendingUsers = await PendingUser.find().sort({ createdAt: -1 });
    res.json(pendingUsers);
  } catch (error) {
    console.error("FETCH PENDING ERROR:", error);
    res.status(500).json({ message: "Error fetching pending users" });
  }
});

// PUT approve pending user (Admin/HR only)
router.put("/:id/approve", verifyToken, authorize(['Admin', 'Human Resources']), async (req, res) => {
  try {
    const pendingUser = await PendingUser.findById(req.params.id);
    if (!pendingUser) {
      return res.status(404).json({ message: "Pending user not found" });
    }

    // Determine target collection based on dbRole
    let Model;
    if (pendingUser.dbRole === 'Admin') Model = Admin;
    else if (pendingUser.dbRole === 'Human Resources') Model = HR;
    else Model = Employee;

    // Create in the actual collection
    const userData = pendingUser.toObject();
    delete userData._id;
    delete userData.__v;
    userData.estatus = "active";

    // Generate custom Employee ID
    userData.employeeId = await generateEmployeeId(userData.department, userData.joinDate);

    const newUser = new Model(userData);
    await newUser.save();

    // Delete from pending
    await PendingUser.findByIdAndDelete(req.params.id);

    res.json({ message: "User approved successfully", user: newUser });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    res.status(500).json({ message: "Error approving user" });
  }
});

// DELETE reject pending user (Admin/HR only)
router.delete("/:id/reject", verifyToken, authorize(['Admin', 'Human Resources']), async (req, res) => {
  try {
    const pendingUser = await PendingUser.findByIdAndDelete(req.params.id);
    if (!pendingUser) {
      return res.status(404).json({ message: "Pending user not found" });
    }
    res.json({ message: "Application rejected and deleted" });
  } catch (error) {
    console.error("REJECT ERROR:", error);
    res.status(500).json({ message: "Error rejecting user" });
  }
});

// POST new employee (Admin/HR only)
router.post("/", verifyToken, authorize(['Admin', 'Human Resources']), async (req, res) => {
  const { dbRole } = req.body;
  
  let Model;
  if (dbRole === 'Admin') Model = Admin;
  else if (dbRole === 'Human Resources') Model = HR;
  else Model = Employee;

  try {
    // Generate custom Employee ID
    const employeeId = await generateEmployeeId(req.body.department, req.body.joinDate);
    const newUser = new Model({ ...req.body, employeeId });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE employee (Admin only)
router.delete("/:id", verifyToken, authorize(['Admin']), async (req, res) => {
  const { password } = req.body;
  const adminId = req.user.id;

  if (!password) {
    return res.status(400).json({ message: "Password is required to confirm deletion" });
  }

  try {
    // Verify admin's password
    const admin = await Admin.findById(adminId);
    if (!admin) {
        return res.status(404).json({ message: "Admin account not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password. Deletion cancelled." });
    }

    // Proceed with deletion if password matches
    // First, find the user in any of the active collections to save them to past_members before deleting
    const [adminUser, hrUser, empUser] = await Promise.all([
      Admin.findById(req.params.id),
      HR.findById(req.params.id),
      Employee.findById(req.params.id)
    ]);

    const userToDelete = adminUser || hrUser || empUser;

    if (!userToDelete) {
      return res.status(404).json({ message: "Employee not found or already deleted" });
    }

    // Save to past_members collection
    const deletedUserData = userToDelete.toObject();
    
    // Check if they are already in past_members to avoid duplicate key errors on email
    const existingPastMember = await PastMember.findOne({ email: deletedUserData.email });
    if (!existingPastMember) {
        const pastMemberRecord = new PastMember(deletedUserData);
        await pastMemberRecord.save();
    }

    // Now delete from the active collections
    await Promise.allSettled([
      Admin.findByIdAndDelete(req.params.id),
      HR.findByIdAndDelete(req.params.id),
      Employee.findByIdAndDelete(req.params.id)
    ]);

    res.json({ message: "Employee deleted and saved to past members successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update employee (Admin/HR can update any they can see, Employee can update self)
router.put("/:id", verifyToken, async (req, res) => {
  const { role, id } = req.user;
  const targetId = req.params.id;

  // Authorization check
  if (role === 'Employee' && id !== targetId) {
    return res.status(403).json({ message: "Access denied: You can only update your own profile" });
  }

  // HR cannot update Admin
  if (role === 'Human Resources') {
     const isAdmin = await Admin.findById(targetId);
     if (isAdmin) {
         return res.status(403).json({ message: "Access denied: HR cannot modify Admin records" });
     }
  }

  // Only Admin can change dbRole
  if (role !== 'Admin' && req.body.dbRole) {
      delete req.body.dbRole; // Forcefully remove dbRole from payload to prevent privilege escalation
  }

  try {
    let updateResult;

    // Check if dbRole is being changed by an Admin
    if (role === 'Admin' && req.body.dbRole) {
        // Find the user to check their current dbRole
        const [existingAdmin, existingHR, existingEmployee] = await Promise.all([
            Admin.findById(targetId),
            HR.findById(targetId),
            Employee.findById(targetId)
        ]);

        const existingUser = existingAdmin || existingHR || existingEmployee;

        if (!existingUser) {
            return res.status(404).json({ message: "Employee not found" });
        }

        // Check if role actually changed
        if (existingUser.dbRole !== req.body.dbRole) {
            // Determine the current collection model based on where it was found
            let CurrentModel = existingAdmin ? Admin : (existingHR ? HR : Employee);
            
            // Determine the new collection model based on the requested dbRole
            let NewModel;
            if (req.body.dbRole === 'Admin') NewModel = Admin;
            else if (req.body.dbRole === 'Human Resources') NewModel = HR;
            else NewModel = Employee;

            // Prepare the new document data, merging updates with existing data
            const newUserData = { ...existingUser.toObject(), ...req.body };
            
            // We shouldn't change the _id itself if we can help it, 
            // but creating a new document in a different collection allows maintaining the _id
            const migratedUser = new NewModel(newUserData);
            
            // Save to new collection
            updateResult = await migratedUser.save();
            
            // Delete from old collection
            await CurrentModel.findByIdAndDelete(targetId);

            return res.json({ message: "Role updated and user migrated successfully", user: updateResult });
        }
    }

    // Standard update if dbRole didn't change or if it's not being modified
    const [adminUpdate, hrUpdate, empUpdate] = await Promise.all([
      Admin.findByIdAndUpdate(targetId, req.body, { new: true }),
      HR.findByIdAndUpdate(targetId, req.body, { new: true }),
      Employee.findByIdAndUpdate(targetId, req.body, { new: true })
    ]);

    updateResult = adminUpdate || hrUpdate || empUpdate;

    if (!updateResult) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(updateResult);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// POST /:id/photo - Upload or update profile photo
router.post("/:id/photo", verifyToken, upload.single("photo"), async (req, res) => {
  const { role, id } = req.user;
  const targetId = req.params.id;

  // Authorization check - employees can only update their own photo
  if (role === 'Employee' && id !== targetId) {
    return res.status(403).json({ message: "Access denied: You can only update your own profile photo" });
  }

  // HR cannot update Admin
  if (role === 'Human Resources') {
     const isAdmin = await Admin.findById(targetId);
     if (isAdmin) {
         return res.status(403).json({ message: "Access denied: HR cannot modify Admin records" });
     }
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No photo file provided" });
    }

    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    // Find the user to get existing photo ID
    const [existingAdmin, existingHR, existingEmployee] = await Promise.all([
        Admin.findById(targetId),
        HR.findById(targetId),
        Employee.findById(targetId)
    ]);

    const existingUser = existingAdmin || existingHR || existingEmployee;

    if (!existingUser) {
        return res.status(404).json({ message: "Employee not found" });
    }

    // Delete old photo from Cloudinary if it exists
    if (existingUser.profilePhotoPublicId) {
       try {
           await cloudinary.uploader.destroy(existingUser.profilePhotoPublicId);
       } catch (err) {
           console.error("Failed to delete old photo from Cloudinary:", err);
       }
    }

    // Update the database with new photo info
    existingUser.profilePhotoUrl = imageUrl;
    existingUser.profilePhotoPublicId = publicId;
    
    // Save the changes Using the appropriate Model based on what was found
    const CurrentModel = existingAdmin ? Admin : (existingHR ? HR : Employee);
    
    // Fallback in case finding doesn't give us save() immediately due to projection, we just update
    const updateResult = await CurrentModel.findByIdAndUpdate(
        targetId, 
        { profilePhotoUrl: imageUrl, profilePhotoPublicId: publicId }, 
        { new: true }
    );

    res.json({ 
        message: "Profile photo updated successfully", 
        user: updateResult 
    });

  } catch (error) {
    console.error("PHOTO UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
