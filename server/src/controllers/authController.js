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
                dateOfBirth: user.dateOfBirth
            }
        });
    }catch(err){
        res.status(400).json({error: err.message})
    }
};

module.exports = { register };