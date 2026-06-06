const announcementsService = require('../services/announcementsService');
const Announcement = require('../models/Announcement');

// For users
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await announcementsService.getAnnouncements(req.params.structure_id);
        if (!announcements || announcements.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Structure not found'
            });
        }
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

// For logged structure managers
const getAnnouncementsForManagedStructure = async (req, res) => {
    try {
        const announcements = await announcementsService.getAnnouncements(
            req.managedStructure._id
        );
        res.status(200).json({
            success: true,
            count: announcements.length,
            announcements
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

const createAnnouncement = async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }
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
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }
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

module.exports = { getAnnouncements, getAnnouncementsForManagedStructure, createAnnouncement, updateAnnouncement, deleteAnnouncement };
