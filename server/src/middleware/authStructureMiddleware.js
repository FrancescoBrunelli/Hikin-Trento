const jwt = require("jsonwebtoken");
const ManagedStructure = require("../models/ManagedStructure");


/**
 * Middleware that authenticates a managed structure using a JWT token.
 * Verifies the token, finds the managed structure in the database,
 * and attaches it to req.managedStructure for use in subsequent route handlers.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.headers.authorization - The Authorization header containing the Bearer token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Calls next() if authenticated, 401 if token is missing, invalid, or structure not found
 * @throws {Error} If the token is invalid or the structure is not managed
 */
const authStructureMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded: ", decoded);
    const managedStructure = await ManagedStructure.findById(decoded.managerId);
    if (managedStructure == null) {
      throw new Error("This structure is not managed");
    }
    req.managedStructure = managedStructure;
    next();
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = authStructureMiddleware;
