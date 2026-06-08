const Report = require("../models/Report");

/**
 * Calculates the distance between two points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dPhi = ((lat2 - lat1) * Math.PI) / 180;
  const dLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(dLambda / 2) *
      Math.sin(dLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const create_report = async (req, res) => {
  try {
    const { title, description, coordinates } = req.body;
    const report = new Report({
      userId: req.user._id,
      title,
      description,
      coordinates,
      location: {
        type: "Point",
        coordinates: [coordinates.longitude, coordinates.latitude],
      },
    });
    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const get_reports = async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query; // radius in meters
    const query = {};
    if (latitude && longitude && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseFloat(radius),
        },
      };
    }
    const reports = await Report.find(query);
    res.status(200).json(reports);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const get_report_by_id = async (req, res) => {
  try {
    const report = await Report.findById(req.params.report_id);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.status(200).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const get_my_reports = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.user._id });
    res.status(200).json(reports);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update_report = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.report_id,
      userId: req.user._id,
    });
    if (!report)
      return res.status(404).json({ error: "Report not found or not authorized" });

    if (req.body.title) report.title = req.body.title;
    if (req.body.description) report.description = req.body.description;
    if (req.body.coordinates) {
      report.coordinates = req.body.coordinates;
      report.location = {
        type: "Point",
        coordinates: [
          req.body.coordinates.longitude,
          req.body.coordinates.latitude,
        ],
      };
    }

    await report.save();
    res.status(200).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const delete_report = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.report_id,
      userId: req.user._id,
    });
    if (!report)
      return res.status(404).json({ error: "Report not found or not authorized" });
    res.status(200).json({ message: "Report deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const update_report_status = async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.report_id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    // Check distance: authenticated structure must be within 10km from the report
    const structCoords = req.managedStructure.structure.coordinates;
    const reportCoords = report.coordinates;

    const distance = calculateDistance(
      structCoords.latitude,
      structCoords.longitude,
      reportCoords.latitude,
      reportCoords.longitude,
    );

    if (distance > 10000) {
      // 10km in meters
      return res
        .status(403)
        .json({ error: "Structure is too far from the report (max 10km)" });
    }

    report.status = status;
    await report.save();
    res.status(200).json(report);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  create_report,
  get_reports,
  get_report_by_id,
  get_my_reports,
  update_report,
  delete_report,
  update_report_status,
};
