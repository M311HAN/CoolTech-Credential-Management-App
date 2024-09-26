// Import the jsonwebtoken library for handling JWT operations
const jwt = require("jsonwebtoken");

// Retrieve the JWT secret key from environment variables for verifying tokens
const jwtSecretKey = process.env.JWT_SECRET_KEY;

/**
 * Middleware function to verify JWT tokens in incoming requests.
 * Ensures that the request contains a valid token before allowing access to protected routes.
 *
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 */
const verifyToken = (req, res, next) => {
  // Extract the token from the 'Authorization' header in the format 'Bearer <token>'
  const token = req.headers["authorization"]?.split(" ")[1];

  // If no token is provided, respond with a 403 Forbidden status
  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, jwtSecretKey);

    // Attach the decoded user information to the request object for use in subsequent middleware/routes
    req.user = decoded;
    next();
  } catch (err) {
    // If token verification fails, respond with a 401 Unauthorized status
    return res.status(401).send({ message: "Unauthorized!" });
  }
};

module.exports = verifyToken;
