const eventsService = require('../services/eventsService');

const getEvents = async (req, res) => {
    try {
        const events = await eventsService.getEvents(req.params.structure_id);
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

module.exports = { getEvents };
