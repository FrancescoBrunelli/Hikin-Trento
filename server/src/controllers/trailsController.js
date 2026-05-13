const trailsService = require('../services/trailsService');

const getTrails = async (req, res) => {
    try {
        const trails = await trailsService.getTrails(req.query);
        res.status(200).json({
            success: true,
            count: trails.length,
            message: 'Trails retrieved successfully',
            trails: trails
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        });
    }
};

module.exports = { getTrails };
