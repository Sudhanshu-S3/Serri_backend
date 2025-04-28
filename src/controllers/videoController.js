const Video = require('../models/videoModel');
require('dotenv').config();

const getVideos = async (req, res) => {
    try {
        const videos = await Video.find({});
        res.status(200).json(videos);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getVideos,
};