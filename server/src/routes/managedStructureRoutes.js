const express = require("express");
const router = express.Router();
const managedStructureController = require("../controllers/managedStructureController");
const authStructureMiddleware = require("../middleware/authStructureMiddleware");
const deleteController = require("../controllers/deleteController");
const eventsController = require ("../controllers/eventsController");
const announcementsController = require ("../controllers/announcementsController");

/**
 * @swagger
 * /api/managedStructure/basicInfo:
 *   get:
 *     summary: Get basic info of the authenticated managed structure
 *     description: >
 *       Returns the basic info of the managed structure identified by the JWT token.
 *       Requires a valid JWT token in the Authorization header issued to a managed structure.
 *     tags: [Managed Structures]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Managed structure info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 managed_structure_id:
 *                   type: string
 *                   example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 name_owner:
 *                   type: string
 *                   example: "Marco"
 *                 surname_owner:
 *                   type: string
 *                   example: "Bianchi"
 *                 telephone:
 *                   type: string
 *                   example: "+39 0461 123456"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       400:
 *         description: Error retrieving structure info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.get(
  "/basicInfo",
  authStructureMiddleware,
  managedStructureController.managed_structure_basic_info,
);

/**
 * @swagger
 * /api/managedStructure/basicInfo:
 *   put:
 *     summary: Update the authenticated managed structure's basic info
 *     description: >
 *       Updates name_owner, surname_owner and telephone of the authenticated managed structure.
 *       Requires a valid JWT token in the Authorization header issued to a managed structure.
 *     tags: [Managed Structures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name_owner
 *               - surname_owner
 *               - telephone
 *             properties:
 *               name_owner:
 *                 type: string
 *                 example: "Marco"
 *               surname_owner:
 *                 type: string
 *                 example: "Bianchi"
 *               telephone:
 *                 type: string
 *                 example: "+39 0461 123456"
 *     responses:
 *       200:
 *         description: Structure info updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 managedstructure:
 *                   type: object
 *                   properties:
 *                     name_owner:
 *                       type: string
 *                       example: "Marco"
 *                     surname_owner:
 *                       type: string
 *                       example: "Bianchi"
 *                     telephone:
 *                       type: string
 *                       example: "+39 0461 123456"
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Access denied. No token provided."
 *       400:
 *         description: Error updating structure info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.put(
  "/basicInfo",
  authStructureMiddleware,
  managedStructureController.structure_update_info,
);

/**
 * @swagger
 * /api/managedStructure/password:
 *   put:
 *     summary: Update the authenticated managed structure's password
 *     description: >
 *       Updates the password of the authenticated managed structure.
 *       Requires the current password for verification before allowing the update.
 *       The new password is hashed automatically by the pre-save hook.
 *     tags: [Managed Structures]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - curr_password
 *               - new_password
 *               - confirm_password
 *             properties:
 *               curr_password:
 *                 type: string
 *                 description: The current password for verification
 *                 example: "rifugio123"
 *               new_password:
 *                 type: string
 *                 description: The new password (min 8 chars, at least one special character)
 *                 example: "rifugio456!"
 *               confirm_password:
 *                 type: string
 *                 description: Must match new_password
 *                 example: "rifugio456!"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *       401:
 *         description: Current password is wrong or passwords do not match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Current password is not correct. Try again"
 *       400:
 *         description: Error updating password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */
router.put(
  "/password",
  authStructureMiddleware,
  managedStructureController.structure_update_password,
);

/**
 * @swagger
 * /api/managedStructure/account:
 *   delete:
 *     summary: Delete authenticated managed structure account
 *     description: Deletes the authenticated managed structure account after password confirmation and marks the related structure as unmanaged.
 *     tags:
 *       - Managed Structures
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 example: myPassword123
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account deleted successfully
 *       401:
 *         description: Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: The password is not correct
 *       400:
 *         description: Generic server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
router.delete("/account", authStructureMiddleware, deleteController.delete_managed_structure);

/**
 * @swagger
 * /api/managedStructure/events:
 *   get:
 *     summary: Get all events of the authenticated managed structure
 *     description: >
 *       Returns all events published by the authenticated managed structure.
 *       Sorted by start date ascending.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events retrieved successfully
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
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                       title:
 *                         type: string
 *                         example: "Summer Hiking Festival"
 *                       description:
 *                         type: string
 *                         example: "Guided hikes and food stands."
 *                       start_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-07-10T08:00:00.000Z"
 *                       end_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-07-12T18:00:00.000Z"
 *       401:
 *         description: Missing or invalid token
 *       500:
 *         description: Server error
 */
router.get('/events', authStructureMiddleware, eventsController.getEventsForManagedStructure);

/**
 * @swagger
 * /api/managedStructure/events:
 *   post:
 *     summary: Create a new event
 *     description: >
 *       Creates a new event associated with the authenticated managed structure.
 *       Requires a valid JWT token issued to a managed structure.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - start_date
 *               - end_date
 *             properties:
 *               title:
 *                 type: string
 *                 example: Summer Hiking Festival
 *               description:
 *                 type: string
 *                 example: Guided hikes and local food stands.
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-10T08:00:00.000Z"
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-07-12T18:00:00.000Z"
 *     responses:
 *       201:
 *         description: Event created successfully
 *       500:
 *         description: Server error
 */
