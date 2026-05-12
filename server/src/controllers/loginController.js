const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

console.log('bcrypt loaded:', bcrypt);

const login = async(req, res) => {
    try {
        const {username, password} = req.body;
        //1. Check if the user exists
        const user = await User.findOne({username});
        if (!user) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        //2. Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password" });
        }
        //3. Generate a JWT token
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({
            message: "Login successful",
            token,
            user:{
                id: user._id,
                name: user.name,
                surname: user.surname,
                username: user.username,
                date_of_birth: user.date_of_birth
            }
        });


    } catch(err){
        res.status(500).json({error: "Login failed: " + err.message});
    }

}
module.exports = { login };