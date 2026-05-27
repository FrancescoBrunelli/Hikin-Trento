/////////////////////////////////////////// CREATE PLANNING ///////////////////////////////
const axios = require('axios');

const calculateRoute = async (req, res) => {
    console.log('calculateRoute called');
    console.log('req.body:', req.body);
    try {
        const { start, end, waypoints = [] } = req.body;
            console.log('start:', start);
            console.log('end:', end);
            console.log('waypoints:', waypoints);
        // 1. Validate input
        if (!start || !end) {
            return res.status(400).json({ 
                error: "Start and end coordinates are required" 
            });
        }

        // 2. Build coordinates array
        // ORS format: [[lng, lat], [lng, lat], ...]
        const coordinates = [
            start,
            ...waypoints,
            end
        ];

        // 3. Call ORS API
        const response = await axios.post(
            'https://api.openrouteservice.org/v2/directions/foot-hiking',
            {
                coordinates,
                elevation: true,        // include elevation data
                instructions: true,     // include turn by turn instructions
                language: 'it'         // italian instructions
            },
            {
                headers: {
                    'Authorization': process.env.ORS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        // 4. Extract useful data from ORS response
        const route = response.data.routes[0];
        const summary = route.summary;
        const geometry = route.geometry;
        const segments = route.segments;

        res.status(200).json({
            message: "Route calculated successfully",
            route: {
                distance: summary.distance,      // meters
                duration: summary.duration,      // seconds
                ascent: summary.ascent,          // meters elevation gain
                descent: summary.descent,        // meters elevation loss
                geometry,                        // encoded polyline for map
                segments                         // turn by turn instructions
            }
        });

    } catch (err) {
    console.error('Error message:', err.message);
    console.error('Error response status:', err.response?.status);
    console.error('Error response data:', JSON.stringify(err.response?.data));
    
    if (err.response) {
        return res.status(err.response.status).json({
            error: "ORS API error: " + JSON.stringify(err.response.data)
        });
    }
    res.status(500).json({ error: "Route calculation failed: " + err.message });
}

};


const crypto = require('crypto');
const Plan = require('../models/Plan');

// Save a plan
const savePlan = async (req, res) => {
    try {
        const { name, description, start, end, waypoints, route, multiDay, days } = req.body;

        if (!name || !start || !end || !route) {
            return res.status(400).json({ error: "Name, start, end and route are required" });
        }

        const plan = new Plan({
            user: req.user._id,
            name,
            description,
            start,
            end,
            waypoints: waypoints || [],
            route,
            multiDay: multiDay || false,
            days: days || 1
        });

        await plan.save();

        res.status(201).json({
            message: "Plan saved successfully",
            plan: {
                id: plan._id,
                name: plan.name,
                description: plan.description,
                distance: plan.route.distance,
                duration: plan.route.duration,
                multiDay: plan.multiDay,
                days: plan.days,
                createdAt: plan.createdAt
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to save plan: " + err.message });
    }
};

// Get all plans for the logged in user
const getUserPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ user: req.user._id })
            .select('name description route.distance route.duration multiDay days isPublic shareToken createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Plans retrieved successfully",
            plans
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to get plans: " + err.message });
    }
};

// Get a specific plan
const getPlan = async (req, res) => {
    try {
        const plan = await Plan.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        res.status(200).json({ plan });

    } catch (err) {
        res.status(500).json({ error: "Failed to get plan: " + err.message });
    }
};

// Delete a plan
const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        res.status(200).json({ message: "Plan deleted successfully" });

    } catch (err) {
        res.status(500).json({ error: "Failed to delete plan: " + err.message });
    }
};

// Generate share token
/*const sharePlan = async (req, res) => {
    try {
        const plan = await Plan.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        // Generate unique share token
        const shareToken = crypto.randomBytes(16).toString('hex');
        plan.shareToken = shareToken;
        plan.isPublic = true;
        await plan.save();

        res.status(200).json({
            message: "Share link generated",
            shareToken,
            shareUrl: `/plan/shared/${shareToken}`
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to generate share link: " + err.message });
    }
//};

// Get shared plan by token (no auth needed)
//const getSharedPlan = async (req, res) => {
    try {
        const plan = await Plan.findOne({
            shareToken: req.params.token,
            isPublic: true
        }).select('-user'); // don't expose user info

        if (!plan) {
            return res.status(404).json({ error: "Plan not found or no longer shared" });
        }

        res.status(200).json({ plan });

    } catch (err) {
        res.status(500).json({ error: "Failed to get shared plan: " + err.message });
    }
//};*/

module.exports = { 
    calculateRoute,
    savePlan,
    getUserPlans,
    getPlan,
    deletePlan,
    // sharePlan,      // TODO: implement sharing later
    // getSharedPlan   // TODO: implement sharing later
};