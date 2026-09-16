# George-2 — Project Rules & Guidelines

## 1. Project Overview & Identity
- **Product**: "George" — An editorial publication featuring short, honest Christian essays on faith, work, family, doubt, joy, and the ordinary life.
- **Motto / Tone**: *"Thoughts worth a minute. Truth worth a lifetime."* Contemplative, intellectually honest, warm, literary, and distraction-free.
- **Design Aesthetic**: Premium editorial publication (reminiscent of high-end journals like The Atlantic, NYT Magazine, or Substack reader experience, with modern touches).

## 2. Tech Stack & Architecture
- **Core**: Semantic HTML5, Vanilla CSS (`styles.css`), Vanilla JavaScript (`main.js`).
- **Typography (Google Fonts)**:
  - Body & Literary Headings: `Newsreader` (Editorial serif)
  - Interface & Meta: `Manrope` (Clean geometric sans)
  - Timestamps, Tags & Metrics: `DM Mono` (Monospaced accents)
- **External Libraries**:
  - Iconify (`iconify-icon`) for lightweight vector icons
  - GSAP for restrained, smooth micro-interactions and reveals
- **Framework Constraint**: No heavy frameworks (React, Vue) or CSS utility frameworks (Tailwind) unless explicitly instructed. Keep it fast, lean, and standard-compliant.

## 3. Agent Operating Authority & Autonomy
- **Full Change Authorization**: The agent is explicitly granted authority by the project owner to make any changes necessary to accomplish user requests—including creating, editing, refactoring, or optimizing HTML, CSS, JavaScript, and asset structures.
- **End-to-End Delivery**: Do not leave TODOs, stubbed functions, or incomplete mockups. Provide working, production-grade implementations.
- **Independent Problem-Solving**: When encountering bugs, layout flaws, or missing assets, diagnose root causes and resolve them autonomously.

## 4. Code & Styling Standards
- **Design Tokens**: Always utilize and extend CSS custom properties in `styles.css` (e.g., `--color-canvas`, `--color-ink`, `--space-*`, `--radius-*`, `--font-*`). Avoid hardcoded magic numbers or rogue colors.
- **Typography & Readability**:
  - Maintain optimal line-length for editorial content (`max-width: 65ch` to `70ch`).
  - Preserve hierarchy: one `<h1>` per page, semantic `<h2>` through `<h4>`.
  - Maintain comfortable reading line-heights (`1.6`–`1.8` for serif prose).
- **Responsive Design**:
  - Mobile-first approach; test viewport widths from 320px up to 1440px+.
  - Touch targets must be at least 44x44px on mobile viewports.
  - Zero unintended horizontal scrollbars (`overflow-x: hidden` where appropriate).
- **Motion & Interactions**:
  - Always respect `prefers-reduced-motion`.
  - Transitions should feel subtle, physical, and restrained (150ms–300ms easing), never jarring or gimmicky.

## 5. Accessibility (a11y) & SEO Requirements
- **WCAG AA Compliance**: Ensure high contrast for text over backgrounds (minimum 4.5:1 for body text, 3:1 for large headings).
- **Keyboard Navigation**: Ensure all interactive elements have visible `:focus-visible` outlines and support keyboard actuation (`Enter`, `Space`, `Escape`).
- **Semantic Structure**: Proper usage of `<header>`, `<nav>`, `<main>`, `<article>`, `<aside>`, and `<footer>`.
- **SEO Essentials**: Every HTML file must include unique `<title>`, `<meta name="description">`, Open Graph tags where applicable, and clean heading hierarchy.
