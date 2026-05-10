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
 * Registers a structure as managed by creating a ManagedStructure account
 * and linking it to an existing structure in the database.
 * Updates the structure's managed status to true.
 *
 * @param {Object} params - The registration data
 * @param {string} params.name - The name of the structure
 * @param {string} params.name_owner - The first name of the owner
 * @param {string} params.surname_owner - The last name of the owner
 * @param {string} params.telephone - The contact phone number of the owner
 * @param {string} params.password - The password for the managed structure account (will be hashed automatically)
 * @param {string} params.Structure_id - The MongoDB ObjectId of the existing structure to link
 * @returns {Promise<ManagedStructure>} The newly created managed structure document
 * @throws {Error} If no structure is found with the given Structure_id
 * @throws {Error} If the structure is already managed
 */
const register_structure = async ({
  name,
  name_owner,
  surname_owner,
  telephone,
  password,
  Structure_id,
}) => {
  const structure = await Structure.findById(Structure_id);
  if (!structure) throw new Error('Structure not found');           
  if (structure.managed) throw new Error('Structure already managed');
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
