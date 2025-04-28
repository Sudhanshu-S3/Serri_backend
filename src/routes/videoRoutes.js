const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');


router.get('/', videoController.getVideos);

router.get('/search', videoController.searchVideos);

router.get('/suggestions', videoController.getSearchSuggestions);

module.exports = router;