const User = require('../models/User');
const user = require('../models/User');


/**
 * Register a new user in the database
 * 
 * @param {Object} UserData - the user registration data
 * @param {String} UserData.name - the name of the user
 * @param {String} UserData.surname - the surname of the user
 * @param {String} UserData.username - the unique username of the user
 * @param {Date} UserData.date_of_birth - the date of birth of the user
 * @param {String} UserData.password - the password chosen by the user 
 * @returns {Promise<User>} the newly created user document
 * @throws {Error} - if the username is already taken
 */
const register = async({name, surname, username, date_of_birth, password}) =>{

    //console.log("registering");
    const existing = await User.exists({username});
    //console.log(existing);
    //if (existing) throw new Error ('username already taken');

    const user = new User ({name, surname, username, date_of_birth, password});
    await user.save();
    return user;
};


module.exports = { register };
