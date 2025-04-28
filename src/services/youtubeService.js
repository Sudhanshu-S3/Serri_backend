const axios = require('axios');
const Video = require('../models/videoModel');
const apiKeyManager = require('../utils/apiKeyManager');
require('dotenv').config();

class YouTubeService {
    constructor() {
        this.baseUrl = 'https://www.googleapis.com/youtube/v3/search';
        this.searchQuery = process.env.SEARCH_QUERY;
        this.lastFetchTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // Start with 24 hours ago
    }

    async fetchLatestVideos() {
        try {
            console.log('Fetching latest videos...');
            const params = {
                part: 'snippet',
                q: this.searchQuery,
                type: 'video',
                order: 'date',
                maxResults: 50,
                publishedAfter: this.lastFetchTime.toISOString(),
                key: apiKeyManager.getCurrentKey()
            };

            const response = await axios.get(this.baseUrl, { params });

            if (response.data.items && response.data.items.length) {
                await this.saveVideos(response.data.items);
                this.lastFetchTime = new Date();
            }

            return { success: true, count: response.data.items?.length || 0 };
        } catch (error) {
            console.error('Error fetching videos:', error.message);

            // Handle API quota exhaustion
            if (error.response && error.response.status === 403 &&
                error.response.data.error.errors[0].reason === 'quotaExceeded') {
                apiKeyManager.markKeyAsExhausted(apiKeyManager.getCurrentKey());
                console.log('API key quota exceeded, switching to next key');
            }

            return { success: false, error: error.message };
        }
    }

    async saveVideos(videos) {
        try {
            // Check if videos are already in the database
            const videosToSave = videos.map(item => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                publishedAt: new Date(item.snippet.publishedAt),
                thumbnails: {
                    default: item.snippet.thumbnails.default,
                    medium: item.snippet.thumbnails.medium,
                    high: item.snippet.thumbnails.high
                },
                videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                channelTitle: item.snippet.channelTitle,
                channelId: item.snippet.channelId
            }));

            // Use bulkWrite with upsert to avoid duplicates
            const operations = videosToSave.map(video => ({
                updateOne: {
                    filter: { videoId: video.videoId },
                    update: { $set: video },
                    upsert: true
                }
            }));

            await Video.bulkWrite(operations);
            console.log(`${videosToSave.length} videos saved/updated`);
        } catch (error) {
            console.error('Error saving videos:', error);
            throw error;
        }
    }
}

module.exports = new YouTubeService();