const Video = require('../models/videoModel');
require('dotenv').config();

const PAGE_SIZE = parseInt(process.env.PAGE_SIZE) || 10;

const getVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * PAGE_SIZE;

        // Add support for sorting
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

const searchVideos = async (req, res) => {
    try {
        const { query } = req.query;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * PAGE_SIZE;

        // Add support for sorting
        const sortField = req.query.sortField || 'score';
        const sortOrder = parseInt(req.query.sortOrder) || -1;
        const sort = sortField === 'score'
            ? { score: { $meta: "textScore" }, publishedAt: -1 }
            : { [sortField]: sortOrder, score: { $meta: "textScore" } };

        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Support for partial matching
        const searchQuery = query.split(' ')
            .filter(word => word.trim().length > 0)
            .map(word => `"${word}"`)
            .join(' ');

        const videos = await Video.find(
            { $text: { $search: searchQuery } },
            { score: { $meta: "textScore" } }
        )
            .sort(sort)
            .skip(skip)
            .limit(PAGE_SIZE);

        const totalVideos = await Video.countDocuments({ $text: { $search: searchQuery } });
        const totalPages = Math.ceil(totalVideos / PAGE_SIZE);

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages,
            totalVideos,
            videos
        });
    } catch (error) {
        console.error('Error searching videos:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching videos',
            error: error.message
        });
    }
};

const getSearchSuggestions = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.json({ suggestions: [] });
        }

        // Find distinct titles that match the query
        const titleResults = await Video.aggregate([
            { $match: { title: { $regex: query, $options: 'i' } } },
            { $group: { _id: "$title" } },
            { $limit: 5 }
        ]);

        const suggestions = titleResults.map(result => result._id);

        res.json({ suggestions });
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching suggestions',
            error: error.message
        });
    }
};

module.exports = {
    getVideos,
    searchVideos,
    getSearchSuggestions
};