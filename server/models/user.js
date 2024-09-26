// Import necessary modules and Mongoose for MongoDB object modeling
const mongoose = require("mongoose");
// Bcrypt for hashing passwords
const bcrypt = require("bcryptjs");

// Define the User schema with fields and validation rules
let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    minlength: [4, "Username must be at least 4 characters long"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
  },
  role: {
    type: String,
    required: true,
    enum: ["normal", "management", "admin"],
    default: "normal",
  },
});

// Pre-save hook to hash the password before saving to the database
userSchema.pre("save", async function (next) {
  // Check if the password field has been modified
  if (!this.isModified("password")) return next();
  try {
    // Generate a salt with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    // Proceed to save the user
    next();
  } catch (error) {
    return next(error);
  }
});

// Instance method to compare entered password with the hashed password in the database
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model based on the schema
let User = mongoose.model("User", userSchema);

// Export the User model for use in other parts of the application
module.exports = User;
