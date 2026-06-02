const Event = require('../models/Event');

const getEvents = async(structure_id) => {
    return await Event.find({ structure_id })
        .sort({ start_date: 1 })
        .lean()
}

const createEvent = async (structure_id, data) => {
    const event = new Event({structure_id, ...data})
    return await event.save()
}

const updateEvent = async (id, ...data) => {
    return await Event.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

const deleteEvent = async (id) => {
    return await Event.findByIdAndDelete(id)
}

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };
