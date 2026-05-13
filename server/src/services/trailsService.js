const Trail = require("../models/Trail")

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
        const radius = radius ? Number(radius) : 10;    // Default radius is 10 km
        // Convert radius from km to radians
        const radiusInRadians = Number(radius) / 6371;
        query.geometry = {
            $geoWithin: {
                $centerSphere: [[Number(lng), Number(lat)], radiusInRadians]
            }
        }
    }

    if (from) query.from = { $regex: from, $options: 'i' };
    if (to) query.to = { $regex: to, $options: 'i' };
    if (operator) query.operator = { $regex: operator, $options: 'i' };
    if (roundtrip) query.roundtrip = roundtrip;
    if (distance_km) query.distance_km = {$gte: distance_km};
    if (duration_h) {
        // Format the user's number (e.g., 2) into a comparable string (e.g., "02:00")
        const searchString = duration_h.toString().padStart(2, '0') + ":00";
        // OR condition: check if either the forward or the backward time >= searchString
        const durationQuery = [
            { duration_forward: { $gte: searchString } },
            { duration_backward: { $gte: searchString } }
        ];
        if (query.$and) {
            query.$and.push({ $or: durationQuery });
        } else {
            query.$or = durationQuery;
        }
    }
    if (name) query.name = { $regex: name, $options: 'i' };
    if (osm_id) query.osm_id = osm_id;
    if (ascent_m) query.ascent_m = {$gte: ascent_m};
    if (descent_m) query.descent_m = {$gte: descent_m};
    if (difficulty) query.difficulty = difficulty;

    return await Trail.find(query).lean()
}

module.exports = { getTrails };
