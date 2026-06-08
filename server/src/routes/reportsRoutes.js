const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reportsController");
const authMiddleware = require("../middleware/authMiddleware");
const authStructureMiddleware = require("../middleware/authStructureMiddleware");

/**
 * @swagger
 * /api/reports:
 *   get:
 *     summary: Get all reports within a radius
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *         description: Radius in meters
 *     responses:
 *       200:
 *         description: List of reports
 */
router.get("/", reportsController.get_reports);

/**
 * @swagger
 * /api/reports/my:
 *   get:
 *     summary: Get reports created by the authenticated user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's reports
 */
router.get("/my", authMiddleware, reportsController.get_my_reports);

/**
 * @swagger
 * /api/reports/{report_id}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report details
 */
router.get("/:report_id", reportsController.get_report_by_id);

/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Create a new report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, coordinates]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   latitude: { type: number }
 *                   longitude: { type: number }
 *                   altitude: { type: number }
 *     responses:
 *       201:
 *         description: Report created
 */
router.post("/", authMiddleware, reportsController.create_report);

/**
 * @swagger
 * /api/reports/{report_id}:
 *   put:
 *     summary: Update a report (only owner)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               coordinates:
 *                 type: object
 *                 properties:
 *                   latitude: { type: number }
 *                   longitude: { type: number }
 *                   altitude: { type: number }
 *     responses:
 *       200:
 *         description: Report updated
 */
router.put("/:report_id", authMiddleware, reportsController.update_report);

/**
 * @swagger
 * /api/reports/{report_id}:
 *   delete:
 *     summary: Delete a report (only owner)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted
 */
router.delete("/:report_id", authMiddleware, reportsController.delete_report);

/**
 * @swagger
 * /api/reports/{report_id}/status:
 *   put:
 *     summary: Update report status (only managed structures within 10km)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: report_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pending, accepted, resolved] }
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Structure too far or unauthorized
 */
router.put(
  "/:report_id/status",
  authStructureMiddleware,
  reportsController.update_report_status,
);

module.exports = router;
