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






module.exports = { basic_info, search};
