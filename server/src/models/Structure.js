const mongoose = require ('mongoose');
const bcrypt = require ('bcrypt');
const coordinatesSchema = require ('./schemas/coordinatesSchema');

const managedStructureSchema = new mongoose.Schema({
    //name: {type: String, required: true},
    name_owner: {type: String, required: true},
    surname_owner: {type: String, required: true},
    //coordinates: {type: coordinatesSchema, required: true}, 
    telephone: {type: String, required: true, match: [/^\+?[\d\s\-]{7,15}$/, 'Invalid phone number format']},
    password: {type: String, required: true},
    structureSchema: {type: structureSchema, required: true}
}, {timestamps: true});

managedStructureSchema.index(
    { name: 1, 'coordinates.latitude': 1, 'coordinates.longitude': 1, 'coordinates.altitude' : 1 }, 
    { unique: true }
  );

managedStructureSchema.pre('save', async function(){
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
})



const structureSchema = new mongoose.Schema({
    name: {type: String, required: true},
    coordinates: {type: coordinatesSchema, required: true},
    managed: {type: Boolean, required: true}
}, {timestamps: true});





module.exports = mongoose.model('Structure', structureSchema);
module.exports = mongoose.model('ManagedStructure', managedStructureSchema);