# Motion Catalog

A searchable UI motion vocabulary reference — 186 patterns across 19 categories, each with a name, use case, and ready-to-use prompt for designers, developers, and AI tools.

![Static Badge](https://img.shields.io/badge/motions-186-6366f1) ![Static Badge](https://img.shields.io/badge/categories-19-64748b) ![Static Badge](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-0f172a)

## Overview

Stop saying "make it feel smooth" and start using precise motion vocabulary.

Each card in the catalog shows:
- **Live preview** — the animation plays in-browser
- **Use cases** — where to apply the pattern
- **Request text** — copy a ready-made prompt to use with designers or AI

## Getting started

The catalog is a pure static site. Open `index.html` directly in a browser, or run a local server:

```sh
python3 -m http.server 4177 --bind 127.0.0.1
# then open http://127.0.0.1:4177/
```

## Features

- **Search** — filter by name, Japanese name, or use case
- **Category filters** — narrow down by motion type
- **Replay All** — re-trigger every animation at once
- **Copy prompt** — click the request text to copy it to clipboard
- **Reduced motion** — respects `prefers-reduced-motion` with opt-in override

## Categories

| Category | Description |
| --- | --- |
| Entrance | How elements appear |
| Exit | How elements disappear |
| Emphasis | Attract attention / show state |
| Feedback | Respond to user actions |
| Loading | Communicate waiting / progress |
| Navigation | Screen transitions and menus |
| List | Insert, remove, reorder |
| Layout | Expand, flip, morph |
| Gesture | Swipe, drag, long press |
| Reveal | Clip-path and mask reveals |
| Scroll | Scroll-linked animations |
| Text | Type, count, word-by-word |
| Input | Focus, float label, validation |
| Button | Press, hold, confirm |
| Cursor / Menu | Cursor follow, menu open |
| Media | Image, video, carousel |
| Data | Charts, counters, dashboard |
| Visual | Glitch, scan, glass effects |

## Stack

No build step. No framework. No runtime dependencies.

- `index.html` — structure and markup
- `styles.css` — design system + all 186 animation keyframes
- `app.js` — data, rendering, search, filtering, and interaction logic
