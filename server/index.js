// Import necessary dependencies and modules
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Initialize the Express application
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply Helmet middleware for security
app.use(helmet());
// Enable CORS with default settings
app.use(cors());

// Configure Helmet's Cross-Origin Resource Policy to allow cross-origin requests
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Retrieve database connection string and server port from environment variables
const connection = process.env.CONNECTION;
const port = process.env.PORT || 3001;

// Import controller modules for handling different routes
const OrganisationalUnitController = require("./controllers/organisationUnit.controller");
const UserController = require("./controllers/user.controller");

// Import middleware for verifying JWT tokens
const verifyToken = require("./middlewares/verifyToken");

/**
 * Asynchronously connects to the MongoDB database using Mongoose.
 * Logs a success message upon successful connection.
 * Logs an error message and exits the process if the connection fails.
 */
const connectToDatabase = async () => {
  try {
    await mongoose.connect(connection);
    console.log("Successfully connected to the database.");
  } catch (error) {
    console.error("Error connecting to the database. Exiting now...");
    process.exit(1);
  }
};

connectToDatabase();

// Define route for user login
app.post("/login", UserController.loginUser);

// Define route for user login
app.post("/register", UserController.registerNewUser);

// Define protected route to get all users, requires a valid JWT token
app.get("/users", verifyToken, UserController.getUsers);

// Define protected route to change a user's role, requires a valid JWT token
app.put("/change-user-role", verifyToken, UserController.changeUserRole);

// Define protected route to retrieve organisational units, requires a valid JWT token
app.get(
  "/organisational-units",
  verifyToken,
  OrganisationalUnitController.getOUs
);

// Define protected route to add a credential repository to an organisational unit
app.post(
  "/add-credential-repo",
  verifyToken,
  OrganisationalUnitController.addCredentialRepo
);

// Define protected route to update a credential repository within an organisational unit
app.put(
  "/update-credential-repo",
  verifyToken,
  OrganisationalUnitController.updateCredentialRepo
);

// Define protected route to unassign a user from an organisational unit
app.put(
  "/unassign-from-ou",
  verifyToken,
  OrganisationalUnitController.unassignOuUser
);

// Define protected route to unassign a user from a division
app.put(
  "/unassign-from-division",
  verifyToken,
  OrganisationalUnitController.unassignDivisionUser
);

// Define protected route to assign a user to a new organisational unit
app.put(
  "/assign-user",
  verifyToken,
  OrganisationalUnitController.assignToNewOU
);

/**
 * Start the Express server and listen on the specified port.
 * Logs a message indicating the server is running and the URL to access it.
 */
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
