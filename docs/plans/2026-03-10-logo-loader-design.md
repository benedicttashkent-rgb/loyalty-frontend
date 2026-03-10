## Logo Loader Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Provide a single, reusable loading animation built around the existing Benedict Café logo, with a subtle “coffee steam” vibe that can be used both as a fullscreen loader and as an inline loading indicator.

**Architecture:** Implement a `LogoLoader` React component that reuses the existing logo asset and adds CSS-based steam animations, with a `fullscreen` mode for route-level use and a default inline mode for embedding in sections or cards. Keep all animation logic encapsulated in the component with Tailwind-friendly utility classes and minimal custom CSS.

**Tech Stack:** React, existing `AppImage` / `BrandLogo` assets, TailwindCSS utility classes (and scoped CSS or inline `@keyframes` via a CSS file or global stylesheet).

---

### Task 1: Create `LogoLoader` component shell

**Files:**
- Create: `src/components/common/LogoLoader.jsx`

**Step 1: Create component file with basic props**

- Define a functional React component `LogoLoader` that accepts props:
  - `fullscreen = false`
  - `size = 'md'`
  - `label`
  - `className`
- Export it as default.

**Step 2: Add basic layout structure**

- Render a root `div` container with:
  - Flex column centering.
  - A logo wrapper.
  - A container above the logo for steam lines.
  - An optional label below.

**Step 3: Wire in existing logo**

- Import `AppImage` (same as used in `BrandLogo.jsx`) and render the logo image with appropriate `alt` text and size classes based on `size`.

---

### Task 2: Implement coffee steam animation

**Files:**
- Modify: `src/components/common/LogoLoader.jsx`
- Modify (if needed): global stylesheet where Tailwind/base CSS lives (e.g., `src/index.css` or `src/styles.css`)

**Step 1: Add steam line elements**

- Above the logo container, render 2–3 absolutely positioned `div`s representing steam lines.
- Give them unique class names (e.g., `logo-loader-steam-line`, `logo-loader-steam-line-1`, `logo-loader-steam-line-2`, etc.).

**Step 2: Define keyframe animations in CSS**

- In the global stylesheet, define:
  - A base `.logo-loader-steam-line` class for color, width, border radius, etc.
  - `@keyframes` for vertical drift, horizontal wiggle, and fade-out.
  - Per-line variations via additional classes (`logo-loader-steam-line-1`, etc.) to stagger animation delays/durations.

**Step 3: Connect CSS classes to React elements**

- Apply the steam line classes to the steam `div`s in `LogoLoader`.
- Verify the animation runs smoothly and loops infinitely.

---

### Task 3: Support fullscreen vs inline modes and sizes

**Files:**
- Modify: `src/components/common/LogoLoader.jsx`

**Step 1: Implement `size` handling**

- Map `size` values (`sm`, `md`, `lg`) to logo `className` size variants (e.g., `h-10`, `h-16`, `h-24`) and steam heights.
- Apply these classes via a simple mapping object inside the component.

**Step 2: Implement `fullscreen` layout**

- When `fullscreen` is `true`, wrap content in a container that:
  - Uses `fixed inset-0` or `min-h-screen` with centering.
  - Has a subtle background overlay (e.g., translucent dark or coffee tone).
  - Sets appropriate z-index so it appears above other content.

**Step 3: Implement inline layout**

- When `fullscreen` is `false`, render a simple inline-flex container that:
  - Aligns content centrally within the parent.
  - Accepts `className` to allow callers to adjust margins/positioning.

---

### Task 4: Accessibility and label text

**Files:**
- Modify: `src/components/common/LogoLoader.jsx`

**Step 1: Add ARIA attributes**

- Add `role="status"` and `aria-live="polite"` to the main container.
- If `label` is provided, ensure it is readable either as visible text below the logo or via `aria-label`.

**Step 2: Provide sensible default label**

- If no `label` is passed, either show a default visible “Loading…” text or omit text but retain the ARIA role.

---

### Task 5: Example usage and integration points

**Files:**
- Modify: a representative route or page component (e.g., `src/pages/HomeDashboard.jsx` or a route-level wrapper) to show example usage.

**Step 1: Add an example `LogoLoader` import and usage**

- Import `LogoLoader` and render it in a simple demo context (e.g., placeholder area or a mocked loading state) so it’s easy to see in the app.

**Step 2: Wire a `fullscreen` example**

- Add a minimal conditional block (or comment) demonstrating `<LogoLoader fullscreen label="Brewing your rewards…" />` for future route-level loaders.

---

### Task 6: Testing and polish

**Files:**
- As above; no dedicated test files assumed unless the project already uses component tests.

**Step 1: Run existing tests / lints**

- Run the project’s usual test/lint commands (e.g., `npm test`, `npm run lint`) to ensure no regressions or new lint errors.

**Step 2: Visual QA**

- Manually verify:
  - Steam animation looks smooth and not too distracting.
  - Fullscreen overlay centers correctly at various viewport sizes.
  - Inline variant works inside at least one page/section.

