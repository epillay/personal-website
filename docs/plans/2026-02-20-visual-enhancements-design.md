# Visual Enhancements Design — 2026-02-20

## Summary

Add moderate motion to the v3 personal website: staggered slide-in content animations triggered by IntersectionObserver, plus organic SVG blob shapes that slowly drift and morph in the background of each slide.

## Approach

**Option B — IntersectionObserver + inline SVG blobs**

No new runtime dependencies. Uses IntersectionObserver to trigger CSS class-based animations, and inline SVG paths for organic background shapes animated via CSS keyframes.

## 1. Slide-in Content Animations

### Trigger
- `IntersectionObserver` on each `<section>` slide, threshold `0.3`
- When intersecting, add `is-visible` CSS class to the slide
- Animations play once and stay (one-shot, not re-triggered on scroll back)
  - _Note: may revisit to support re-triggering in a future iteration_

### Animation
- Elements start at `opacity: 0, transform: translateY(16px)`
- Transition to natural position on `is-visible`
- Duration: `0.55s`, easing: `ease-out`

### Stagger (animation-delay per element)
| Element | Delay |
|---|---|
| AccentBar | 0ms — animates `width` from 0 to 44px (draw-in) |
| Category label | 80ms — fade + translate up |
| BigText / HeroName | 160ms — fade + translate up |
| Body text | 260ms — fade + translate up |
| Hobby list items | 260ms, 310ms, 360ms, 410ms, 460ms |

### Implementation notes
- Each styled component gets a CSS transition gated on the parent slide's `.is-visible` class
- Use `useRef` array for slide refs, one observer instance observing all slides
- Hero slide (index 0) fires immediately on mount (already in view)

## 2. Organic Background Blobs

### Structure
- 2–3 SVG blobs per slide, rendered as inline React components
- Positioned `absolute`, `z-index: -1`, `pointer-events: none`
- Overflow hidden on the `<Slide>` container

### Shape
- Free-form SVG `<path>` elements using cubic bezier curves
- Irregular, asymmetric — looks like ink drops or soft pebbles
- Unique blob layout per slide (varied positions and sizes)

### Color
- Most slides: terracotta `#C4503A` at 5–8% opacity
- Vienna slide: ochre `#B8913C` at 5–8% opacity (matches yellow accent)
- Hero slide: slightly higher opacity (~10%) since content is sparse

### Motion
- Three slow looping CSS keyframe animations:
  - **Morph**: SVG `d` path interpolation between 2–3 variants (~25s cycle)
  - **Drift**: slow `translate` movement (±20px, ~35s cycle)
  - **Breathe**: gentle `scale` pulse between 0.95 and 1.05 (~45s cycle)
- Each blob uses a different animation duration so they never sync
- All animations: `infinite`, `ease-in-out`, `alternate`

### Placement
- One large blob (300–400px) anchored to a corner, away from text
- One medium blob (150–200px) on the opposite side, mid-slide
- Optional third small accent blob for visual variety
- Never overlapping the main text column

## Files to Change

- `src/pages/index.js` — add IntersectionObserver logic, blob components, animation styles
- No new files required; blobs defined as styled/inline components in index.js
