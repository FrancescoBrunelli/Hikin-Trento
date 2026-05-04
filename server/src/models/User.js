const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    nome: {type: String, required: true},
    cognome: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    data_di_nascita: {type: Date, required: true},
    password: {type: String, required: true}
}, {timestamps: true});



//quando viene chiamata save(), se la password è stata cambiata, la funzione serve per: prima hashare password e poi salvare il tutto
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();

})

module.exports = mongoose.model('User', userSchema);


