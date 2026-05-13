const Trail = require("../models/Trail")

/**
 * Retrieves trails filtered by various parameters including location, difficulty, and duration.
 *
 * @param {Object} filters - The filter parameters
 * @param {string} [filters.osm_id] - The OpenStreetMap ID of the trail
 * @param {string} [filters.name] - Partial/full trail name (case-insensitive)
 * @param {string} [filters.difficulty] - The difficulty level of the trail
 * @param {number} [filters.distance_km] - Minimum trail distance in kilometers
 * @param {number} [filters.ascent_m] - Minimum elevation gain in meters
 * @param {number} [filters.descent_m] - Minimum elevation loss in meters
 * @param {number} [filters.duration_h] - Minimum duration in hours (applies to both directions)
 * @param {string} [filters.from] - Partial/full starting location name (case-insensitive)
 * @param {string} [filters.to] - Partial/full ending location name (case-insensitive)
 * @param {string} [filters.operator] - Partial/full operator name (case-insensitive)
 * @param {boolean} [filters.roundtrip] - Whether the trail is a roundtrip
 * @param {number} [filters.lat] - Latitude of the center point for radius search
 * @param {number} [filters.lng] - Longitude of the center point for radius search
 * @param {number} [filters.radius] - Search radius in kilometers (defaults to 10 if lat/lng provided)
 * @returns {Promise<Trail[]>} A list of trails matching the filters
 */

const getTrails = async(filters) => {
    const {
        osm_id,
        name,
        difficulty,
        distance_km,
        ascent_m,
        descent_m,
        duration_h,
        from,
        to,
        operator,
        roundtrip,
        lat,
        lng,
        radius,
    } = filters;

    let query = {};

    if (lat && lng && radius) {
        const radiusKm = Number(radius) || 10;    // Default radius is 10 km
        // Convert radius from km to radians
        const radiusInRadians = radiusKm / 6371;
        query.geometry = {
            $geoWithin: {
                $centerSphere: [[Number(lng), Number(lat)], radiusInRadians]
            }
        }
    }

    if (from) query.from = { $regex: from, $options: 'i' };
    if (to) query.to = { $regex: to, $options: 'i' };
    if (operator) query.operator = { $regex: operator, $options: 'i' };
    if (roundtrip !== undefined) {
        query.roundtrip = roundtrip === 'true' || roundtrip === true;
    }
    if (distance_km) query.distance_km = {$gte: Number(distance_km)};
    if (duration_h) {
        // Format the user's number (e.g., 2) into a comparable string (e.g., "02:00")
        const searchString = duration_h.toString().padStart(2, '0') + ":00";
        // OR condition: check if either the forward or the backward time >= searchString
        const durationQuery = [
            { duration_forward: { $gte: searchString } },
            { duration_backward: { $gte: searchString } }
        ];
        if (!query.$and) query.$and = [];
        query.$and.push({ $or: durationQuery });
    }
    if (name) query.name = { $regex: name, $options: 'i' };
    if (osm_id) query.osm_id = osm_id;
    if (ascent_m) query.ascent_m = {$gte: Number(ascent_m)};
    if (descent_m) query.descent_m = {$gte: Number(descent_m)};
    if (difficulty) query.difficulty = difficulty;

    return await Trail.find(query).lean()
}

module.exports = { getTrails };
