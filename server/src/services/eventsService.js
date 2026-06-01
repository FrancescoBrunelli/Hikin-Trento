const Event = require('../models/Event');

const getEvents = async(structure_id) => {
    return await Event.find({ structure_id })
        .sort({ start_date: 1 })
        .lean()
}

module.exports = { getEvents };
