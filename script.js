// ===== STATE & CONFIG =====
let entriesData = null;
let liturgicalData = null;
let currentDate = null;
let touchStartX = 0;
let touchEndX = 0;
let settings = {
    showCountdown: true,
    showLiturgicalColor: true,
    showProgressBar: true
};

// Liturgical colors mapping (darker for better contrast)
const LITURGICAL_COLORS = {
    'green': '#2D5016',
    'violet': '#4B0082',
    'white': '#E8E8E8',
    'red': '#8B0000',
    'rose': '#C8A2C8',
    'black': '#000000'
};

// Major feasts for countdown
const MAJOR_FEASTS = {
    easter: { name: 'Easter', calculate: calculateEaster },
    christmas: { name: 'Christmas', date: (year) => new Date(year, 11, 25) }
};

// ===== DOM ELEMENTS =====
const dateEl = document.getElementById('date');
const liturgicalDayEl = document.getElementById('liturgical-day');
const verseEl = document.getElementById('verse');
const verseSourceEl = document.getElementById('verse-source');
const saintQuoteEl = document.getElementById('saint-quote');
const saintSourceEl = document.getElementById('saint-source');
const saintWorkEl = document.getElementById('saint-work');
const reflectionEl = document.getElementById('reflection-question');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const contentEl = document.getElementById('content');
const attributionOverlay = document.getElementById('attribution-overlay');
const attributionDetails = document.getElementById('attribution-details');
const countdownEl = document.getElementById('countdown-text');
const countdownContainer = document.getElementById('countdown-container');
const liturgicalAccent = document.getElementById('liturgical-accent');
const yearProgressBar = document.getElementById('year-progress-bar');
const yearProgressContainer = document.getElementById('year-progress-container');

// Menu elements
const menuToggle = document.getElementById('menu-toggle');
const menuClose = document.getElementById('menu-close');
const sideMenu = document.getElementById('side-menu');
const themeToggleMenu = document.getElementById('theme-toggle-menu');
const randomButton = document.getElementById('random-button');
const gotoDateButton = document.getElementById('goto-date-button');
const attributionButton = document.getElementById('attribution-button');
const toggleCountdown = document.getElementById('toggle-countdown');
const toggleLiturgicalColor = document.getElementById('toggle-liturgical-color');
const toggleProgressBar = document.getElementById('toggle-progress-bar');

// Navigation elements
const navPrev = document.getElementById('nav-prev');
const navToday = document.getElementById('nav-today');
const navNext = document.getElementById('nav-next');

// Modal elements
const gotoModal = document.getElementById('goto-modal');
const datePicker = document.getElementById('date-picker');
const gotoConfirm = document.getElementById('goto-confirm');
const gotoCancel = document.getElementById('goto-cancel');

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

