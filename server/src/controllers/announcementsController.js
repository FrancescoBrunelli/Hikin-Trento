const announcementsService = require('../services/announcementsService');
const Announcement = require('../models/Announcement');

const getAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementsService.getAnnouncements(req.params.structure_id);
        res.status(200).json({
            success: true,
            count: announcements.length,
            message: 'Announcements retrieved successfully',
            announcements: announcements
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        })
    }
}

const createAnnouncement = async (req, res) => {
    try {
        const announcement = await announcementsService.createAnnouncement(req.managedStructure._id, req.body);
        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            announcement: announcement
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
};

const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }
        if (announcement.structure_id.toString() != req.managedStructure._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }
        const updated = await announcementsService.updateAnnouncement(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Announcement updated successfully',
            announcement: updated
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({
                success: false,
                error: 'Announcement not found'
            });
        }
        if (announcement.structure_id.toString() != req.managedStructure._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }
        await announcementsService.deleteAnnouncement(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Announcement deleted successfully'
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
