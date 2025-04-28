const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    videoId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        default: '',
        index: true
    },
    publishedAt: {
        type: Date,
        required: true,
        index: true
    },
    thumbnails: {
        default: { url: String, width: Number, height: Number },
        medium: { url: String, width: Number, height: Number },
        high: { url: String, width: Number, height: Number }
    },
    videoUrl: {
        type: String,
        required: true
    },
    channelTitle: String,
    channelId: String
});

// Create text index for search functionality
videoSchema.index({
    title: 'text',
    description: 'text'
}, {
    weights: {
        title: 10,
        description: 5
    }
});

module.exports = mongoose.model('Video', videoSchema);