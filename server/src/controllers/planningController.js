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
            [start[0], start[1]],
            ...waypoints.map(w => [w[0], w[1]]),
            [end[0], end[1]]
        ];
        console.log('ORS coordinates:', JSON.stringify(coordinates));
//        console.log('Final ORS request body:', JSON.stringify({
//            coordinates,
//            elevation: false,
//            instructions: true,
//            language: 'it',
            
//        }, null, 2));
        // 3. Call ORS API
        const response = await axios.post(
            'https://api.openrouteservice.org/v2/directions/foot-hiking',
            {
                coordinates,
                elevation: true,        // include elevation data
                instructions: true,     // include turn by turn instructions
                language: 'it',        // italian instructions
                
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
        console.log('DEBUG savePlan body:', JSON.stringify(req.body, null, 2));
        if (!name || !start || !end || !route) {
            return res.status(400).json({ error: "Name, start, end and route are required" });
        }

        // Converts [lng, lat, alt] array → waypoint object matching the schema
        const toWaypoint = (val) => {
            if (Array.isArray(val)) {
                return {
                    coordinates: {
                        longitude: val[0],
                        latitude:  val[1],
                        altitude:  val[2] ?? 0
                    }
                };
            }
            return val; // already a properly shaped object
        };

        const plan = new Plan({
            user: req.user._id,
            name,
            description,
            start: toWaypoint(start),
            end:   toWaypoint(end),
            waypoints: (waypoints || []).map(toWaypoint),
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
// Update a plan (must be owner)
const updatePlan = async (req, res) => {
    try {
        const { name, description, waypoints, multiDay, days } = req.body;

        const plan = await Plan.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        if (name !== undefined)        plan.name = name;
        if (description !== undefined) plan.description = description;
        if (multiDay !== undefined)    plan.multiDay = multiDay;
        if (days !== undefined)        plan.days = days;

        await plan.save();

        res.status(200).json({
            message: "Plan updated successfully",
            plan: {
                id: plan._id,
                name: plan.name,
                description: plan.description,
                multiDay: plan.multiDay,
                days: plan.days,
                updatedAt: plan.updatedAt
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to update plan: " + err.message });
    }
};

// Save any plan to favorites
const saveFavorite = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        if (plan.savedBy.includes(req.user._id)) {
            return res.status(400).json({ error: "Plan already in favorites" });
        }

        plan.savedBy.push(req.user._id);
        await plan.save();

        res.status(200).json({ message: "Plan added to favorites" });

    } catch (err) {
        res.status(500).json({ error: "Failed to save favorite: " + err.message });
    }
};

// Remove a plan from favorites
const removeFavorite = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        if (!plan.savedBy.includes(req.user._id)) {
            return res.status(400).json({ error: "Plan not in favorites" });
        }

        plan.savedBy = plan.savedBy.filter(
            (userId) => userId.toString() !== req.user._id.toString()
        );
        await plan.save();

        res.status(200).json({ message: "Plan removed from favorites" });

    } catch (err) {
        res.status(500).json({ error: "Failed to remove favorite: " + err.message });
    }
};

// Get all favorited plans for the logged in user
const getFavorites = async (req, res) => {
    try {
        const plans = await Plan.find({ savedBy: req.user._id })
            .select('name description route.distance route.duration multiDay days user createdAt')
            .populate('user', 'name username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Favorites retrieved successfully",
            plans
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to get favorites: " + err.message });
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
    updatePlan,
    deletePlan,
    saveFavorite,
    removeFavorite,
    getFavorites
    // sharePlan,      // TODO: implement sharing later
    // getSharedPlan   // TODO: implement sharing later
};