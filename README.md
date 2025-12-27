# Catholic Daily Reflection

A minimal, installable Catholic daily reflection Progressive Web App (PWA) with automated content. Features daily Bible verses, saint quotes, liturgical information, and contemplative questions.

## ✨ Features

### Core Experience
- **Ultra-minimal design**: Black & white aesthetic, system fonts, centered content
- **Liturgical integration**: Daily liturgical names (feasts, seasons) and color accents
- **Saint wisdom**: Includes the work/source of each saint quote
- **Progressive Web App**: Install on any device, works offline
- **Keyboard & touch navigation**: Arrow keys, swipe gestures, bottom nav

### Enhanced Features
- **Feast countdown**: Days until next major feast (Easter/Christmas)
- **Year progress bar**: Subtle indicator at top of page
- **Liturgical color accents**: Visual border matching the liturgical season
- **Random exploration**: Discover any day's reflection
- **Date navigation**: Jump to any specific date
- **Customizable display**: Toggle features via hamburger menu
- **Dark/light mode**: Persistent theme preference

### Privacy & Performance
- **No analytics or tracking**
- **No external CDNs**
- **Fully static at runtime**
- **Offline-capable**

## 🚀 Quick Start

### 1. Enable GitHub Pages

1. Go to **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. Click **Save**

### 2. Generate PWA Icons

1. Download `icon-generator.html` from this repo
2. Open it in a browser
3. Click both download buttons to get `icon-192.png` and `icon-512.png`
4. Upload both icons to the root of your repository
5. Commit and push

### 3. Data Files

Your site uses **two separate data files**:

#### A. `data/entries.json` - Your Daily Content

This contains verses, saint quotes, and reflections. **You manage this file manually.**

```json
{
  "01-01": {
    "verse": {
      "text": "Scripture text...",
      "source": "Book Chapter:Verse, Translation"
    },
    "saint": {
      "text": "Saint quote...",
      "source": "St. Name",
      "work": "Title of Work (optional)"
    },
    "question": "Reflection question...",
    "questionSource": "Attribution (optional)"
  }
}
```

**Note**: The `saint.work` field is optional. If present, it will be displayed automatically.

#### B. `data/liturgical-calendar.json` - Liturgical Information

This file is **provided in the repository** and contains:
- Universal Roman Calendar feasts and solemnities
- Liturgical colors following proper Catholic rubrics
- Movable feast calculations (Easter, Pentecost, etc.)

**You don't need to edit this file** unless you want to add regional feasts.

The site automatically:
- Calculates Easter and all related movable feasts
- Determines liturgical seasons (Advent, Lent, Easter, Christmas, Ordinary Time)
- Applies correct liturgical colors following hierarchical rules
- Shows feast names for solemnities, feasts, and memorials

### 4. Access Your Site

Visit: `https://yourusername.github.io/catholic-daily-reflection`

### 5. Install as PWA

- **Desktop**: Look for install icon in browser address bar
- **Mobile**: Use browser's "Add to Home Screen" option
- **Works offline** after first visit!

## 📱 Usage

### Navigation
- **Arrow keys**: ← Previous day | → Next day
- **Touch**: Swipe left/right to navigate days
- **Bottom nav**: Prev | Today | Next buttons
- **URL**: `?d=2025-01-01` for specific dates

### Hamburger Menu (Top-Left)
- **Toggle Light/Dark Mode**: Switch themes
- **Show/Hide Features**: 
  - Feast countdown
  - Liturgical color accents
  - Year progress bar
- **Random Day**: Explore any reflection
- **Go to Date**: Pick a specific date
- **View Sources**: Show attribution (also press `i`)

### Keyboard Shortcuts
- **← →** : Navigate days
- **i** : Show/hide sources
- **Esc** : Close modals/menus

## 📁 File Structure

```
catholic-daily-reflection/
├── index.html              # Main page
├── style.css               # Styling
├── script.js               # Logic & PWA functionality
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline
├── icon-192.png            # PWA icon (192x192)
├── icon-512.png            # PWA icon (512x512)
├── icon-generator.html     # Tool to create icons
├── data/
│   ├── entries.json        # Your content (you manage this)
│   └── liturgical-calendar.json  # Liturgical info (provided)
├── .nojekyll               # Tells GitHub Pages to serve all files
├── build-scripts/          # (Optional) Automated content fetching
└── README.md
```

## 🎨 Customization

### Display Settings

All settings persist in `localStorage`:

- **Theme**: Light or dark mode
- **Feast Countdown**: Show days until Easter/Christmas
- **Liturgical Colors**: Border accent matching liturgical season
- **Year Progress**: Thin bar showing progress through the year

Access via hamburger menu (top-left).

### Content Structure

Each date entry in `data/entries.json` supports:

| Field | Required | Description |
|-------|----------|-------------|
| `verse.text` | Yes | Scripture text |
| `verse.source` | Yes | Book Chapter:Verse, Translation |
| `saint.text` | Yes | Quote from saint |
| `saint.source` | Yes | Saint's name |
| `saint.work` | No | Title of work quoted from (auto-displayed if present) |
| `question` | Yes | Reflection question |
| `questionSource` | No | Attribution for question |

