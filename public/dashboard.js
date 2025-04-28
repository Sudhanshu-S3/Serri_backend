document.addEventListener('DOMContentLoaded', () => {

    let currentPage = 1;
    let totalPages = 1;
    let currentSearch = '';
    let currentSort = 'publishedAt_desc'; // Default sort
    let suggestionTimeout = null;

    
    const videoContainer = document.getElementById('videoContainer');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const sortBy = document.getElementById('sortBy');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const themeToggle = document.getElementById('themeToggle');


    initializeTheme();


    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'suggestionsContainer';
    suggestionsContainer.className = 'suggestions-container';
    searchInput.parentNode.insertBefore(suggestionsContainer, searchInput.nextSibling);

    // Initial load
    fetchVideos();

    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
            hideSuggestions();
        } else if (e.key === 'ArrowDown' && suggestionsContainer.children.length > 0) {
            suggestionsContainer.firstElementChild.focus();
        } else {
            handleInputChange();
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target !== searchInput && e.target !== suggestionsContainer) {
            hideSuggestions();
        }
    });

    // Theme toggle event listener
    themeToggle.addEventListener('change', toggleTheme);

    sortBy.addEventListener('change', handleSort);
    prevPageBtn.addEventListener('click', goToPreviousPage);
    nextPageBtn.addEventListener('click', goToNextPage);

    // Theme functions
    function initializeTheme() {
    
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeToggle.checked = savedTheme === 'dark';
        } else {
            // Use system preference if available
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeToggle.checked = true;
                localStorage.setItem('theme', 'dark');
            }
        }
    }

    function toggleTheme() {
        const isDark = themeToggle.checked;
        const theme = isDark ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // Functions
    function handleInputChange() {
        const query = searchInput.value.trim();

        // Clear previous timeout
        if (suggestionTimeout) {
            clearTimeout(suggestionTimeout);
        }

        // Don't fetch suggestions for empty or very short queries
        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        // Set a timeout to avoid too many requests while typing
        suggestionTimeout = setTimeout(() => {
            fetchSuggestions(query);
        }, 300);
    }

    async function fetchSuggestions(query) {
        try {
            const response = await fetch(`/api/videos/suggestions?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            displaySuggestions(data.suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        }
    }

    function displaySuggestions(suggestions) {
        suggestionsContainer.innerHTML = '';

        if (!suggestions.length) {
            hideSuggestions();
            return;
        }

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.tabIndex = 0;

            item.addEventListener('click', () => {
                searchInput.value = suggestion;
                hideSuggestions();
                handleSearch();
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    searchInput.value = suggestion;
                    hideSuggestions();
                    handleSearch();
                } else if (e.key === 'ArrowDown') {
                    if (item.nextElementSibling) {
                        item.nextElementSibling.focus();
                    }
                } else if (e.key === 'ArrowUp') {
                    if (item.previousElementSibling) {
                        item.previousElementSibling.focus();
                    } else {
                        searchInput.focus();
                    }
                }
            });

            suggestionsContainer.appendChild(item);
        });

        suggestionsContainer.style.display = 'block';
    }

    function hideSuggestions() {
        suggestionsContainer.style.display = 'none';
    }

    function handleSearch() {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        fetchVideos();
    }

    function handleSort() {
        currentSort = sortBy.value;
        fetchVideos();
    }

    function goToPreviousPage() {
        if (currentPage > 1) {
            currentPage--;
            fetchVideos();
        }
    }

    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            fetchVideos();
        }
    }

    async function fetchVideos() {
        try {
            updateButtonStates(true); // Disable buttons during fetch

            // Build API URL
            let url;
            const [sortField, sortOrder] = currentSort.split('_');
            const sortParam = `&sortField=${sortField}&sortOrder=${sortOrder === 'desc' ? -1 : 1}`;

            if (currentSearch) {
                url = `/api/videos/search?query=${encodeURIComponent(currentSearch)}&page=${currentPage}${sortParam}`;
            } else {
                url = `/api/videos?page=${currentPage}${sortParam}`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                displayVideos(data.videos);
                updatePagination(data);
            } else {
                showError('Failed to fetch videos');
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            showError('An error occurred while fetching videos');
        } finally {
            updateButtonStates(false); // Re-enable buttons after fetch
        }
    }

    function displayVideos(videos) {
        if (!videos.length) {
            videoContainer.innerHTML = '<p class="no-results">No videos found</p>';
            return;
        }

        videoContainer.innerHTML = '';

        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card';

            const publishDate = new Date(video.publishedAt).toLocaleDateString();

            card.innerHTML = `
                <a href="${video.videoUrl}" target="_blank">
                    <img src="${video.thumbnails.medium?.url || video.thumbnails.default?.url}" 
                        alt="${video.title}" class="video-thumbnail">
                </a>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-channel">${video.channelTitle}</p>
                    <p class="video-date">Published: ${publishDate}</p>
                </div>
            `;

            videoContainer.appendChild(card);
        });
    }

    function updatePagination(data) {
        totalPages = data.totalPages;
        pageInfo.textContent = `Page ${data.currentPage} of ${data.totalPages}`;

        // Update button states
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    function updateButtonStates(isLoading) {
        const buttons = [searchBtn, prevPageBtn, nextPageBtn];
        buttons.forEach(btn => {
            btn.disabled = isLoading;
        });
    }

    function showError(message) {
        videoContainer.innerHTML = `<p class="error-message">${message}</p>`;
    }
});