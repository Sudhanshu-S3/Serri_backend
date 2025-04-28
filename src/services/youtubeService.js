const axios = require('axios');
const Video = require('../models/videoModel');

require('dotenv').config();

class YoutubeService {
    constructor() {
        this.searchQuery = process.env.SEARCH_QUERY;
        this.apiKey = process.env.YOUTUBE_API_KEY;
        this.baseUrl = 'https://www.googleapis.com/youtube/v3/search';
        this.lastFetchTime = new Date(Date,now() - 24 * 60 * 60 * 1000); // 24 hours ago
    }

    async fetchVideos(query) {
        try {
            console.log('Fetching videos from YouTube...');
            const response = await axios.get(`${this.baseUrl}/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    order: 'date',
                    maxResults: 50,
                    publishedAfter: this.lastFetchTime.toISOString(),
                    key: this.apiKey,
                },
            });
            return response.data.items;
        } catch (error) {
            console.error('Error fetching videos from YouTube API:', error);
            throw new Error('Failed to fetch videos from YouTube API');
        }
    }

    async saveVideos(videos) {
        try {
            const videoPromises = videos.map(async (video) => {
                const videoData = {
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnail: video.snippet.thumbnails.default.url,
                    videoId: video.id.videoId,
                };
                return await Video.create(videoData);
            });
            await Promise.all(videoPromises);
        } catch (error) {
            console.error('Error saving videos to database:', error);
            throw new Error('Failed to save videos to database');
        }
    }
}

module.exports = new YoutubeService();