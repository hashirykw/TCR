# The Classroom — website

Front end for The Classroom (TCR), Cambridge O Level, AS & A2 academy, Plot C-22, Block I, North Nazimabad, Karachi.

Static HTML/CSS/JS, no build step. Every asset is a local file in this repo (fonts, scripts, images), so nothing loads from a third-party CDN.

## Structure

```
index.html              page markup, SEO meta, schema.org data
assets/css/style.css    design tokens + all styles
assets/js/data.js       syllabus library, timetable, June 2026 thresholds  ← edit content here
assets/js/main.js       interactions (smooth scroll, explorer, timetable, scroll scenes)
assets/js/vendor/       Lenis 1.3, GSAP 3.15 + ScrollTrigger
assets/fonts/           Fraunces, Hanken Grotesk, JetBrains Mono (variable woff2)
assets/img/             crest, favicons, Nexlyr mark
vercel.json             long-term caching for /assets
```

## Preloader

The crest intro (grade reel E → A*, double curtain) plays **once per browser session**, skips for reduced-motion users and on click or keypress, and has a CSS failsafe that hides it after 5 s if scripts fail. To replay it, clear `sessionStorage['tcr-intro']`.

## Updating content

- **Timetable:** `TCR.timetable` in `assets/js/data.js`. Day keys: `MW`, `TT`, `FS`, `SS`, `ON`.
- **Syllabus:** `TCR.syllabus`. Add `isNew:true` to show the NEW 2027 badge.
- **Faculty photos:** cards use monograms until real photos are added.

## Deploy

Push to GitHub, import into Vercel, no settings needed.

---
Designed & built by [Nexlyr Solutions](https://nexlyr.solutions).
