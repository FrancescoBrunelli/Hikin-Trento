const Announcement = require('../models/Announcement');

const getAnnouncements = async (structure_id) => {
    return await Announcement.find({ structure_id })
        .sort({ createdAt: 1 })
        .lean()
}

const createAnnouncement = async (structure_id, data) => {
    const announcement = new Announcement({structure_id, ...data})
    return await announcement.save()
}

const updateAnnouncement = async (id, data) => {
    return await Announcement.findByIdAndUpdate(id, data, { new: true, runValidators: true })
}

const deleteAnnouncement = async (id) => {
    return await Announcement.findByIdAndDelete(id)
}

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
