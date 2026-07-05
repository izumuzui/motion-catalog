# Motion Catalog

**A searchable vocabulary of UI motion.** 500 animation patterns across 20 categories — each with a name, a live CSS preview, real timing specs, a ready-to-paste request prompt, and one-click copyable CSS. 271 original patterns, plus the complete vocabularies of Animate.css, Hover.css, SpinKit, and CSShake under their official class names.

![motions](https://img.shields.io/badge/motions-500-ff4f18) ![categories](https://img.shields.io/badge/categories-20-1c1815) ![runtime deps](https://img.shields.io/badge/runtime%20deps-0-6f675e) ![license](https://img.shields.io/badge/license-MIT-2563eb)

<img width="2815" height="1431" alt="image" src="https://github.com/user-attachments/assets/7b621ec4-2d0b-421c-8682-9c370fd65ff4" />

## Why

"Make it feel smoother" is not a spec. Designers, developers, and AI coding tools all work better with a shared, precise motion vocabulary — *"use a spring-in entrance"*, *"add a destructive-step confirm"*, *"stagger the list items"*.

Motion Catalog gives every common UI motion a name you can point at.

## What each card gives you

| | |
| --- | --- |
| **Live preview** | Pure HTML/CSS animation, replayable per card, on a spec-sheet stage |
| **Timing spec** | Real `duration · easing · iterations`, read from the running animation |
| **Use cases** | Where the pattern fits (buttons, toasts, lists, charts…) |
| **Request prompt** | A one-line instruction (Japanese) to hand to a designer or an AI tool — click to copy |
| **Copy CSS** | Extracts the actual class rule + `@keyframes` from the stylesheet to your clipboard |

## Features

- **Search** — instant filtering by name, Japanese name, use case, or class name, with `/` or `⌘K` to focus, and shareable URLs (`?q=…&target=…&cat=…`)
- **Two-axis filtering** — by target component (button, form, overlay, toast…) and by motion type (Entrance, Exit, Feedback, Loading…)
- **Contextual previews** — generic motions re-render on the component you selected (pick *Button* and entrances animate a button, not an abstract box)
- **Playback speed** — inspect any motion at 0.5× / 1× / 2×
- **Light & dark themes** — follows `prefers-color-scheme`, one-click toggle
- **Reduced motion** — respects `prefers-reduced-motion`, with an explicit opt-in override
- **Performance** — off-screen previews are paused via `IntersectionObserver`

## Getting started

It's a fully static site — no build step, no framework, no runtime JavaScript dependencies (the vendored CSS libraries are plain stylesheets).

```sh
git clone https://github.com/izumuzui/motion-catalog.git
cd motion-catalog
python3 -m http.server 4177   # or any static server
# open http://localhost:4177/
```

Or just open `index.html` in a browser.

## Categories

Entrance · Exit · Emphasis · Feedback · Loading · Navigation · List · Layout · Gesture · Reveal · Scroll · Text · Button · Input · Cursor · Menu · Media · Data · Visual · Hover

## What's inside

| Source | Patterns | Notes |
| --- | --- | --- |
| **Original** | 271 | Component-level motions: buttons, inputs, lists, charts, loaders, navigation, text, visual effects |
| [Animate.css](https://animate.style/) v4.1.1 | 97 | The classic entrance / exit / attention set, under official `animate__*` class names |
| [Hover.css](https://ianlunn.github.io/Hover/) v2.3.2 | 110 | Hover transitions (`hvr-*`), auto-played in previews |
| [SpinKit](https://tobiasahlin.com/spinkit/) v2.0.1 | 12 | Loading spinners (`sk-*`) |
| [CSShake](https://elrumordelaluz.github.io/csshake/) v1.7.0 | 10 | Shake variants (`shake-*`) |

Vendored libraries live in [`vendor/`](vendor/) unmodified except a marked preview-autoplay shim in `hover.css`; all are MIT licensed by their respective authors.

## Project layout

```
index.html   structure and markup
styles.css   design system + original motion previews and keyframes
app.js       data, rendering, search, filtering, CSS extraction
vendor/      Animate.css, Hover.css, SpinKit, CSShake (MIT)
```

## Contributing

New motions are welcome! A motion is one data row in `app.js` plus a preview shape / keyframes in `styles.css`:

1. Add a row to `motions` in `app.js`: `[name, jpName, category, useFor, request, className, previewType]`
2. Add `.your-class { animation: … }` (and `@keyframes`) to `styles.css` — reuse an existing preview type where possible
3. Open `index.html` and confirm the card renders, animates, and its CSS copies cleanly

Bug reports and ideas via [issues](https://github.com/izumuzui/motion-catalog/issues).

## License

[MIT](LICENSE)

---

## 日本語

**UIモーションの語彙集。** 500種類の動きに「名前・用途・指示文・ライブプレビュー・コピーできるCSS」を付けたカタログです。オリジナル271種に加え、Animate.css / Hover.css / SpinKit / CSShake の全パターンを公式クラス名のまま収録しています。

「なめらかにして」ではなく「**スプリングインで出して**」「**削除は破壊的ステップにして**」と、正確な語彙で依頼できるようにします。デザイナーへの依頼にも、AIコーディングツールへの指示にもそのまま使えます。

- カードの**指示文をクリック**するとコピーできます
- **`.class` ボタン**で実際のCSS(クラス+キーフレーム)をコピーできます
- 検索は `/` キーでフォーカス。絞り込み状態はURLに反映されるので共有できます
- 再生速度切替(0.5×/1×/2×)、ライト/ダークテーマ、`prefers-reduced-motion` 対応