// Easter calculation (Computus algorithm)
function calculateEaster(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function getNextMajorFeast(fromDate) {
    const year = fromDate.getFullYear();
    const feasts = [
        { name: 'Christmas', date: new Date(year, 11, 25) },
        { name: 'Easter', date: calculateEaster(year) }
    ];
    
    // Add next year's feasts too
    feasts.push({ name: 'Easter', date: calculateEaster(year + 1) });
    feasts.push({ name: 'Christmas', date: new Date(year + 1, 11, 25) });
    
    // Find next feast after current date
    const upcoming = feasts
        .filter(f => f.date > fromDate)
        .sort((a, b) => a.date - b.date);
    
    return upcoming[0];
}

function calculateDaysUntil(targetDate, fromDate) {
    const diff = targetDate - fromDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getYearProgress(date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const progress = (date - start) / (end - start);
    return Math.round(progress * 100);
}

// ===== SETTINGS MANAGEMENT =====
function loadSettings() {
    const saved = localStorage.getItem('catholic-reflection-settings');
    if (saved) {
        settings = { ...settings, ...JSON.parse(saved) };
    }
    
    // Apply settings to UI
    toggleCountdown.checked = settings.showCountdown;
    toggleLiturgicalColor.checked = settings.showLiturgicalColor;
    toggleProgressBar.checked = settings.showProgressBar;
    
    updateSettingsDisplay();
}

function saveSettings() {
    localStorage.setItem('catholic-reflection-settings', JSON.stringify(settings));
}

function updateSettingsDisplay() {
    // Countdown
    if (settings.showCountdown) {
        countdownContainer.classList.remove('hidden');
    } else {
        countdownContainer.classList.add('hidden');
    }
    
    // Liturgical color
    if (!settings.showLiturgicalColor) {
        liturgicalAccent.classList.add('hidden');
    } else {
        liturgicalAccent.classList.remove('hidden');
    }
    
    // Progress bar
    if (settings.showProgressBar) {
        yearProgressContainer.classList.remove('hidden');
    } else {
        yearProgressContainer.classList.add('hidden');
    }
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
        const isGitHubPages = window.location.hostname.includes('github.io');
        const basePath = isGitHubPages ? '/catholic-daily-reflection' : '';
        const dataPath = `${basePath}/data/entries.json`;
        
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error('Failed to load entries');
        
        entriesData = await response.json();
        return true;
    } catch (err) {
        console.error('Error loading entries:', err);
        return false;
    }
}

async function loadLiturgicalCalendar() {
    try {
        const isGitHubPages = window.location.hostname.includes('github.io');
        const basePath = isGitHubPages ? '/catholic-daily-reflection' : '';
        const calendarPath = `${basePath}/data/liturgical-calendar.json`;
        
        const response = await fetch(calendarPath);
        if (!response.ok) throw new Error('Failed to load liturgical calendar');
        
        liturgicalData = await response.json();
        return true;
    } catch (err) {
        console.error('Error loading liturgical calendar:', err);
        return false;
    }
}

function getLiturgicalInfo(date) {
    if (!liturgicalData) return { name: null, color: 'green' };
    
    const dateKey = getDateKey(date);
    const year = date.getFullYear();
    const easterDate = calculateEaster(year);
    
    // Check for movable feasts first (highest priority)
    const movableFeast = checkMovableFeast(date, easterDate);
    if (movableFeast) {
        return { name: movableFeast.name, color: movableFeast.color };
    }
    
    // Check for fixed feasts
    if (liturgicalData.fixed[dateKey]) {
        const feast = liturgicalData.fixed[dateKey];
        return { name: feast.name, color: feast.color };
    }
    
    // Determine liturgical season
    const season = getLiturgicalSeason(date, easterDate);
    return { name: getSeasonalName(date, season), color: season.color };
}

function checkMovableFeast(date, easterDate) {
    if (!liturgicalData.movable) return null;
    
    for (const [key, feast] of Object.entries(liturgicalData.movable)) {
        let feastDate;
        
        if (feast.sunday_before_advent) {
            // Christ the King: Last Sunday before Advent
            const firstAdventSunday = getFirstAdventSunday(date.getFullYear());
            feastDate = new Date(firstAdventSunday);
            feastDate.setDate(feastDate.getDate() - 7);
        } else if (feast.offset !== undefined) {
            // Offset from Easter
            feastDate = new Date(easterDate);
            feastDate.setDate(feastDate.getDate() + feast.offset);
        }
        
        if (feastDate && isSameDay(date, feastDate)) {
            return { name: feast.name, color: feast.color };
        }
    }
    
    return null;
}

function getLiturgicalSeason(date, easterDate) {
    const year = date.getFullYear();
    
    // Christmas Season: Dec 25 - Baptism of the Lord
    if (isInChristmasSeason(date)) {
        return { color: 'white', name: 'Christmas' };
    }
    
    // Advent: 4 Sundays before Christmas
    const firstAdventSunday = getFirstAdventSunday(year);
    if (date >= firstAdventSunday && date < new Date(year, 11, 25)) {
        // Check for Gaudete Sunday (3rd Sunday of Advent)
        const gaudete = new Date(firstAdventSunday);
        gaudete.setDate(gaudete.getDate() + 14);
        if (isSameDay(date, gaudete)) {
            return { color: 'rose', name: 'Advent' };
        }
        return { color: 'violet', name: 'Advent' };
    }
    
    // Lent: Ash Wednesday to Holy Saturday
    const ashWednesday = new Date(easterDate);
    ashWednesday.setDate(ashWednesday.getDate() - 46);
    const holySaturday = new Date(easterDate);
    holySaturday.setDate(holySaturday.getDate() - 1);
    
    if (date >= ashWednesday && date <= holySaturday) {
        // Check for Laetare Sunday (4th Sunday of Lent)
        const laetare = new Date(easterDate);
        laetare.setDate(laetare.getDate() - 21);
        if (isSameDay(date, laetare)) {
            return { color: 'rose', name: 'Lent' };
        }
        return { color: 'violet', name: 'Lent' };
    }
    
    // Easter Season: Easter to Pentecost (50 days)
    const pentecost = new Date(easterDate);
    pentecost.setDate(pentecost.getDate() + 49);
    if (date >= easterDate && date <= pentecost) {
        return { color: 'white', name: 'Easter' };
    }
    
    // Ordinary Time (default)
    return { color: 'green', name: 'Ordinary Time' };
}

function isInChristmasSeason(date) {
    const year = date.getFullYear();
    const christmas = new Date(year, 11, 25);
    
    // If before Christmas, check if after previous year's Christmas
    if (date < christmas) {
        const prevChristmas = new Date(year - 1, 11, 25);
        const baptismOfLord = getBaptismOfTheLord(year);
        return date >= prevChristmas && date <= baptismOfLord;
    }
    
    // After Christmas this year
    const baptismOfLord = getBaptismOfTheLord(year + 1);
    return date >= christmas && date <= baptismOfLord;
}

function getBaptismOfTheLord(year) {
    // Baptism of the Lord: Sunday after Epiphany (Jan 6)
    // If Epiphany is Sunday, Baptism is the next Sunday
    const epiphany = new Date(year, 0, 6);
    const dayOfWeek = epiphany.getDay();
    
    if (dayOfWeek === 0) {
        // Epiphany is Sunday, Baptism is next Sunday
        const baptism = new Date(year, 0, 13);
        return baptism;
    } else {
        // Find the next Sunday after Epiphany
        const daysUntilSunday = 7 - dayOfWeek;
        const baptism = new Date(year, 0, 6 + daysUntilSunday);
        return baptism;
    }
}

function getFirstAdventSunday(year) {
    // First Sunday of Advent: 4th Sunday before Christmas
    const christmas = new Date(year, 11, 25);
    const dayOfWeek = christmas.getDay();
    
    // Days from Christmas to previous Sunday
    const daysToSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    // Go back 4 Sundays
    const firstAdvent = new Date(year, 11, 25 - daysToSunday - 21);
    return firstAdvent;
}

function getSeasonalName(date, season) {
    if (season.name === 'Ordinary Time') {
        return getSundayInOrdinaryTime(date);
    }
    return null; // For Advent, Lent, Easter, Christmas - don't show generic name
}

function getSundayInOrdinaryTime(date) {
    // Only show for Sundays
    if (date.getDay() !== 0) return null;
    
    // Calculate which Sunday of Ordinary Time
    // This is simplified - proper calculation is complex
    const year = date.getFullYear();
    const baptismOfLord = getBaptismOfTheLord(year);
    const easterDate = calculateEaster(year);
    const ashWednesday = new Date(easterDate);
    ashWednesday.setDate(ashWednesday.getDate() - 46);
    
    // First period of Ordinary Time
    if (date > baptismOfLord && date < ashWednesday) {
        const weeksDiff = Math.floor((date - baptismOfLord) / (7 * 24 * 60 * 60 * 1000));
        return `${getOrdinal(weeksDiff + 1)} Sunday in Ordinary Time`;
    }
    
    // Second period of Ordinary Time (after Pentecost)
    const pentecost = new Date(easterDate);
    pentecost.setDate(pentecost.getDate() + 49);
    if (date > pentecost) {
        const weeksDiff = Math.floor((date - pentecost) / (7 * 24 * 60 * 60 * 1000));
        return `${getOrdinal(weeksDiff + 1)} Sunday in Ordinary Time`;
    }
    
    return null;
}

function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function getEntryForDate(date) {
    if (!entriesData) return null;
    
    const fullKey = getFullDateKey(date);
    if (entriesData[fullKey]) return entriesData[fullKey];
    
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
    
    // Get liturgical information
    const liturgical = getLiturgicalInfo(date);
    
    // Update liturgical day
    if (liturgical.name) {
        liturgicalDayEl.textContent = liturgical.name;
        liturgicalDayEl.style.display = 'block';
    } else {
        liturgicalDayEl.style.display = 'none';
    }
    
    // Update liturgical color
    if (liturgical.color && settings.showLiturgicalColor) {
        const color = LITURGICAL_COLORS[liturgical.color] || LITURGICAL_COLORS['green'];
        document.documentElement.style.setProperty('--liturgical-color', color);
    } else {
        document.documentElement.style.setProperty('--liturgical-color', 'transparent');
    }
    
    // Update verse
    verseEl.textContent = entry.verse.text;
    verseSourceEl.textContent = entry.verse.source;
    
    // Update saint quote
    saintQuoteEl.textContent = entry.saint.text;
    saintSourceEl.textContent = entry.saint.source;
    
    // Update saint work (check if it exists in the entry)
    if (entry.saint.work) {
        saintWorkEl.textContent = `From: ${entry.saint.work}`;
        saintWorkEl.style.display = 'block';
    } else {
        saintWorkEl.style.display = 'none';
    }
    
    // Update reflection question
    reflectionEl.textContent = entry.question;
    
    // Update countdown
    updateCountdown(date);
    
    // Update year progress
    updateYearProgress(date);
    
    currentDate = date;
    hideLoading();
}

function updateCountdown(date) {
    if (!settings.showCountdown) return;
    
    const nextFeast = getNextMajorFeast(date);
    if (nextFeast) {
        const days = calculateDaysUntil(nextFeast.date, date);
        countdownEl.textContent = `${days} days until ${nextFeast.name}`;
    }
}

function updateYearProgress(date) {
    const progress = getYearProgress(date);
    yearProgressBar.style.width = `${progress}%`;
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

function goToToday() {
    const today = new Date();
    updateURL(today);
    renderEntry(today);
}

function goToRandomDate() {
    if (!entriesData) return;
    
    const keys = Object.keys(entriesData);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    
    // Parse the key to create a date
    let date;
    if (randomKey.includes('-') && randomKey.split('-').length === 2) {
        // MM-DD format
        const [month, day] = randomKey.split('-');
        date = new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day));
    } else if (randomKey.includes('-') && randomKey.split('-').length === 3) {
        // YYYY-MM-DD format
        date = new Date(randomKey);
    }
    
    if (date && !isNaN(date.getTime())) {
        updateURL(date);
        renderEntry(date);
        closeMenu();
    }
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
        closeGotoModal();
        closeMenu();
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
            changeDate(1);
        } else {
            changeDate(-1);
        }
    }
}

