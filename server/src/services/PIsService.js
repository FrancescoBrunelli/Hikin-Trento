const PI = require('../models/PI');

/**
 * Retrieves points of interest filtered by various parameters including location and shelter type.
 *
 * @param {Object} filters - The filter parameters
 * @param {string} [filters.osm_id] - The OpenStreetMap ID of the point of interest
 * @param {string} [filters.name] - Partial/full name (case-insensitive)
 * @param {string} [filters.shelter_type] - Partial/full shelter type (case-insensitive)
 * @param {number} [filters.lat] - Latitude of the center point for radius search
 * @param {number} [filters.lng] - Longitude of the center point for radius search
 * @param {number} [filters.radius] - Search radius in kilometers (defaults to 10 if lat/lng provided)
 * @returns {Promise<PI[]>} A list of points of interest matching the filters
 */

const getPIs = async(filters) => {
    const {
        osm_id,
        name,
        lat,
        lng,
        shelter_type,
        radius,
    } = filters;
    let query = {}

    if (name) query.name = { $regex: name, $options: 'i' };
    if (osm_id) query.osm_id = osm_id;
    if (shelter_type) query.shelter_type = { $regex: shelter_type, $options: 'i' };

    let results = await PI.find(query).lean()

    if (lat && lng) {
        const radiusKm = Number(radius) || 10;
        const deg = radiusKm / 111.195;
        results = results.filter(pi => {
            const dist = (pi.coordinates.longitude - Number(lng)) ** 2 +
                (pi.coordinates.latitude - Number(lat)) ** 2;
            return dist < deg ** 2;
        });
    }

    return results
}

module.exports = { getPIs };
