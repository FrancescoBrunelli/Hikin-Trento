const jwt = require("jsonwebtoken");
const ManagedStructure = require("../models/ManagedStructure");

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
