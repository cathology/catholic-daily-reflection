// ===== STATE & CONFIG =====
let entriesData = null;
let currentDate = null;
let touchStartX = 0;
let touchEndX = 0;

// ===== DOM ELEMENTS =====
const dateEl = document.getElementById('date');
const verseEl = document.getElementById('verse');
const verseSourceEl = document.getElementById('verse-source');
const saintQuoteEl = document.getElementById('saint-quote');
const saintSourceEl = document.getElementById('saint-source');
const reflectionEl = document.getElementById('reflection-question');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const contentEl = document.getElementById('content');
const themeToggle = document.getElementById('theme-toggle');
const attributionOverlay = document.getElementById('attribution-overlay');
const attributionDetails = document.getElementById('attribution-details');

// ===== UTILITY FUNCTIONS =====
function formatDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function getDateKey(date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
}

function getFullDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const d = params.get('d');
    
    if (d) {
        const parsed = new Date(d);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    
    return new Date();
}

function updateURL(date) {
    const dateStr = getFullDateKey(date);
    const url = new URL(window.location);
    url.searchParams.set('d', dateStr);
    window.history.pushState({}, '', url);
}

// ===== THEME MANAGEMENT =====
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ===== CONTENT LOADING =====
async function loadEntries() {
    try {
        // Try repository path first (GitHub Pages), fall back to relative path (local)
        let response = await fetch('/catholic-daily-reflection/data/entries.json');
        
        // If 404, try relative path for local development
        if (!response.ok) {
            response = await fetch('data/entries.json');
        }
        
        if (!response.ok) throw new Error('Failed to load entries');
        entriesData = await response.json();
        return true;
    } catch (err) {
        console.error('Error loading entries:', err);
        return false;
    }
}

function getEntryForDate(date) {
    if (!entriesData) return null;
    
    // Try full date first (YYYY-MM-DD)
    const fullKey = getFullDateKey(date);
    if (entriesData[fullKey]) return entriesData[fullKey];
    
    // Fall back to repeating date (MM-DD)
    const dateKey = getDateKey(date);
    if (entriesData[dateKey]) return entriesData[dateKey];
    
    return null;
}

function renderEntry(date) {
    const entry = getEntryForDate(date);
    
    if (!entry) {
        showError();
        return;
    }
    
    // Update date
    dateEl.textContent = formatDate(date);
    dateEl.setAttribute('datetime', getFullDateKey(date));
    
    // Update verse
    verseEl.textContent = entry.verse.text;
    verseSourceEl.textContent = entry.verse.source;
    
    // Update saint quote
    saintQuoteEl.textContent = entry.saint.text;
    saintSourceEl.textContent = entry.saint.source;
    
    // Update reflection question
    reflectionEl.textContent = entry.question;
    
    // Store current entry for attribution
    currentDate = date;
    
    hideLoading();
}

function showLoading() {
    contentEl.style.opacity = '0';
    loadingEl.classList.remove('hidden');
    errorEl.classList.add('hidden');
}

function hideLoading() {
    loadingEl.classList.add('hidden');
    contentEl.style.opacity = '1';
}

function showError() {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    contentEl.style.opacity = '0.3';
}

// ===== NAVIGATION =====
function changeDate(offset) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    updateURL(newDate);
    renderEntry(newDate);
}

function handleKeyboard(e) {
    if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeDate(-1);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        changeDate(1);
    } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        toggleAttribution();
    } else if (e.key === 'Escape') {
        hideAttribution();
    }
}

// ===== TOUCH GESTURES =====
function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swiped left - next day
            changeDate(1);
        } else {
            // Swiped right - previous day
            changeDate(-1);
        }
    }
}

// ===== ATTRIBUTION =====
function toggleAttribution() {
    if (attributionOverlay.classList.contains('hidden')) {
        showAttribution();
    } else {
        hideAttribution();
    }
}

function showAttribution() {
    const entry = getEntryForDate(currentDate);
    if (!entry) return;
    
    attributionDetails.innerHTML = '';
    
    // Verse attribution
    const verseDt = document.createElement('dt');
    verseDt.textContent = 'Scripture:';
    const verseDd = document.createElement('dd');
    verseDd.textContent = entry.verse.source;
    attributionDetails.appendChild(verseDt);
    attributionDetails.appendChild(verseDd);
    
    // Saint attribution
    const saintDt = document.createElement('dt');
    saintDt.textContent = 'Saint Quote:';
    const saintDd = document.createElement('dd');
    saintDd.textContent = entry.saint.source;
    if (entry.saint.work) {
        const workSpan = document.createElement('span');
        workSpan.textContent = ` (${entry.saint.work})`;
        saintDd.appendChild(workSpan);
    }
    attributionDetails.appendChild(saintDt);
    attributionDetails.appendChild(saintDd);
    
    // Reflection attribution
    if (entry.questionSource) {
        const refDt = document.createElement('dt');
        refDt.textContent = 'Reflection:';
        const refDd = document.createElement('dd');
        refDd.textContent = entry.questionSource;
        attributionDetails.appendChild(refDt);
        attributionDetails.appendChild(refDd);
    }
    
    attributionOverlay.classList.remove('hidden');
}

function hideAttribution() {
    attributionOverlay.classList.add('hidden');
}

// ===== INITIALIZATION =====
async function init() {
    showLoading();
    
    // Load theme preference
    loadTheme();
    
    // Load entries data
    const loaded = await loadEntries();
    if (!loaded) {
        showError();
        return;
    }
    
    // Parse initial date
    const initialDate = parseDateFromURL();
    currentDate = initialDate;
    updateURL(currentDate);
    renderEntry(currentDate);
    
    // Set up event listeners
    themeToggle.addEventListener('click', toggleTheme);
    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    attributionOverlay.addEventListener('click', (e) => {
        if (e.target === attributionOverlay) {
            hideAttribution();
        }
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        const date = parseDateFromURL();
        renderEntry(date);
    });
}

// Start the app
init();
