const structuresService = require("../services/structuresService");
const bcrypt = require("bcrypt");


const basic_info = async (req, res) => {
  try {
    const { latitude, longitude, radius, show_managed, show_unmanaged } =
      req.query;
    const structures = await structuresService.basic_info({
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      radius: parseFloat(radius),
      show_managed: show_managed === "true",
      show_unmanaged: show_unmanaged === "true",
    });
    res.status(200).json({ structures });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



/**
 * Searches for structures based on a query string and optional filters.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.query - The query parameters
 * @param {string} [req.query.q] - The search query string (defaults to empty string if not provided)
 * @param {string} [req.query.managed] - Filter by managed status ('true' or 'false')
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 200 with matching structures, 400 if an error occurs
 */
const search = async (req, res) => {
  try {
    const { q, managed } = req.query;
    const filters = {}
    if (managed !== undefined) filters.managed = managed === "true"

    const structures = await structuresService.search(q ?? '', filters);
    res.status(200).json({ structures });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}



/**
 * Updates the basic info of the authenticated managed structure.
 * Modifies name_owner, surname_owner and telephone of the managed structure
 * attached to the request by the authStructureMiddleware.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.managedStructure - The authenticated managed structure document (attached by authStructureMiddleware)
 * @param {Object} req.body - The request body
 * @param {string} req.body.name_owner - The new first name of the owner
 * @param {string} req.body.surname_owner - The new last name of the owner
 * @param {string} req.body.telephone - The new telephone number
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 200 with updated info if successful, 400 if an error occurs
 * @throws {Error} If saving to the database fails
 */
const structure_update_info = async (req, res) => {
  try {
    req.managedStructure.name_owner = req.body.name_owner;
    req.managedStructure.surname_owner = req.body.surname_owner;
    req.managedStructure.telephone = req.body.telephone;
    await req.managedStructure.save();
    res.status(200).json({
      status: "success",
      managedstructure: {
        name_owner: req.managedStructure.name_owner,
        surname_owner: req.managedStructure.surname_owner,
        telephone: req.managedStructure.telephone,
      },
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};




/**
 * Updates the password of the authenticated managed structure.
 * Verifies the current password before allowing the update.
 * The new password is hashed automatically by the pre-save hook.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.managedStructure - The authenticated managed structure document (attached by authStructureMiddleware)
 * @param {Object} req.body - The request body
 * @param {string} req.body.curr_password - The current password for verification
 * @param {string} req.body.new_password - The new password to set
 * @param {string} req.body.confirm_password - Confirmation of the new password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} 200 if updated successfully, 401 if current password is wrong or passwords don't match, 400 if an error occurs
 * @throws {Error} If saving to the database fails
 */
const structure_update_password = async (req, res) => {
  try {
    const isMatch = await bcrypt.compare(
      req.body.curr_password,
      req.managedStructure.password,
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Current password is not correct. Try again"
      });
    }
    
    if (req.body.new_password !== req.body.confirm_password) {
      return res.status(401).json({ error: "New password is different from confirm new password" });
    }

    req.managedStructure.password = req.body.new_password;
    await req.managedStructure.save();
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};


module.exports = { basic_info, search, structure_update_info, structure_update_password };
