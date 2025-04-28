const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

//Routes to get all videos
router.get('/', videoController.getVideos);

module.exports = router;