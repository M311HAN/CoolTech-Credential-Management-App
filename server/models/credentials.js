// Import Mongoose for MongoDB object modeling
const mongoose = require("mongoose");

/**
 * Schema for Credential Repositories.
 * Defines the structure and validation for each credential repository.
 */
let credentialRepoSchema = new mongoose.Schema({
  repoName: {
    type: String,
    required: [true, "Repository name is required"],
    minlength: [3, "Repository name must be at least 3 characters long"],
  },
  repoEmail: {
    type: String,
    required: [true, "Repository email is required"],
    match: [/.+\@.+\..+/, "Please provide a valid email address"],
  },
  repoUsername: {
    type: String,
    required: [true, "Repository username is required"],
    minlength: [3, "Repository username must be at least 3 characters long"],
  },
  repoPassword: {
    type: String,
    required: [true, "Repository password is required"],
    minlength: [6, "Repository password must be at least 6 characters long"],
  },
});

/**
 * Pre-save middleware for Credential Repositories.
 * Currently, it does not perform any operations but can be extended in the future.
 */
credentialRepoSchema.pre("save", async function (next) {
  // Placeholder for any pre-save operations (e.g., hashing passwords)
  next();
});

// Create the NewCredentialRepo model based on the schema
let NewCredentialRepo = mongoose.model(
  "NewCredentialRepo",
  credentialRepoSchema
);

// Export the NewCredentialRepo model for use in other parts of the application
module.exports = NewCredentialRepo;
