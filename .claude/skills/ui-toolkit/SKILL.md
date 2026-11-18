---
name: ui-toolkit
description: Use when building, redesigning or polishing a UI, adding animations, motion or screen transitions, improving navigation, adding 3D, or when the user asks which UI skills, plugins or MCP servers to install or use (Jetpack Compose, Compose Desktop, web/React, hackathon demos).
---

# UI Toolkit

Curated catalog of third-party skills, plugins and MCP servers for better UI. Researched 2026-10-15. Pick by stack, install only what the task needs.

## Rules

- Ask the user before installing anything. Say what and where (user-level `~/.claude/skills` or project `.claude/skills`).
- Everything except `frontend-design` is community-made: read its SKILL.md before installing and tell the user if it runs scripts.
- Star/install counts differ by source; check GitHub directly if popularity matters.
- Before installing, check whether it is already present (`/plugin`, `~/.claude/skills`, project `.claude/skills`).
- Always close the loop: look at the rendered result (screenshot or recording) before calling UI work done.

## Stack presets

- **Android Compose:** Material 3 skill + compose-motion + Chris Banes skills + adb screenshots / Roborazzi.
- **Compose Desktop:** Material 3 skill + Chris Banes `compose-focus-navigation` (keyboard focus).
- **Flutter:** `flutter-ui` skill (motion, effects, swappable themes, verification) + Material 3 skill (Flutter section) + official `dart-flutter` plugin (`claude plugin marketplace add flutter/agent-plugins`, `claude plugin install dart-flutter@dart-flutter`; 25 skills + Dart MCP server).
- **Web / hackathon demo:** frontend-design + Impeccable + one animation skill + Playwright MCP or Claude in Chrome; add Three.js package only if 3D is needed.

## Catalog

### Visual design (base layer)
- **frontend-design** (official Anthropic) — anti-generic typography, color, motion, composition. Auto-loads on UI tasks.
  `/plugin marketplace add anthropics/claude-code` then `/plugin install frontend-design@claude-code-plugins` (if that fails: `@claude-plugins-official`)
- **Impeccable** (`pbakaus/impeccable`) — 20+ commands (craft, critique, audit, polish, animate, colorize, typeset), 27 anti-pattern rules. Web.
  `npx skills add https://github.com/pbakaus/impeccable --skill impeccable`
- **UI UX Pro Max** (`nextlevelbuilder/ui-ux-pro-max-skill`) — catalog: 67 styles, 161 palettes, 57 font pairings, 99 UX guidelines, 15 stacks. Use when no style direction yet.
  `npm install -g uipro-cli && uipro init --ai claude`
- **Taste Skill** (`leonxlnx`) — design skill with adjustable parameters.
- **Vercel web-design-guidelines** — web UI rules.

### Compose / Material 3
- **material-3-skill** (`hamen/material-3-skill`) — Compose M3 tokens, components, adaptive layouts; audit mode scores app 0–10 in 10 categories.
- **android-skills** (`albermonte`) — M3 Expressive review, token lookups.

### Animation
- Compose: **compose-motion** (genjutsu) — `animate*AsState`, `AnimatedVisibility`, `Crossfade`, `updateTransition`, `SharedTransitionLayout`, gestures; Compose 1.7+.
- Compose: **Chris Banes skills** — `compose-animations` (which animation API to pick).
- Web: Impeccable `animate` command — micro-interactions, 100–800ms timing, `prefers-reduced-motion`.
- Web: **web-animation-skills** (`iart-ai`) — GSAP timelines, ScrollTrigger, SplitText, Flip, Lenis. `npx skills add iart-ai/web-animation-skills`
- Web: **motion-framer** (`freshtechbro/claudedesignskills`) — variants, gestures, layout animations, `AnimatePresence`, springs. `npx skills add freshtechbro/claudedesignskills --skill motion-framer`
- Web: **awwwards-animations** (`devmartinese`) — GSAP + Framer Motion + Lenis + Anime.js with React cleanup.

### Navigation
- Compose shared-element navigation: no dedicated skill. Wrap `NavHost` in `SharedTransitionLayout`, use `Modifier.sharedElement()` (experimental API). Docs: https://developer.android.com/develop/ui/compose/animation/shared-elements
- Chris Banes `compose-focus-navigation` — focus / D-pad / keyboard.
- Decompose skill — KMP navigation (stack, slot, pages, panels); only if project uses Decompose.

### 3D
- Web: **Three.js-Claude-Skill-Package** (`OpenAEC-Foundation`) — 24 skills: Three.js r160+, React Three Fiber, Drei, WebGPU, physics. Clone into `.claude/skills/threejs`.
- Web (lighter): TerminalSkills `react-three-fiber` / `threejs`.
- Android: no skill; use SceneView library (Filament, Compose API) from its docs.
- Compose Desktop: no ready option; custom renderer (LWJGL/Skiko) is heavy.

### See the result (verification)
- Web: Playwright MCP `claude mcp add playwright -- npx @playwright/mcp@latest`, or Claude in Chrome. Check multiple viewports.
- Android: `adb exec-out screencap -p > shot.png`; screenshot tests with Roborazzi or Paparazzi for before/after.
- Motion can't be judged from one screenshot: record video/GIF (`adb shell screenrecord`, gif_creator).

### Components (web/React)
- **shadcn MCP** `pnpm dlx shadcn@latest mcp init --client claude` — browse/install components by natural language.
