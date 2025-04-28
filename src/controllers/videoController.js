const Video = require('../models/videoModel');
require('dotenv').config();

const PAGE_SIZE = parseInt(process.env.PAGE_SIZE) || 10;

const getVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * PAGE_SIZE;

        // Default sort field and order
        const sortField = req.query.sortField || 'publishedAt';
        const sortOrder = parseInt(req.query.sortOrder) || -1;
        const sort = { [sortField]: sortOrder };

        const videos = await Video.find()
            .sort(sort)
            .skip(skip)
            .limit(PAGE_SIZE);

        const totalVideos = await Video.countDocuments();
        const totalPages = Math.ceil(totalVideos / PAGE_SIZE);

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages,
            totalVideos,
            videos
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching videos',
            error: error.message
        });
    }
};

module.exports = {
    getVideos,
};