const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');

/**
 * @swagger
 * /api/managedStructure/{structure_id}/events:
 *   get:
 *     summary: Get all events for a specific structure
 *     description: >
 *       Returns a list of events associated with a managed structure.
 *       Events are sorted by start date in ascending order.
 *       This endpoint is public and used in the structure detail page.
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: structure_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the managed structure
 *     responses:
 *       200:
 *         description: List of events for the structure
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 3
 *                 message:
 *                   type: string
 *                   example: Events retrieved successfully
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f1c2a9b1a2c3d4e5f6a7b8
 *                       title:
 *                         type: string
 *                         example: Summer Hiking Festival
 *                       description:
 *                         type: string
 *                         example: Guided hikes and food stands in the Dolomites
 *                       start_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-07-10T08:00:00.000Z"
 *                       end_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-07-12T18:00:00.000Z"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Server Error: ..."
 */

router.get('/:structure_id/events', eventsController.getEvents);

module.exports = router;
