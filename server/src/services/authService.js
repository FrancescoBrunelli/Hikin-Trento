const User = require("../models/User");
const Structure = require("../models/Structure");
const ManagedStructure = require("../models/ManagedStructure");

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
const register = async ({
  name,
  surname,
  username,
  date_of_birth,
  password,
}) => {
  const existing = await User.exists({ username });
  if (existing) throw new Error("username already taken");

  const user = new User({ name, surname, username, date_of_birth, password });
  await user.save();
  return user;
};

/**
 * Registers a new structure in the database.
 * Checks for duplicates based on name and coordinates before saving.
 *
 * @param {Object} structureData - The structure's registration data
 * @param {string} structureData.name - The name of the place
 * @param {string} structureData.name_owner - The first name of the owner
 * @param {string} structureData.surname_owner - The last name of the owner
 * @param {Object} structureData.coordinates - The GPS coordinates of the structure
 * @param {number} structureData.coordinates.latitude - The latitude of the structure
 * @param {number} structureData.coordinates.longitude - The longitude of the structure
 * @param {number} structureData.coordinates.altitude - The altitude of the structure
 * @param {string} structureData.telephone - The contact phone number
 * @param {string} structureData.password - The password for the structure's account
 * @returns {Promise<Structure>} The newly created structure document
 * @throws {Error} If a structure with the same name and coordinates already exists
 */
const register_structure = async ({
  name,
  name_owner,
  surname_owner,
  telephone,
  password,
  Structure_id,
}) => {
  const structure = Structure.findById(Structure_id);
  structure.managed = true;
  await structure.save();
  const managed_structure = new ManagedStructure({
    name,
    name_owner,
    surname_owner,
    telephone,
    password,
    structure,
  });
  await managed_structure.save();
  return managed_structure;
};

module.exports = { register, register_structure };
