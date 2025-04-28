const express = require('express');

require('dotenv').config();

const connectDB = require('./config/connectDB');

const app = express();
const PORT = process.env.PORT || 7070;
const videoRoutes = require('./routes/videoRoutes');
const cors = require('cors');
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); //For static files

// Routes
app.use('/api/videos', videoRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});