const bcrypt = require("bcrypt");
const { findById } = require("../models/ManagedStructure");
const Structure = require("../models/Structure");


/**
 * Delete authenticated user account.
 *
 * @async
 * @function delete_user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.password - User password confirmation
 * @param {Object} req.user - Authenticated user injected by auth middleware
 * @param {Object} res - Express response object
 *
 * @returns {Object} 200 - Account deleted successfully
 * @returns {Object} 401 - Incorrect password
 * @returns {Object} 400 - Generic server error
 */
const delete_user = async (req, res) => {
  try {
    const { password } = req.body;
    const isMatch = await bcrypt.compare(password, req.user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: "The password is not correct",
      });
    }
    await req.user.deleteOne();
    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};



/**
 * Delete authenticated managed structure account.
 *
 * @async
 * @function delete_managed_structure
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.password - Managed structure password confirmation
 * @param {Object} req.managedStructure - Authenticated managed structure injected by middleware
 * @param {Object} res - Express response object
 *
 * @returns {Object} 200 - Managed structure account deleted successfully
 * @returns {Object} 401 - Incorrect password
 * @returns {Object} 400 - Generic server error
 */
const delete_managed_structure = async (req, res) => {
  const { password } = req.body;
  try {
    const isMatch = await bcrypt.compare(
      password,
      req.managedStructure.password,
    );
    if (!isMatch) {
      return res.status(401).json({
        error: "The password is not correct",
      });
    }
    const structure = await Structure.findById(req.managedStructure.structure._id);
    await req.managedStructure.deleteOne();
    if (structure) {
          structure.managed = false;
          await structure.save();  // ← await
        }
    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = { delete_user, delete_managed_structure };
