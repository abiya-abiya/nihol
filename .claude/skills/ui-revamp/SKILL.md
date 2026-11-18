---
name: ui-revamp
description: Redesign an existing project's UI to a modern, beautiful, comfortable standard, with references, research and a mockup approved before any code change.
disable-model-invocation: true
---

# UI Revamp

Goal: make this existing project's UI as beautiful, modern and comfortable to use as possible, without breaking any existing functionality. Extra notes from the user: $ARGUMENTS

Follow these phases in order. Do not skip a phase and do not change project code before Phase 5 approval.

## Phase 1 — Understand (read-only)
- Load the `ui-toolkit` skill and use it throughout.
- Understand the product first: what the app is for, who uses it, the core user flows (the 2–3 things users do most), and which screens matter most. Use README, docs, store listing, strings and code. Write a short summary and confirm it with me in Phase 2.
- Explore the project: platform and stack (Compose, Compose Desktop, web, etc.), screens, navigation structure, theme/design tokens, shared components, localization, dark mode support.
- If the app can run, capture screenshots of the main screens (emulator via adb, or browser).

## Phase 2 — Ask me
Ask me these questions and wait for my answers:
1. Do you have references? (screenshots, Figma links, apps or websites you like, Dribbble/Mobbin shots, brand colors, logo, fonts)
2. Who are the users and what should the app feel like? (calm, playful, premium, minimal...)
3. Constraints: screens or features that must not change, light/dark mode, languages, minimum OS/browser versions, deadline.
If I have no references, say you will propose directions based on research.

## Phase 3 — Research (online allowed)
- Research the latest design styles and trends for this platform for the current year, plus the official guidelines (for example Material 3 Expressive, Apple HIG, current web design patterns).
- Look at 3–5 well-designed apps in the same category for patterns worth borrowing.
- Research modern motion patterns for this platform: shared element / container transforms, spring physics, predictive back, scroll-driven effects, micro-interactions, animated feedback on taps and state changes.
- Check whether 3D would genuinely help this app (product views, maps, data, onboarding, hero visuals). Note the fitting library from `ui-toolkit` and its cost (APK/bundle size, GPU, battery).
- Summarize briefly with source links.

## Phase 4 — Audit and direction
- Audit the current UI: visual hierarchy, spacing, typography, color and contrast, touch targets, navigation, empty/loading/error states, motion, accessibility.
- Propose 1–2 design directions: color palette (light and dark), typography scale, shapes/radius, spacing, iconography, navigation pattern.
- Motion plan: list each animation (where, trigger, type, duration/spring, easing) — screen transitions, shared elements, list item entry, button/press feedback, loading and success states. Purposeful, not decorative.
- 3D: propose it only where it adds real value, as an optional item I can accept or decline, with a fallback for low-end devices. If 3D adds nothing, say so.
- Prioritize by purpose: tie every proposed change to a user goal or core flow. Rank them as Must / Should / Optional / Skip, by user impact vs effort, with a one-line reason each. Explicitly skip trends, animations or 3D that would distract from the app's purpose (for example, heavy effects in a study or focus app). Core flows get the most polish.
- Recommend which tools from `ui-toolkit` to install for this project (ask before installing).

## Phase 5 — Mockup and approval (gate)
- Present a Figma-style mockup of the key screens before touching code:
  - If a Figma MCP/connector is available, create the frames there.
  - Otherwise create a visual design artifact (Artifact tool, quickstart intent "design"), or an HTML mockup page if that type is unavailable.
- Show: before vs after for main screens, light and dark, the component set, and navigation flow.
- Make the mockup interactive enough to preview motion: animated transitions between key screens and the main micro-interactions (HTML/CSS or a design prototype), so I approve the motion, not just static frames.
- If 3D is proposed, include a small live 3D preview (for example Three.js in the mockup) or a reference video.
- Wait for my explicit approval. Iterate on my feedback. Start implementation only after I say "approved".

## Phase 6 — Implement
- Estimate the size and recommend inline / subagents / coordinator per my global rules; wait for my choice.
- Implement in priority order: Must items first, then Should; Optional only if I approved them.
- Work on a new branch. Build design tokens/theme first, then shared components, then screens.
- Keep all existing functionality, strings and localization intact.
- After each batch, screenshot the real app and compare it with the approved mockup; fix differences.
- For animations, record the screen (`adb shell screenrecord` or a browser GIF) and check them frame by frame against the approved motion plan; check for jank on a mid-range device or emulator.
- Group the work into as few PRs as practical; open a PR only when I ask.

## Quality bar ("comfortable UI")
- Readable: clear hierarchy, comfortable font sizes and line heights.
- Accessible: WCAG AA contrast, touch targets at least 48dp/44pt, content descriptions, respects reduced-motion and font scaling.
- Consistent: one token system for color, type, spacing, shape; no one-off values.
- Smooth: modern, meaningful animations and screen transitions (springs, shared elements), 60fps, no janky layouts, honors reduced-motion settings.
- 3D (if used): lazy-loaded, has a 2D fallback, does not slow startup or drain battery.
- Complete: designed empty, loading and error states.
