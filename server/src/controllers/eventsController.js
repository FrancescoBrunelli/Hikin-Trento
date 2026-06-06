const eventsService = require('../services/eventsService');
const Event = require('../models/Event');

// For users
const getEvents = async (req, res) => {
    try {
        const events = await eventsService.getEvents(req.params.structure_id);
        if (!events || events.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Structure not found'
            });
        }
        res.status(200).json({
            success: true,
            count: events.length,
            message: 'Events retrieved successfully',
            events: events
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

// For logged structure managers
const getEventsForManagedStructure = async (req, res) => {
    try {
        const events = await eventsService.getEvents(
            req.managedStructure._id
        );
        res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

const createEvent = async (req, res) => {
    try {
        const { title, description, start_date, end_date } = req.body;
        if (!title || !description || !start_date || !end_date) {
            return res.status(400).json({
                success: false,
                error: 'All fields are required'
            });
        }
        const event = await eventsService.createEvent(req.managedStructure._id, req.body);
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: event
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

const updateEvent = async (req, res) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No fields to update'
            });
        }
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        if (event.structure_id.toString() !== req.managedStructure._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }
        const updated = await eventsService.updateEvent(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event: updated
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                error: 'Event not found'
            });
        }
        if (event.structure_id.toString() !== req.managedStructure._id.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Forbidden'
            });
        }
        await eventsService.deleteEvent(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

module.exports = { getEvents, getEventsForManagedStructure, createEvent, updateEvent, deleteEvent };
