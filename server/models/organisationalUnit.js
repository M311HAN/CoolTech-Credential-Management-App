// Import Mongoose for MongoDB object modeling
const mongoose = require("mongoose");

/**
 * Schema for Credential Repositories within a Division.
 * Defines the structure and validation for each credential repository.
 */
let credentialRepoSchema = new mongoose.Schema({
  repoName: {
    type: String,
    required: [true, "Repo name is required"],
    minlength: [3, "Repo name must be at least 3 characters long"],
  },
  repoEmail: {
    type: String,
    required: [true, "Repo email is required"],
    match: [/.+\@.+\..+/, "Please provide a valid email address"],
  },
  repoUsername: {
    type: String,
    required: [true, "Repo username is required"],
  },
  repoPassword: {
    type: String,
    required: [true, "Repo password is required"],
  },
});

/**
 * Schema for Divisions within an Organisational Unit.
 * Each division can have multiple users and credential repositories.
 */
let divisionSchema = new mongoose.Schema({
  divisionName: {
    type: String,
    required: [true, "Division name is required"],
    minlength: [2, "Division name must be at least 3 characters long"],
  },
  divisionUsers: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.every(
          (user) => typeof user === "string" && user.trim() !== ""
        );
      },
      message: "All division users must be non-empty strings",
    },
    default: [],
  },
  // Embed credential repositories within the division
  credentialRepos: [credentialRepoSchema],
});

/**
 * Schema for Organisational Units.
 * Represents the top-level organizational structure containing users and divisions.
 */
let organisationalUnitSchema = new mongoose.Schema({
  ouName: {
    type: String,
    required: [true, "Organisational Unit name is required"],
    unique: true,
    minlength: [3, "OU name must be at least 3 characters long"],
  },
  ouUsers: {
    type: [String],
    validate: {
      validator: function (arr) {
        // Ensure all OU users are non-empty strings
        return arr.every(
          (user) => typeof user === "string" && user.trim() !== ""
        );
      },
      message: "All OU users must be non-empty strings",
    },
    default: [],
  },
  // Embed divisions within the organisational unit
  divisions: [divisionSchema],
});

/**
 * Pre-save middleware to trim whitespace from the OU name before saving.
 * Ensures consistency in the OU naming by removing leading and trailing spaces.
 */
organisationalUnitSchema.pre("save", function (next) {
  this.ouName = this.ouName.trim();
  next();
});

// Create the OrganisationalUnit model based on the schema
let OrganisationalUnit = mongoose.model(
  "OrganisationalUnit",
  organisationalUnitSchema,
  "organisationalUnits"
);

// Export the OrganisationalUnit model for use in other parts of the application
module.exports = OrganisationalUnit;
