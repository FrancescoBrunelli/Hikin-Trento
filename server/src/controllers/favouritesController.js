const Structure = require("../models/Structure");

/**
 * Adds a structure to the authenticated user's favourites list.
 * If the structure is already in the favourites list, it is not added again.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - The authenticated user document (attached by authMiddleware)
 * @param {Array} req.user.fav_structures - The user's current list of favourite structures
 * @param {Object} req.body - The request body
 * @param {string} req.body._id - The MongoDB ObjectId of the structure to add to favourites
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 200 with status and updated favourites list, 400 if an error occurs
 * @returns {string} returns.status - "added item in the list" if the structure was added, "item was already in the list" if already in favourites
 * @returns {Array} returns.fav_structures - The updated list of favourite structures
 * @throws {Error} If the structure is not found or saving fails
 */
const fav_structure = async (req, res) => {
  try {
    const structure = await Structure.findById(req.body._id);
    let status = "item was already in the list";
    if (!req.user.fav_structures.some((s) => s._id.equals(structure._id))) {
      req.user.fav_structures.push(structure);
      await req.user.save();
      status = "added item in the list";
    }
    res.status(200).json({
      status: status,
      fav_structures: req.user.fav_structures,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};



/**
 * Removes a structure from the authenticated user's favourites list.
 * If the structure is not in the favourites list, no changes are made.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - The authenticated user document (attached by authMiddleware)
 * @param {Array} req.user.fav_structures - The user's current list of favourite structures
 * @param {Object} req.body - The request body
 * @param {string} req.body._id - The MongoDB ObjectId of the structure to remove from favourites
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 200 with status and updated favourites list, 400 if an error occurs
 * @returns {string} returns.status - "Removed item from the list" if removed, "Item not in the list" if not found
 * @returns {Array} returns.fav_structures - The updated list of favourite structures
 * @throws {Error} If saving the user document fails
 */
const delete_fav_structure = async (req, res) => {
  try {
    let status = "Item not in the list";
    const index = req.user.fav_structures.findIndex(
      (s) => s._id.equals(req.body._id)
    );
    if (index != -1) {
      req.user.fav_structures.splice(index, 1);
      await req.user.save();
      status = "Removed item from the list";
    }
    res.status(200).json({
      status: status,
      fav_structures: req.user.fav_structures,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};



/**
 * Retrieves the authenticated user's list of favourite structures.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.user - The authenticated user document (attached by authMiddleware)
 * @param {Array} req.user.fav_structures - The user's list of favourite structures
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 200 with the list of favourite structures, 400 if an error occurs
 * @returns {Array} returns.fav_structures - The list of favourite structures
 */
const get_fav_structures = async (req, res) => {
  try {
    res.status(200).json({
      fav_structures: req.user.fav_structures,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};

module.exports = { fav_structure, delete_fav_structure, get_fav_structures };
