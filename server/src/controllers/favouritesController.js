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
 * @returns {string} returns.status - "added" if the structure was added, "was_there" if already in favourites
 * @returns {Array} returns.fav_structures - The updated list of favourite structures
 * @throws {Error} If the structure is not found or saving fails
 */
const fav_structure = async (req, res) => {
  try {
    const structure = await Structure.findById(req.body._id);
    console.log(structure._id);
    let status = "was_there";
    if (!req.user.fav_structures.some((s) => s._id.equals(structure._id))) {
      req.user.fav_structures.push(structure);
      await req.user.save();
      status = "added";
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

module.exports = { fav_structure };
