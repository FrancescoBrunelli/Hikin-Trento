const authService = require('../services/authService');

const register = async(req, res) => {
    try {
        const user = await authService.register(req.body);

        res.status(201).json({
            message: 'User registered successfully', 
            user: {
                id: user._id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                date_of_birth: user.date_of_birth
            }
        });
    }catch(err){
        res.status(400).json({error: err.message})
    }
};


const register_structure = async(req, res) => {
    try{
        const structure = await authService.register_structure(req.body);

        res.status(201).json({
            message: 'Structure registered successfully',
            structure: {
                id: structure._id,
                name: structure.name,
                name_owner: structure.name_owner,
                surname_owner: structure.surname_owner,
                coordinates: {
                    latitude: structure.coordinates.latitude,
                    longitude: structure.coordinates.longitude,
                    altitude: structure.coordinates.altitude 
                },
                telephone: structure.telephone
            }
        });
    }catch(err){
        res.status(400).json({error: err.message})
    }
};

module.exports = { register, register_structure };