// ===== MENU =====
function openMenu() {
    sideMenu.classList.remove('hidden');
}

function closeMenu() {
    sideMenu.classList.add('hidden');
}

function toggleMenu() {
    if (sideMenu.classList.contains('hidden')) {
        openMenu();
    } else {
        closeMenu();
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
    
    const verseDt = document.createElement('dt');
    verseDt.textContent = 'Scripture:';
    const verseDd = document.createElement('dd');
    verseDd.textContent = entry.verse.source;
    attributionDetails.appendChild(verseDt);
    attributionDetails.appendChild(verseDd);
    
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
    
    if (entry.questionSource) {
        const refDt = document.createElement('dt');
        refDt.textContent = 'Reflection:';
        const refDd = document.createElement('dd');
        refDd.textContent = entry.questionSource;
        attributionDetails.appendChild(refDt);
        attributionDetails.appendChild(refDd);
    }
    
    attributionOverlay.classList.remove('hidden');
    closeMenu();
}

function hideAttribution() {
    attributionOverlay.classList.add('hidden');
}

// ===== GO TO DATE MODAL =====
function openGotoModal() {
    datePicker.value = getFullDateKey(currentDate);
    gotoModal.classList.remove('hidden');
    closeMenu();
}

function closeGotoModal() {
    gotoModal.classList.add('hidden');
}

function confirmGotoDate() {
    const selectedDate = new Date(datePicker.value);
    if (!isNaN(selectedDate.getTime())) {
        updateURL(selectedDate);
        renderEntry(selectedDate);
        closeGotoModal();
    }
}

// ===== PWA SERVICE WORKER =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/catholic-daily-reflection/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Menu
    menuToggle.addEventListener('click', toggleMenu);
    menuClose.addEventListener('click', closeMenu);
    themeToggleMenu.addEventListener('click', () => {
        toggleTheme();
        closeMenu();
    });
    randomButton.addEventListener('click', goToRandomDate);
    gotoDateButton.addEventListener('click', openGotoModal);
    attributionButton.addEventListener('click', showAttribution);
    
    // Settings toggles
    toggleCountdown.addEventListener('change', (e) => {
        settings.showCountdown = e.target.checked;
        saveSettings();
        updateSettingsDisplay();
        updateCountdown(currentDate);
    });
    
    toggleLiturgicalColor.addEventListener('change', (e) => {
        settings.showLiturgicalColor = e.target.checked;
        saveSettings();
        updateSettingsDisplay();
        renderEntry(currentDate);
    });
    
    toggleProgressBar.addEventListener('change', (e) => {
        settings.showProgressBar = e.target.checked;
        saveSettings();
        updateSettingsDisplay();
    });
    
    // Navigation
    navPrev.addEventListener('click', () => changeDate(-1));
    navToday.addEventListener('click', goToToday);
    navNext.addEventListener('click', () => changeDate(1));
    
    // Go to date modal
    gotoConfirm.addEventListener('click', confirmGotoDate);
    gotoCancel.addEventListener('click', closeGotoModal);
    gotoModal.addEventListener('click', (e) => {
        if (e.target === gotoModal) closeGotoModal();
    });
    
    // Keyboard & touch
    document.addEventListener('keydown', handleKeyboard);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    // Attribution overlay
    attributionOverlay.addEventListener('click', (e) => {
        if (e.target === attributionOverlay) hideAttribution();
    });
    
    // Browser navigation
    window.addEventListener('popstate', () => {
        const date = parseDateFromURL();
        renderEntry(date);
    });
}

// ===== INITIALIZATION =====
async function init() {
    showLoading();
    
    loadTheme();
    loadSettings();
    
    // Load both data files
    const [entriesLoaded, liturgicalLoaded] = await Promise.all([
        loadEntries(),
        loadLiturgicalCalendar()
    ]);
    
    if (!entriesLoaded) {
        showError();
        return;
    }
    
    // Liturgical calendar is optional - site works without it
    if (!liturgicalLoaded) {
        console.warn('Liturgical calendar not loaded, using defaults');
    }
    
    const initialDate = parseDateFromURL();
    currentDate = initialDate;
    updateURL(currentDate);
    renderEntry(currentDate);
    
    setupEventListeners();
}

init();
