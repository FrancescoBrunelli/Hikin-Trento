const PIsService = require('../services/PIsService');

const getPIs = async (req, res) => {
    try {
        const PIs = await PIsService.getPIs(req.query);
        res.status(200).json({
            success: true,
            count: PIs.length,
            message: 'PIs retrieved successfully',
            PIs: PIs
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server Error: ' + err.message
        })
    }
};

module.exports = { getPIs };
