const mongoose = require("mongoose");
const structureSchema = require("./schemas/structureSchema");
const bcrypt = require("bcrypt");

const managedStructureSchema = new mongoose.Schema(
  {
    name_owner: { type: String, required: true },
    surname_owner: { type: String, required: true },
    telephone: {
      type: String,
      required: true,
      match: [/^\+?[\d\s\-]{7,15}$/, "Invalid phone number format"],
    },
    password: { type: String, required: true },
    structure: { type: structureSchema, required: true },
  },
  { timestamps: true },
);


managedStructureSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("ManagedStructure", managedStructureSchema);
