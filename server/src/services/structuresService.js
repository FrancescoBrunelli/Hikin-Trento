const Structure = require("../models/Structure");

/**
 * Retrieves structures filtered by location radius and management status.
 * Uses Euclidean distance approximation to filter structures within a given radius.
 *
 * @param {Object} params - The filter parameters
 * @param {Object} params.coordinates - The center point for the radius search
 * @param {number} params.coordinates.latitude - The latitude of the center point
 * @param {number} params.coordinates.longitude - The longitude of the center point
 * @param {number} params.radius - The search radius in meters (0 means no radius filter)
 * @param {boolean} params.show_managed - Whether to include managed structures
 * @param {boolean} params.show_unmanaged - Whether to include unmanaged structures
 * @returns {Promise<Structure[]>} A list of structures matching the filters
 */
const basic_info = async ({
  coordinates,
  radius,
  show_managed,
  show_unmanaged,
}) => {
  console.log("finding");
  const found = await Structure.find({});

  const result = found.filter(function (f) {
    let in_range = true;
    if (radius != 0) {
      const deg = radius / 111195;
      const dist =
        (f.coordinates.longitude - coordinates.longitude) ** 2 +
        (f.coordinates.latitude - coordinates.latitude) ** 2;
      in_range = dist < deg ** 2;
    }

    if (in_range) {
      if (show_managed && show_unmanaged) {
        return true;
      }

      if (show_managed == false && show_unmanaged == true) {
        return f.managed == false;
      }

      if (show_managed == true && show_unmanaged == false) {
        return f.managed == true;
      }
    }
    return false;
  });

  return result;
};

module.exports = { basic_info: basic_info };
