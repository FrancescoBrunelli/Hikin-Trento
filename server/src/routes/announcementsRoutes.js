const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcementsController');

/**
 * @swagger
 * /api/managedStructure/{structure_id}/announcements:
 *   get:
 *     summary: Get all announcements for a specific structure
 *     description: >
 *       Returns a list of announcements associated with a managed structure.
 *       Announcements are sorted by creation date in ascending order.
 *       This endpoint is public and used in the structure detail page.
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: structure_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the managed structure
 *     responses:
 *       200:
 *         description: List of announcements for the structure
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
 *                   example: 2
 *                 message:
 *                   type: string
 *                   example: Announcements retrieved successfully
 *                 announcements:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64f1c2a9b1a2c3d4e5f6a7b8
 *                       title:
 *                         type: string
 *                         example: Temporary Closure
 *                       description:
 *                         type: string
 *                         example: The structure will be closed for maintenance next week.
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-06-01T10:00:00.000Z"
 *       404:
 *         description: No announcements found for the structure
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
 *                   example: Structure not found
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
router.get('/:structure_id/announcements', announcementsController.getAnnouncements);

module.exports = router;
