# Ink Bloom Loading Transition Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current logo+progress-bar loader with a cinematic "Ink Bloom" loading transition — no text, warm amber glow bloom, logo materializes from blur, golden halo ring pulses, steam wisps drift upward.

**Architecture:** All animation is pure CSS keyframes in `src/styles/index.css`. The `LogoLoader.jsx` JSX structure changes to add bloom/halo/steam elements. No new deps.

**Tech Stack:** React JSX, CSS keyframe animations, Tailwind for layout/spacing.

---

### Task 1: Replace CSS animations

**Files:**
- Modify: `src/styles/index.css`

**Step 1: Replace all `.logo-loader-*` classes and `@keyframes` in `src/styles/index.css` with the following**

Remove everything from line 14 to end of file (the existing `.logo-loader-*` blocks and keyframes), then append:

```css
/* ─── Ink Bloom Loader ─────────────────────────────────────────── */

.logo-loader-bloom {
  position: absolute;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(210, 140, 50, 0.55) 0%,
    rgba(180, 90, 20, 0.25) 40%,
    transparent 70%
  );
  animation:
    bloom-in 1s cubic-bezier(0.22, 1, 0.36, 1) both,
    bloom-pulse 3s ease-in-out 1s infinite;
  pointer-events: none;
}

.logo-loader-halo {
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  border: 1.5px solid rgba(210, 155, 60, 0.65);
  animation: halo-pulse 2.6s ease-out 0.9s infinite;
  pointer-events: none;
}

.logo-loader-logo-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-loader-logotype {
  animation: logo-enter 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
}

.logo-loader-steam {
  position: absolute;
  bottom: 100%;
  width: 3px;
  border-radius: 9999px;
  background: linear-gradient(to top, rgba(210, 160, 70, 0.65), transparent);
  opacity: 0;
  pointer-events: none;
}

.logo-loader-steam-1 {
  height: 28px;
  left: calc(50% - 18px);
  animation: steam-rise 2.8s ease-in-out 0.6s infinite;
}

.logo-loader-steam-2 {
  height: 36px;
  left: 50%;
  transform: translateX(-50%);
  animation: steam-rise 2.8s ease-in-out 1.4s infinite;
}

.logo-loader-steam-3 {
  height: 24px;
  left: calc(50% + 15px);
  animation: steam-rise 2.8s ease-in-out 2.2s infinite;
}

/* ─── Keyframes ────────────────────────────────────────────────── */

@keyframes bloom-in {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}

@keyframes bloom-pulse {
  0%, 100% { transform: scale(1);    opacity: 0.85; }
  50%       { transform: scale(1.1); opacity: 1; }
}

@keyframes logo-enter {
  from { opacity: 0; filter: blur(18px) drop-shadow(0 8px 24px rgba(0,0,0,0.5)); transform: scale(0.82); }
  to   { opacity: 1; filter: blur(0)   drop-shadow(0 8px 24px rgba(0,0,0,0.5)); transform: scale(1); }
}

@keyframes halo-pulse {
  0%   { transform: scale(0.88); opacity: 0.75; }
  100% { transform: scale(1.5);  opacity: 0; }
}

@keyframes steam-rise {
  0%   { transform: translateY(0)    translateX(0)   scaleX(1);   opacity: 0; }
  15%  { opacity: 0.7; }
  50%  { transform: translateY(-28px) translateX(5px)  scaleX(0.7); opacity: 0.45; }
  100% { transform: translateY(-58px) translateX(-4px) scaleX(0.2); opacity: 0; }
}
```

**Step 2: Verify no old `logo-loader-*` selectors remain**

Run: `grep -n "logo-loader-shimmer\|logo-loader-bar\|logo-logotype-pulse\|logo-shimmer\|logo-bar-progress" src/styles/index.css`
Expected: no output

**Step 3: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: add ink bloom loader CSS animations"
```

---

### Task 2: Restructure LogoLoader JSX

**Files:**
- Modify: `src/components/LogoLoader.jsx`

**Step 1: Replace the entire file content with:**

```jsx
import React from 'react';
import clsx from 'clsx';
import AppImage from './AppImage';

const sizeConfig = {
  sm: { logo: 'h-10 w-auto' },
  md: { logo: 'h-14 w-auto' },
  lg: { logo: 'h-20 w-auto' },
};

const LogoLoader = ({ fullscreen = false, size = 'md', label, className = '' }) => {
  const config = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div
      className="relative flex flex-col items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      {/* Glow bloom behind logo */}
      <div className="logo-loader-bloom" />

      {/* Logo + halo ring */}
      <div className="logo-loader-logo-wrap">
        <div className="logo-loader-halo" />
        <AppImage
          src="/BENEDICT_CAFE_LOGOTYPE_page-0001-removebg-preview.png"
          alt="Benedict Café"
          className={clsx(config.logo, 'object-contain logo-loader-logotype')}
        />

        {/* Steam wisps — positioned above logo */}
        <div className="logo-loader-steam logo-loader-steam-1" />
        <div className="logo-loader-steam logo-loader-steam-2" />
        <div className="logo-loader-steam logo-loader-steam-3" />
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className={clsx(
          'fixed inset-0 z-40 flex items-center justify-center',
          'bg-[#140e07]',
          className
        )}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={clsx('inline-flex items-center justify-center', className)}>
      {content}
    </div>
  );
};

export default LogoLoader;
```

**Step 2: Remove the `label` prop from TestHome usage**

In `src/pages/test/TestHome.jsx`, change:
```jsx
<LogoLoader
  fullscreen
  label="Brewing your Benedict experience..."
/>
```
to:
```jsx
<LogoLoader fullscreen />
```

**Step 3: Commit**

```bash
git add src/components/LogoLoader.jsx src/pages/test/TestHome.jsx
git commit -m "feat: ink bloom loader — cinematic logo entrance with glow + steam"
```

---

### Task 3: Visual QA in browser

**Step 1: Start dev server**

```bash
npm run dev
```
(or `bun run dev` — check `package.json` for the exact script)

**Step 2: Navigate to the test route**

Open: `http://localhost:<port>/test` (check `src/router` or `src/App.jsx` for the exact test route path)

**Step 3: Verify visually**
- [ ] Background is warm near-black espresso (not grey/transparent)
- [ ] Logo starts blurry/small and materializes into focus
- [ ] Amber glow bloom appears behind logo
- [ ] Golden halo ring pulses outward and fades
- [ ] 2-3 steam wisps drift upward above the logo, staggered
- [ ] No text visible anywhere in the loader
- [ ] Hard-reload a few times to see the entrance animation fresh

**Step 4: If anything looks off**, adjust timing/color values in `src/styles/index.css` — the keyframes and opacity values are the main levers.
