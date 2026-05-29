const structureSchema = require("./schemas/structureSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    date_of_birth: { type: Date, required: true },
    password: { type: String, required: true },
    fav_structures: {type: [structureSchema], required: false}
  },
  { timestamps: true },
);

/**
 * When save() is called
 * if the password was changed, it hashes the new passwsord
 * if the password was not changed, it returns to save()
 */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);
