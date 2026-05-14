const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ManagedStructure = require('../models/ManagedStructure');

const structureLogin = async (req, res) => {
    try {
        const { telephone, password } = req.body;

        // 1. Check if structure manager exists
        const manager = await ManagedStructure.findOne({ telephone });
        if (!manager) {
            return res.status(401).json({ error: "Invalid telephone or password" });
        }

        // 2. Check if password is correct
        const isMatch = await bcrypt.compare(password, manager.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid telephone or password" });
        }

        // 3. Generate JWT token
        const token = jwt.sign(
            { 
                managerId: manager._id,
                telephone: manager.telephone,
                role: 'structure_manager'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            manager: {
                id: manager._id,
                name_owner: manager.name_owner,
                surname_owner: manager.surname_owner,
                telephone: manager.telephone,
                structure: manager.structure
            }
        });

    } catch (err) {
        res.status(500).json({ error: "Login failed: " + err.message });
    }
};

module.exports = { structureLogin };