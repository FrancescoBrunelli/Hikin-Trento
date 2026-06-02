const axios = require('axios');
const crypto = require('crypto');
const Plan = require('../models/Plan');

/////////////////////////////////////////// ROUTE CALCULATION ///////////////////////////////////////////

const calculateRoute = async (req, res) => {
    try {
        const { start, end, waypoints = [] } = req.body;

        if (!start || !end) {
            return res.status(400).json({ 
                error: "Start and end coordinates are required" 
            });
        }

        const coordinates = [start, ...waypoints, end];

        const response = await axios.post(
            'https://api.openrouteservice.org/v2/directions/foot-hiking',
            {
                coordinates,
                elevation: true,
                instructions: true,
                language: 'it'
            },
            {
                headers: {
                    'Authorization': process.env.ORS_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        const route = response.data.routes[0];
        const summary = route.summary;
        const geometry = route.geometry;
        const segments = route.segments;

        res.status(200).json({
            message: "Route calculated successfully",
            route: {
                distance: summary.distance,
                duration: summary.duration,
                ascent: summary.ascent,
                descent: summary.descent,
                geometry,
                segments
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

/////////////////////////////////////////// HELPERS ///////////////////////////////////////////

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

/////////////////////////////////////////// OWN PLANS ///////////////////////////////////////////

// Create and save a new plan
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

// Get all plans created by the logged in user
const getUserPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ user: req.user._id })
            .select('name description route.distance route.duration multiDay days createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Plans retrieved successfully",
            plans
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to get plans: " + err.message });
    }
};

// Get a specific plan (must be owner)
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

// Update a plan (must be owner, can edit name/description/waypoints/multiDay/days)
const updatePlan = async (req, res) => {
    try {
        const { name, description, waypoints, multiDay, days } = req.body;

        const plan = await Plan.findOne({
            _id: req.params.id,
            user: req.user._id  // only the owner can edit
        });

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        // Only update fields that were actually sent
        if (name !== undefined)        plan.name = name;
        if (description !== undefined) plan.description = description;
        if (waypoints !== undefined)   plan.waypoints = waypoints.map(toWaypoint);
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

// Delete a plan (must be owner)
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

/////////////////////////////////////////// FAVORITES ///////////////////////////////////////////

// Save any plan to favorites (own or someone else's)
const saveFavorite = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ error: "Plan not found" });
        }

        // Check if already favorited
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

        // Check if it was actually favorited
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
            .populate('user', 'name')   // show who created the plan
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Favorites retrieved successfully",
            plans
        });

    } catch (err) {
        res.status(500).json({ error: "Failed to get favorites: " + err.message });
    }
};

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
};