router.post('/events', authStructureMiddleware, eventsController.createEvent);

/**
 * @swagger
 * /api/managedStructure/events/{id}:
 *   put:
 *     summary: Update an existing event
 *     description: >
 *       Updates an event owned by the authenticated managed structure.
 *       The event must belong to the authenticated structure.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Hiking Festival
 *               description:
 *                 type: string
 *                 example: Updated event description
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       403:
 *         description: Event does not belong to authenticated structure
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.put('/events/:id', authStructureMiddleware, eventsController.updateEvent);

/**
 * @swagger
 * /api/managedStructure/events/{id}:
 *   delete:
 *     summary: Delete an event
 *     description: >
 *       Deletes an event owned by the authenticated managed structure.
 *       The event must belong to the authenticated structure.
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       403:
 *         description: Event does not belong to authenticated structure
 *       404:
 *         description: Event not found
 *       500:
 *         description: Server error
 */
router.delete('/events/:id', authStructureMiddleware, eventsController.deleteEvent);

/**
 * @swagger
 * /api/managedStructure/announcements:
 *   post:
 *     summary: Create a new announcement
 *     description: >
 *       Creates a new announcement associated with the authenticated managed structure.
 *       Requires a valid JWT token issued to a managed structure.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *                 example: Temporary Closure
 *               description:
 *                 type: string
 *                 example: The structure will be closed for maintenance next week.
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *       500:
 *         description: Server error
 */
router.post('/announcements', authStructureMiddleware, announcementsController.createAnnouncement);

/**
 * @swagger
 * /api/managedStructure/{structure_id}:
 *   get:
 *     summary: Get public info of a managed structure by structure ID
 *     description: >
 *       Returns the public basic info of a managed structure identified by
 *       its associated structure ID. No authentication required.
 *     tags: [Managed Structures]
 *     parameters:
 *       - in: path
 *         name: structure_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the associated structure
 *     responses:
 *       200:
 *         description: Managed structure info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 name_owner:
 *                   type: string
 *                   example: "Marco"
 *                 surname_owner:
 *                   type: string
 *                   example: "Bianchi"
 *                 telephone:
 *                   type: string
 *                   example: "+39 0461 123456"
 *                 structure:
 *                   type: object
 *       404:
 *         description: Managed structure not found
 *       400:
 *         description: Server error
 */
router.get('/announcements', authStructureMiddleware, announcementsController.getAnnouncementsForManagedStructure);

/**
 * @swagger
 * /api/managedStructure/announcements/{id}:
 *   put:
 *     summary: Update an announcement
 *     description: >
 *       Updates an announcement owned by the authenticated managed structure.
 *       The announcement must belong to the authenticated structure.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Closure Notice
 *               description:
 *                 type: string
 *                 example: Maintenance period has been extended.
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       403:
 *         description: Announcement does not belong to authenticated structure
 *       404:
 *         description: Announcement not found
 *       500:
 *         description: Server error
 */
router.put('/announcements/:id', authStructureMiddleware, announcementsController.updateAnnouncement);

/**
 * @swagger
 * /api/managedStructure/announcements/{id}:
 *   delete:
 *     summary: Delete an announcement
 *     description: >
 *       Deletes an announcement owned by the authenticated managed structure.
 *       The announcement must belong to the authenticated structure.
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 *       403:
 *         description: Announcement does not belong to authenticated structure
 *       404:
 *         description: Announcement not found
 *       500:
 *         description: Server error
 */
router.delete('/announcements/:id', authStructureMiddleware, announcementsController.deleteAnnouncement);

/**
 * @swagger
 * /api/managedStructure/{structure_id}:
 *   get:
 *     summary: Get basic info of a managed structure by structure ID
 *     description: >
 *       Returns the basic info of a managed structure identified by its
 *       associated structure ID. This is a public endpoint and does not
 *       require authentication.
 *     tags: [Managed Structures]
 *     parameters:
 *       - in: path
 *         name: structure_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB ObjectId of the structure
 *         example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *     responses:
 *       200:
 *         description: Managed structure info retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The MongoDB ObjectId of the managed structure
 *                   example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                 name_owner:
 *                   type: string
 *                   example: "Marco"
 *                 surname_owner:
 *                   type: string
 *                   example: "Bianchi"
 *                 telephone:
 *                   type: string
 *                   example: "+39 0461 123456"
 *                 structure:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f1a2b3c4d5e6f7a8b9c0d1"
 *                     name:
 *                       type: string
 *                       example: "Rifugio Dolomiti"
 *                     coordinates:
 *                       type: object
 *                       properties:
 *                         latitude:
 *                           type: number
 *                           example: 46.4102
 *                         longitude:
 *                           type: number
 *                           example: 11.3428
 *                         altitude:
 *                           type: number
 *                           example: 2150
 *                     managed:
 *                       type: boolean
 *                       example: true
 *       404:
  *         description: No managed structure found for the given structure ID
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 error:
  *                   type: string
  *                   example: "Managed structure not found"
 */
router.get("/:structure_id", managedStructureController.managed_structure_basic_info_from_id);

module.exports = router;
