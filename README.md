# The Classroom — website

Front end for The Classroom (TCR), Cambridge O Level, AS & A2 academy, Plot C-22, Block I, North Nazimabad, Karachi.

Static HTML/CSS/JS, no build step. Every asset is a local file in this repo (fonts, scripts, images), so nothing loads from a third-party CDN.

## Structure

```
index.html              page markup, SEO meta, schema.org data
assets/css/style.css    design tokens + all styles
assets/js/data.js       syllabus library, timetable, June 2026 thresholds  ← edit content here
assets/js/main.js       interactions (preloader, themes, explorer, booking, chat, scroll scenes)
assets/js/gl.js         WebGL crest particles
tools/bump.mjs          stamps ?v=<hash> on CSS/JS links (run after edits)
assets/js/vendor/       Lenis 1.3, GSAP 3.15 + ScrollTrigger
assets/fonts/           Fraunces, Hanken Grotesk, JetBrains Mono (variable woff2)
assets/img/             crest, favicons, Nexlyr mark
vercel.json             long-term caching for /assets
```

## Features

- **Preloader** in the Verzish / Sir Sohail style: CLASSROOM rises, fills crimson from below, then the camera dives through the L. Once per session; skips on click/keypress and for reduced-motion users. Replay by clearing `sessionStorage['tcr-seen']`.
- **Two themes**: Light (white & red, default) and Dark, toggled in the nav / menu and remembered in `localStorage['tcr-theme']`.
- **3D crest particles** (`assets/js/gl.js`): a hand-written WebGL point field (no three.js) that morphs between the crest's four quarters, atom, globe, open book and cap, around the hero crest, then drifts behind Programs, Syllabus and the Calendar.
- **Reserve a seat**: 3-step pop-up (level → subjects → details) that opens a prefilled WhatsApp message to the front desk. Every timetable row, faculty card and syllabus sheet can prefill it.
- **Ask TCR**: compact chat panel that answers instantly from `data.js` (subject timings, teacher classes, syllabus codes, A* thresholds, results dates, location, portal). Rule-based, no external AI.
- **Grade calculator** using Cambridge June 2026 thresholds, with a 3D flip grade card.
- **⌘K search** across sections, syllabus codes and teachers; `/` focuses the syllabus search.
- **Side admissions card** (slides in once, dismiss remembered for 3 days) and a results countdown bar.
- Mobile: full-width bottom action bar, small dropdown menu, bottom-sheet pop-ups.

## Caching (important)

CSS and JS are referenced as `style.css?v=<hash>`. **After editing any CSS or JS, run `node tools/bump.mjs`** before committing, so every visitor gets the new file immediately. `vercel.json` also makes CSS/JS revalidate on each visit as a safety net; fonts are cached for a year.

## Updating content

- **Timetable:** `TCR.timetable` in `assets/js/data.js`. Day keys: `MW`, `TT`, `FS`, `SS`, `ON`.
- **Syllabus:** `TCR.syllabus`. Add `isNew:true` to show the NEW 2027 badge.
- **Faculty photos:** cards use monograms until real photos are added.

## Deploy

Push to GitHub, import into Vercel, no settings needed.

---
Designed & built by [Nexlyr Solutions](https://nexlyr.solutions).
