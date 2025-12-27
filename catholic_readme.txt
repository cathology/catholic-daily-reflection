# Catholic Daily Reflection

A minimal, single-page Catholic daily reflection site with automated content generation. Features daily Bible verses, saint quotes, and contemplative questions.

## Features

- **Ultra-minimal design**: Black & white, system fonts, centered content
- **Automated content**: GitHub Actions fetch and compile public-domain Catholic sources
- **Keyboard & touch navigation**: Arrow keys or swipe to navigate dates
- **Dark mode**: Small unlabeled toggle in top-right corner (persists preference)
- **Accessible**: Semantic HTML, ARIA labels, keyboard navigation
- **Privacy-focused**: No analytics, no external CDNs, no tracking

## Quick Start

### 1. Deploy to GitHub Pages

1. **Fork or clone this repository**
   ```bash
   git clone https://github.com/yourusername/catholic-reflection.git
   cd catholic-reflection
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `root`
   - Save

3. **Run the build workflow**
   - Go to Actions tab
   - Select "Build Daily Reflections"
   - Click "Run workflow"
   - Wait for completion (~2-5 minutes)

4. **Access your site**
   - Visit `https://yourusername.github.io/catholic-reflection`

### 2. Configuration (Optional)

Copy `build-config.example.json` to `build-config.json` to customize:

```json
{
  "year": 2025,
  "dateRange": {
    "start": "01-01",
    "end": "12-31"
  },
  "sources": {
    "bible": "douay-rheims",
    "saints": ["newadvent", "ccel"]
  },
  "generateQuestions": true
}
```

**Note**: Default configuration uses only public-domain sources. See Copyright section below.

### 3. Automatic Updates (Optional)

To refresh content daily, uncomment the schedule in `.github/workflows/build.yml`:

```yaml
schedule:
  - cron: '0 3 * * *'  # Runs daily at 3 AM UTC
```

## File Structure

```
catholic-reflection/
├── index.html              # Main page
├── style.css               # Minimal styling
├── script.js               # Site logic (navigation, theme)
├── data/
│   └── entries.json        # Generated content (auto-updated by Actions)
├── build-scripts/
│   └── fetch-data.js       # Content fetcher (runs in GitHub Actions)
├── .github/
│   └── workflows/
│       └── build.yml       # GitHub Actions workflow
├── build-config.example.json
└── README.md
```

## Usage

### Navigation
- **Arrow keys**: Left/right to change date
- **Touch**: Swipe left/right
- **URL**: `?d=2025-01-01` or `?d=01-01`

### Attribution
- Press `i` to view sources for current day's content
- Press `i` or `Esc` to close

### Theme Toggle
- Click small square in top-right corner
- Preference saved to `localStorage`
- Respects `prefers-color-scheme`

## Content Sources

### Default (Public Domain Only)

The build script automatically fetches from:

1. **Bible**: Douay-Rheims translation (drbo.org)
   - Public domain Catholic Bible
   - Pre-Vatican II approved translation

2. **Saint Quotes**: 
   - New Advent (newadvent.org) - Church Fathers
   - Christian Classics Ethereal Library (ccel.org)
   - Project Gutenberg - classic spiritual works

3. **Reflection Questions**:
   - Generated locally using templates
   - Based on verse and saint quote content

### Custom/Licensed Content

**⚠️ IMPORTANT COPYRIGHT NOTICE**

If you want to use modern Bible translations (NABRE, RSV-CE, etc.) or contemporary devotional content:

1. **You MUST obtain proper licensing** from the copyright holder
2. **You are legally responsible** for compliance
3. **Options**:
   - Upload pre-licensed content to `data/custom-bible.json`
   - Add license tokens to `build-config.json`
   - Contact publishers for permissions

**Modern translations are copyrighted**. The build script will NOT automatically scrape copyrighted sources without explicit authorization.

#### Adding Custom Bible Translation

1. Obtain license for translation
2. Create `data/custom-bible.json`:
   ```json
   {
     "Genesis-1-1-2": {
       "text": "Your licensed translation text...",
       "source": "Translation Name"
     }
   }
   ```
3. Update `build-config.json`:
   ```json
   {
     "sources": {
       "customBiblePath": "data/custom-bible.json"
     }
   }
   ```

## Copyright & Legal

### Site Owner Responsibilities

**You are responsible for**:
- Ensuring all content is properly licensed
- Obtaining permissions for copyrighted material
- Compliance with publisher terms of service
- Attribution requirements

### Default Content Licenses

- **Douay-Rheims Bible**: Public domain
- **Church Fathers (New Advent)**: Public domain
- **CCEL texts**: Public domain or Creative Commons
- **Generated questions**: Original content

### Respecting Copyright

This project is designed to respect intellectual property:
- Build script uses only public domain sources by default
- Requires explicit configuration for copyrighted content
- No automated scraping of modern translations
- Clear documentation of licensing requirements

**When in doubt, use public domain sources only.**

## Technical Details

### Build Process

1. GitHub Actions triggers `fetch-data.js`
2. Script fetches content from configured sources
3. Content normalized and compiled to `data/entries.json`
4. JSON committed back to repository
5. GitHub Pages serves updated content

### Runtime Performance

- **No external requests**: All content pre-fetched
- **Static JSON**: Fast loading, no database
- **Minimal JS**: ~3KB (uncompressed)
- **No dependencies**: Pure vanilla JavaScript

### Browser Support

- Modern browsers (2024+)
- ES6+ JavaScript required
- CSS Grid and Custom Properties
- `localStorage` for theme persistence

## Troubleshooting

### Build fails
- Check Actions tab for error logs
- Verify Node.js version (20+ required)
- Check network connectivity in Actions runner

### Content not updating
- Manually trigger workflow from Actions tab
- Check if `data/entries.json` exists
- Verify GitHub Pages is enabled

### Missing dates
- Check `build-config.json` date range
- Some dates may not have lectionary mappings yet
- Review build logs for fetch failures

## Development

### Local Testing

```bash
# Install dependencies
cd build-scripts
npm install cheerio node-fetch

# Run build script
node fetch-data.js

# Serve site locally
python -m http.server 8000
# or
npx serve
```

### Extending Sources

Edit `build-scripts/fetch-data.js`:

1. Add new fetch functions
2. Update `buildEntries()` logic
3. Add error handling
4. Test with manual workflow run

## Contributing

Contributions welcome! Please ensure:
- Only public domain sources in default configuration
- Clear copyright documentation
- Accessible, minimal design maintained
- No external dependencies added

## License

**Code**: MIT License (see LICENSE file)

**Content**: Varies by source (see Content Sources section)

**Your responsibility**: Ensure all content you deploy is properly licensed for your use case.

## Support

- **Issues**: GitHub Issues
- **Questions**: Discussions tab
- **Catholic content questions**: Consult your diocese or parish

---

*This is an open-source project. Site owners are solely responsible for copyright compliance and proper licensing of all deployed content.*