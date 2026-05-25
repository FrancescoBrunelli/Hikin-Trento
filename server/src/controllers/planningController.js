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

module.exports = { calculateRoute };