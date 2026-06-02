const express = require('express');
const router = express.Router();
const announcementsController = require('../controllers/announcementsController');

router.get('/:structure_id/announcements', announcementsController.getAnnouncements);

module.exports = router;
