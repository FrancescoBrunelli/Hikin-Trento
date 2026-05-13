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
        const managed_structure = await authService.register_structure(req.body);

        res.status(201).json({
            message: 'Structure registered successfully',
            structure: {
                id: managed_structure._id,
                name: managed_structure.structure.name,
                name_owner: managed_structure.name_owner,
                surname_owner: managed_structure.surname_owner,
                coordinates: {
                    latitude: managed_structure.structure.coordinates.latitude,
                    longitude: managed_structure.structure.coordinates.longitude,
                    altitude: managed_structure.structure.coordinates.altitude 
                },
                telephone: managed_structure.telephone
            }
        });
    }catch(err){
        res.status(400).json({error: err.message})
    }
};

module.exports = { register, register_structure };