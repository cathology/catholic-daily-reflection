/**
 * Build-time content fetcher for Catholic Daily Reflection
 * Fetches public-domain Catholic content and generates entries.json
 * 
 * Requirements:
 * - Node.js 18+
 * - npm install cheerio node-fetch
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== CONFIGURATION =====
const CONFIG_PATH = path.join(__dirname, '..', 'build-config.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'entries.json');
const DEFAULT_CONFIG = {
  year: new Date().getFullYear(),
  dateRange: { start: '01-01', end: '12-31' },
  sources: {
    bible: 'douay-rheims',
    saints: ['newadvent', 'ccel'],
    customBiblePath: null,
    licenseTokens: {}
  },
  generateQuestions: true
};

// ===== UTILITY FUNCTIONS =====
function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      return { ...DEFAULT_CONFIG, ...config };
    }
  } catch (err) {
    log(`Warning: Could not load config, using defaults: ${err.message}`);
  }
  return DEFAULT_CONFIG;
}

function getDatesInRange(start, end) {
  const dates = [];
  const [startMonth, startDay] = start.split('-').map(Number);
  const [endMonth, endDay] = end.split('-').map(Number);
  
  for (let month = startMonth; month <= endMonth; month++) {
    const daysInMonth = new Date(2024, month, 0).getDate(); // 2024 for leap year
    const startD = month === startMonth ? startDay : 1;
    const endD = month === endMonth ? endDay : daysInMonth;
    
    for (let day = startD; day <= endD; day++) {
      dates.push(`${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
  }
  
  return dates;
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== BIBLE FETCHING =====
async function fetchDouayRheimsVerse(bookName, chapter, verses) {
  try {
    // Normalize book name for URL (e.g., "Genesis" -> "genesis")
    const bookSlug = bookName.toLowerCase().replace(/\s+/g, '');
    const url = `https://www.drbo.org/${bookSlug}/${chapter}.htm`;
    
    log(`Fetching ${bookName} ${chapter}:${verses} from DRBO...`);
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 Catholic-Reflection-Builder/1.0' }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // DRBO structure: verses are typically in <p> tags with verse numbers
    // This is a simplified parser - actual DRBO HTML may vary
    let verseText = '';
    const verseNums = verses.split('-').map(Number);
    const startVerse = verseNums[0];
    const endVerse = verseNums.length > 1 ? verseNums[1] : startVerse;
    
    // Look for verse content (DRBO-specific selectors may need adjustment)
    $('p').each((_, elem) => {
      const text = $(elem).text();
      // Simple heuristic: look for verse numbers
      for (let v = startVerse; v <= endVerse; v++) {
        const pattern = new RegExp(`\\b${v}[.:]\\s*(.+?)(?=\\b${v + 1}[.:]|$)`, 's');
        const match = text.match(pattern);
        if (match) {
          verseText += match[1].trim() + ' ';
        }
      }
    });
    
    if (!verseText) {
      throw new Error('Could not parse verse text');
    }
    
    await delay(1000); // Rate limiting
    
    return {
      text: verseText.trim(),
      source: `${bookName} ${chapter}:${verses}, Douay-Rheims`
    };
  } catch (err) {
    log(`Error fetching Douay-Rheims: ${err.message}`);
    return {
      text: 'Scripture text unavailable',
      source: 'Douay-Rheims (fetch failed)',
      status: 'missing-source'
    };
  }
}

async function fetchBibleVerse(config, dateKey) {
  // Simple lectionary mapping (in production, use full lectionary data)
  const sampleLectionary = {
    '01-01': { book: 'Genesis', chapter: 1, verses: '1-2' },
    '12-25': { book: 'John', chapter: 1, verses: '14' }
  };
  
  const reading = sampleLectionary[dateKey];
  if (!reading) {
    return {
      text: 'Scripture reading not yet available for this date',
      source: 'Lectionary (pending)',
      status: 'missing-source'
    };
  }
  
  if (config.sources.customBiblePath) {
    // Load custom translation if provided
    try {
      const customBible = JSON.parse(fs.readFileSync(config.sources.customBiblePath, 'utf8'));
      const key = `${reading.book}-${reading.chapter}-${reading.verses}`;
      if (customBible[key]) {
        return customBible[key];
      }
    } catch (err) {
      log(`Warning: Could not load custom bible: ${err.message}`);
    }
  }
  
  // Fetch from Douay-Rheims
  return await fetchDouayRheimsVerse(reading.book, reading.chapter, reading.verses);
}

// ===== SAINT QUOTE FETCHING =====
async function fetchSaintQuote(dateKey) {
  // Sample saint quotes (in production, scrape from New Advent or CCEL)
  const sampleQuotes = {
    '01-01': {
      text: 'In the beginning was the Word, and this Beginning speaks to us. Let us not seek elsewhere, for the Beginning itself speaks to us.',
      source: 'St. Augustine',
      work: 'Tractates on the Gospel of John'
    },
    '12-25': {
      text: 'O Christian, remember your dignity, and becoming a partner in the Divine nature, do not return to your former base condition by degenerate conduct.',
      source: 'St. Leo the Great',
      work: 'Sermon on the Nativity'
    }
  };
  
  if (sampleQuotes[dateKey]) {
    return sampleQuotes[dateKey];
  }
  
  // In production: scrape New Advent or CCEL here
  // Example: fetch Church Fathers texts, extract relevant passages
  
  return {
    text: 'Saint quote pending',
    source: 'Public domain sources',
    status: 'missing-source'
  };
}

// ===== REFLECTION QUESTION GENERATION =====
function generateReflectionQuestion(verse, saint) {
  // Simple template-based generation
  // In production: use more sophisticated NLP or templates
  
  const templates = [
    `How does ${extractKeyPhrase(verse.text)} call you to grow today?`,
    `What does ${extractKeyPhrase(verse.text)} ask you to change?`,
    `How can ${extractKeyPhrase(verse.text)} transform your daily life?`,
    `Where do you see ${extractKeyPhrase(verse.text)} at work in your life?`,
    `What invitation does ${extractKeyPhrase(verse.text)} offer you?`
  ];
  
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  return {
    question: randomTemplate,
    questionSource: 'Generated by local-template-v1'
  };
}

function extractKeyPhrase(text) {
  // Simple heuristic: find first meaningful phrase (6-10 words)
  const words = text.split(/\s+/);
  const stopWords = ['and', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
  
  let phrase = [];
  for (let i = 0; i < Math.min(words.length, 15); i++) {
    const word = words[i].toLowerCase().replace(/[^a-z]/g, '');
    if (!stopWords.includes(word) && word.length > 2) {
      phrase.push(words[i]);
      if (phrase.length >= 4) break;
    }
  }
  
  return phrase.join(' ').toLowerCase();
}

// ===== MAIN BUILD FUNCTION =====
async function buildEntries() {
  log('Starting content fetch...');
  
  const config = loadConfig();
  const dates = getDatesInRange(config.dateRange.start, config.dateRange.end);
  const entries = {};
  
  log(`Processing ${dates.length} dates...`);
  
  for (const dateKey of dates) {
    log(`Building entry for ${dateKey}...`);
    
    try {
      const verse = await fetchBibleVerse(config, dateKey);
      const saint = await fetchSaintQuote(dateKey);
      
      const entry = {
        verse,
        saint
      };
      
      if (config.generateQuestions) {
        const { question, questionSource } = generateReflectionQuestion(verse, saint);
        entry.question = question;
        entry.questionSource = questionSource;
      }
      
      entries[dateKey] = entry;
      
      // Rate limiting between requests
      await delay(500);
    } catch (err) {
      log(`Error building entry for ${dateKey}: ${err.message}`);
      entries[dateKey] = {
        verse: { text: 'Content unavailable', source: 'Error', status: 'error' },
        saint: { text: 'Content unavailable', source: 'Error', status: 'error' },
        question: 'Please try again later'
      };
    }
  }
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(entries, null, 2), 'utf8');
  log(`Successfully wrote ${Object.keys(entries).length} entries to ${OUTPUT_PATH}`);
  
  return entries;
}

// ===== RUN =====
buildEntries()
  .then(() => {
    log('Build complete!');
    process.exit(0);
  })
  .catch(err => {
    log(`Build failed: ${err.message}`);
    console.error(err);
    process.exit(1);
  });
