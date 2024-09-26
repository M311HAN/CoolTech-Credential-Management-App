const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwtSecretKey = process.env.JWT_SECRET_KEY;

// Controller for logging in a user
exports.loginUser = async function (req, res) {
  const { username, password } = req.body;
  const user = await UserModel.findOne({ username });

  // If user not found or password is incorrect, return an error
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).send({ message: "Invalid credentials." });
  }

  // Generate JWT token for the user
  const payload = { username: user.username, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    algorithm: "HS256",
  });

  // Send success response with JWT token
  return res.send({ message: "Login successful!", token: `Bearer ${token}` });
};

// Controller for registering a new user
exports.registerNewUser = async function (req, res) {
  const { username, password } = req.body;

  try {
    // Check if the username already exists in the database
    const userIsFound = await UserModel.findOne({ username });
    if (userIsFound) {
      return res.status(400).send({ message: "User already exists." });
    }

    // Create a new user with plain text password (hashing can be added later)
    let newUser = new UserModel({ username, password });

    // Save the user to the database.
    await newUser.save();

    // Generate a JWT token after successful registration
    const payload = { username: newUser.username, role: newUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      algorithm: "HS256",
    });

    // Send success response with JWT token
    return res.send({
      message: "User registered successfully!",
      token: `Bearer ${token}`,
    });
  } catch (error) {
    // Handle validation errors specifically
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).send({ message: messages.join(", ") });
    }

    // Handle other errors
    return res.status(500).send({ message: "Error registering user", error });
  }
};

// Controller for retrieving all users (admin access only)
exports.getUsers = async function (req, res) {
  const decoded = req.user;
  // Only admins can retrieve user data
  if (decoded.role !== "admin") {
    return res.status(403).send({ message: "Access denied." });
  }
  try {
    // Fetch all users and group them by their roles
    const users = await UserModel.find();
    let allUsersData = {
      normalUsers: users.filter((user) => user.role === "normal"),
      managementUsers: users.filter((user) => user.role === "management"),
      adminUsers: users.filter((user) => user.role === "admin"),
    };
    // Send success response with grouped user data
    return res.send({
      message: "Users retrieved successfully!",
      usersData: allUsersData,
    });
  } catch (err) {
    // Handle any errors during retrieval
    return res
      .status(500)
      .send({ message: "Error retrieving users.", error: err });
  }
};

// Controller for changing a user's role (admin access only)
exports.changeUserRole = async function (req, res) {
  const decoded = req.user;
  const { username, role } = req.body;

  // Only admins can change user roles
  if (decoded.role !== "admin") {
    return res.status(403).send({ message: "Access denied." });
  }

  try {
    // Find the user whose role needs to be changed
    const user = await UserModel.findOne({ username: username });
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Update the user's role
    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Send success response with the updated role information
    return res.send({
      message: `${username}'s role has been changed from '${oldRole}' to '${role}'.`,
    });
  } catch (err) {
    // Handle any errors during role update
    return res
      .status(500)
      .send({ message: "Error changing user role.", error: err });
  }
};
