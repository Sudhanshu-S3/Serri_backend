# SERRI BACKEND ASSIGNMENT

## What This App Does

This app collects YouTube videos based on your search terms and shows them in a nice dashboard. It:

- Automatically finds new videos every few seconds
- Saves videos to a database so you can view them later
- Lets you search through all saved videos
- Shows videos in a grid with thumbnails and basic info

## Setting Up the App

### What You'll Need

- Node.js installed on your computer
- MongoDB database
- YouTube API key(s)

### Setup Steps

1. **Download the project**:

   ```
   git clone https://github.com/Sudhanshu-S3/Serri_backend
   cd serri
   ```

2. **Install dependencies**:

   ```
   npm install
   ```

3. **Create a .env file** with these settings:

   ```
   PORT=7070
   MONGODB_URI=your_mongodb_connection_string
   YOUTUBE_API_KEYS=your_api_key1,your_api_key2
   SEARCH_QUERY=your search term
   FETCH_INTERVAL=10000
   PAGE_SIZE=10
   ```

4. **Start the app**:

   ```
   npm start
   ```

5. **Open in browser**:
   ```
   http://localhost:7070
   ```

## Using Docker

If you have Docker installed:

```
docker build -t youtube-app .
docker run -p 12121:12121 -e MONGODB_URI=your_mongodb_uri youtube-app
```

## Testing the API

You can test the API endpoints using your browser, Postman, or other tools.

### Main API Endpoints

#### 1. Get All Videos

**Request**:

```
GET http://localhost:7070/api/videos?page=1&sortField=publishedAt&sortOrder=-1
```

**What it does**: Gets videos with newest first, 10 per page

#### 2. Search Videos

**Request**:

```
GET http://localhost:7070/api/videos/search?query=your+search+term&page=1
```

**What it does**: Finds videos matching your search words

#### 3. Get Search Suggestions

**Request**:

```
GET http://localhost:7070/api/videos/suggestions?query=par
```

**What it does**: Shows possible search terms as you type

### Testing Tips

- **Change the page number**: Add `?page=2` to see more results
- **Sort differently**: Add `&sortField=title&sortOrder=1` to sort A-Z
- **Combine options**: You can use page and sort together

Example: `http://localhost:7070/api/videos?page=2&sortField=title&sortOrder=1`

## Features

- **Dark/Light Theme**: Click the toggle button to switch
- **Search**: Type keywords to find videos
- **Sort Options**: Newest, oldest, or alphabetical
- **Pagination**: Browse through all videos easily

Author Sudhanshu
