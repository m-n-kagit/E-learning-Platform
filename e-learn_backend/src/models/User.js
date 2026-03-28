import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      // match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "student", "admin","course_admin"],
      default: "student",
    },
    adminPhoneNumber: {
      type: String,
      trim: true,
    },
    adminDocumentUrl: {
      type: String,
      trim: true,
    },
    adminDocumentPublicId: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// PRE-SAVE HOOK
// Hash password BEFORE saving to DB.
// This runs on .save() — not on .findByIdAndUpdate()

userSchema.pre("save", async function () {  //this refers to the
//  user document being saved , pre here 
// indicates that this function should run before the document
//  is saved to the database.

  // Only hash if password field was actually modified
  if (!this.isModified("password") || this.$locals?.passwordAlreadyHashed) return;

  const salt = await bcrypt.genSalt(12); // Cost factor: higher = slower = safer
  this.password = await bcrypt.hash(this.password, salt);
});

// INSTANCE METHOD 
// Compare entered password with stored hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// module.exports = mongoose.model("User", userSchema);
const User_Model = mongoose.model("User", userSchema);
export default User_Model;