**Note**: You do NOT need to add `liturgicalDay` or `liturgicalColor` fields. These are automatically determined from the separate `liturgical-calendar.json` file.

### Liturgical Calendar

The `data/liturgical-calendar.json` file includes:

**Fixed Feasts**: All major feasts on fixed dates
- Solemnities: Christmas, Immaculate Conception, etc.
- Feasts: Sts. Peter & Paul, Transfiguration, etc.
- Memorials: St. Augustine, St. Francis, etc.

**Movable Feasts**: Automatically calculated each year
- Easter Sunday (via Computus algorithm)
- Ash Wednesday, Holy Week, Pentecost
- Corpus Christi, Sacred Heart, Christ the King
- All dates relative to Easter

**Liturgical Seasons**: Colors applied automatically
- **Advent**: Violet (4 weeks before Christmas)
  - Rose on Gaudete Sunday (3rd Sunday)
- **Christmas**: White (Dec 25 - Baptism of the Lord)
- **Lent**: Violet (Ash Wed - Holy Saturday)
  - Rose on Laetare Sunday (4th Sunday)
- **Easter**: White (Easter - Pentecost, 50 days)
- **Ordinary Time**: Green (default, all other times)

**Liturgical Color Rules** (automatically applied):
1. Highest-ranking observance determines the color
2. Feasts/solemnities override seasonal colors
3. Green is used when no special observance applies
4. Rose appears only on Gaudete & Laetare Sundays
5. Red for martyrs, Passion events, and Pentecost
6. Violet for Black (All Souls) when traditional usage applies

## 🔧 Technical Details

### PWA Features

- **Installable**: Add to home screen on any device
- **Offline-first**: Service worker caches all assets
- **Fast loading**: All content pre-loaded
- **App-like experience**: Standalone display mode

### Browser Support

- Modern browsers (2024+)
- ES6+ JavaScript
- CSS Custom Properties
- Service Workers
- LocalStorage

### Performance

- **Initial load**: ~50KB (uncompressed)
- **No external requests** at runtime
- **Instant navigation** after first load
- **Offline-capable** after initial cache

## 📝 Content Guidelines

### Your Entries File (`data/entries.json`)

You manage this file to add daily content. The liturgical information is handled separately.

**Minimum required fields**:
```json
{
  "12-25": {
    "verse": {
      "text": "And the Word was made flesh...",
      "source": "John 1:14, Douay-Rheims"
    },
    "saint": {
      "text": "O Christian, remember your dignity...",
      "source": "St. Leo the Great",
      "work": "Sermon on the Nativity"
    },
    "question": "How does Christ dwelling among us transform you?"
  }
}
```

The `saint.work` field is optional but will be displayed automatically if you include it.

## ⚠️ Copyright & Legal

**Your responsibility as site owner:**
- Ensure all content is properly licensed
- Use public domain sources when possible
- Obtain permissions for copyrighted material
- Provide accurate attributions

**Default public domain sources:**
- Douay-Rheims Bible (public domain)
- Church Fathers texts (public domain)
- Classic saint writings (public domain)

For modern translations or recent saint quotes, **you must obtain proper licensing**.

## 🐛 Troubleshooting

### Site not loading content
1. Check that `data/entries.json` exists and is valid JSON
2. Verify GitHub Pages is enabled
3. Wait 2-3 minutes after pushing changes
4. Try hard refresh (Ctrl+Shift+R)

### PWA not installing
1. Ensure both `icon-192.png` and `icon-512.png` exist in root
2. Check `manifest.json` paths are correct
3. Visit site via HTTPS (GitHub Pages does this automatically)
4. Try in Chrome/Edge (best PWA support)

### Icons not showing
1. Generate icons using `icon-generator.html`
2. Upload to repository root
3. Commit and push
4. Clear cache and reload

### Liturgical colors not appearing
1. Check `liturgicalColor` field in your JSON
2. Toggle "Show Liturgical Color" in menu
3. Verify color name spelling (lowercase)

### Service worker errors
1. Check browser console for errors
2. Unregister old service workers (DevTools → Application → Service Workers)
3. Clear site data and reload

## 🤝 Contributing

Contributions welcome! Please:
- Maintain minimal design aesthetic
- Test PWA functionality
- Document new features
- Follow existing code style
- Respect copyright in content

## 📄 License

**Code**: MIT License

**Content**: Varies by source (see Copyright section)

**Your responsibility**: Ensure all deployed content is properly licensed.

## 🔗 Resources

- [Catholic Liturgical Calendar](https://www.usccb.org/prayer-and-worship/liturgical-year-and-calendar)
- [USCCB Daily Readings](https://bible.usccb.org/)
- [New Advent - Church Fathers](https://www.newadvent.org/fathers/)
- [Vatican Website](https://www.vatican.va/)

## 📞 Support

- **Issues**: Use GitHub Issues
- **Questions**: Start a Discussion
- **Liturgical questions**: Consult your diocese or parish

---

*An open-source Catholic reflection app. Site owners are solely responsible for content licensing and copyright compliance.*
