const mongoose = require("mongoose");
const coordinatesSchema = require("./schemas/coordinatesSchema");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "resolved"],
      default: "pending",
    },
    coordinates: {
      type: coordinatesSchema,
      required: true,
    },
    // location field for MongoDB geospatial queries
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { timestamps: true },
);

// Index for proximity queries
reportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Report", reportSchema);
