const express = require('express');
const cron = require('node-cron');
require('dotenv').config();

const connectDB = require('./config/connectDB');
const youtubeService = require('./services/youtubeService');
const videoRoutes = require('./routes/videoRoutes');

const app = express();
const PORT = process.env.PORT || 7070;
const FETCH_INTERVAL = parseInt(process.env.FETCH_INTERVAL) || 10000;

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); //For static files

// Routes
app.use('/api/videos', videoRoutes);


// Schedule video fetching
const scheduleVideoFetch = () => {
    console.log(`Scheduling video fetch every ${FETCH_INTERVAL / 1000} seconds`);


    const interval = Math.max(10, Math.floor(FETCH_INTERVAL / 1000)); // Minimum 10 seconds
    cron.schedule(`*/${interval} * * * * *`, async () => {
        await youtubeService.fetchLatestVideos();
    });

    youtubeService.fetchLatestVideos();
};

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
    scheduleVideoFetch();
});
