const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware that authenticates requests using a JWT token.
 *
 * This middleware:
 * 1. Extracts the JWT token from the Authorization header.
 * 2. Verifies the token using the configured JWT secret.
 * 3. Retrieves the authenticated user from the database.
 * 4. Attaches the user object to the request.
 * 5. Passes control to the next middleware or route handler.
 *
 * Expected Authorization header format:
 * Bearer <token>
 *
 * @async
 * @function authMiddleware
 * @param {Object} req - Express request object.
 * @param {Object} req.headers - HTTP request headers.
 * @param {string} req.headers.authorization - JWT bearer token.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Promise<void>} Continues request processing if authentication succeeds.
 *
 * @throws {401} Returns an unauthorized response if:
 * - no token is provided
 * - the token is invalid or expired
 * - the user does not exist
 */
const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user == null) {
      throw new Error("User doesn't exist");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = authMiddleware;
