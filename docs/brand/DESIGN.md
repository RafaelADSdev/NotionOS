---
name: Nexo brand overlay
description: Violet, black and white identity for a local notes and whiteboard workspace.
colors:
  violet: "#7c3aed"
  violet-deep: "#6d28d9"
  lilac-emphasis: "#b69aff"
  white: "#ffffff"
  light-text: "#17151c"
  light-secondary-text: "#625d6b"
  light-secondary-surface: "#f7f7fa"
  light-tertiary-surface: "#efedf4"
  light-border: "#e5e1eb"
  light-active-background: "#ede5fc"
  light-active-foreground: "#5b21b6"
  black: "#0c0c0f"
  dark-text: "#fafafa"
  dark-secondary-text: "#b6b1c0"
  dark-secondary-surface: "#141418"
  dark-tertiary-surface: "#1d1b23"
  dark-overlay-surface: "#19171f"
  dark-sidebar: "#08080a"
  dark-border: "#2b2832"
  dark-active-background: "#2a1a44"
  dark-active-foreground: "#d3bfff"
components:
  primary-action:
    backgroundColor: "{colors.violet}"
    textColor: "{colors.white}"
  primary-action-hover:
    backgroundColor: "{colors.violet-deep}"
    textColor: "{colors.white}"
---

# Design System: Nexo brand overlay

## Overview

**Creative North Star: "Continuous connection"**

Nexo's folded N and custom lowercase vector wordmark identify a workspace for connected notes and whiteboards. Violet accents sit against black and white application surfaces. This document records the shipped brand overlay; AFFiNE remains the authority for layout, application fonts, editor formatting, component geometry and interactions.

The product is local-only: retain local notes, whiteboards and browser import/export; omit AI, accounts, cloud synchronization, online sharing, collaboration and subscription controls. Telemetry transport is disabled. Source evidence is the Nexo theme stylesheet, shared `BrandLogo`, theme provider, sidebar and new-page action styles, and web manifest. Brand studies do not replace application layouts.

**Key Characteristics:**
- A filled folded N with white uprights and a lilac diagonal on a black tile.
- Violet primary actions, paired light/dark semantic colors and white action text.
- Existing application density, editor appearance and interactions.

## Colors

Violet supplies action and selection emphasis; neutral black and white surfaces carry the workspace.

### Primary
- **Violet:** primary actions in both themes and light-theme brand emphasis.
- **Deep violet:** light-theme links, activated icons and emphasis; primary-action hover in both themes.
- **Lilac emphasis:** dark-theme brand, links, activated icons and emphasis.
- **Active pairs:** theme-specific pale-violet/dark-violet backgrounds and foregrounds identify selected sidebar items.

### Neutral
- **White and light neutrals:** primary light surfaces, secondary and tertiary layering, dark text and muted supporting text.
- **Black and dark neutrals:** dark primary surfaces, near-black sidebar, progressively lighter secondary, tertiary and overlay surfaces; pale text and muted supporting text.
- **Borders:** paired neutral strokes preserve existing application separators.

### Named Rules

**The Theme Pair Rule.** Use semantic application variables to switch foregrounds, backgrounds and active states together. Primary actions retain violet with white text in both themes; the symbol retains its black tile, white uprights and lilac diagonal.

**The Content Boundary Rule.** Apply the overlay to application chrome. Preserve user-authored block colors and editor formatting.

## Typography

Inherit AFFiNE's existing font families, type hierarchy and component typography. The wordmark is custom SVG path lettering with no font dependency; preserve the supplied paths rather than recreating it with text. Its lettering does not establish an application display or body ramp.

## Layout

Preserve the established sidebar, editor, whiteboard and responsive behavior. The sidebar displays the shared wordmark at (124 × 36px) before workspace controls. Dark is the default theme. A visible Claro/Escuro selector sits at the bottom of the sidebar, synchronized with the Sistema/Claro/Escuro appearance setting through next-themes and the shared `nexo-theme` preference.

The cloud activation notice remains unrendered compatibility code. Its source styles and breakpoint do not define the current layout or a reusable notice pattern.

## Elevation & Depth

The overlay adds no shadows or decorative motion. Neutral surface layering and existing separators distinguish application regions; retain inherited elevation and interaction behavior.

## Shapes

The logo combines a rounded black tile, white filled uprights and a lilac diagonal ribbon into a folded N. Preserve the supplied vector geometry and proportions. Existing application corners, borders and control silhouettes remain authoritative; the logo's corners are not a UI radius scale.

## Components

### Brand mark and wordmark

Use the shared `BrandLogo` component and shipped favicon/manifest assets. The symbol variant uses a square viewBox; the wordmark adds custom lowercase path lettering in `currentColor`. Retain its accessible name `Nexo`. The manifest uses the primary black for both background and theme color.

### Primary actions

The new-page action uses the violet primary-button variable with white icon and label text. Hover uses deep violet. Keyboard focus uses an emphasis-colored outline (2px) offset by (3px). Preserve inherited button size, radius and interactions. White on violet was reviewed at (5.70:1).

### Navigation

Selected sidebar items use the paired `--nexo-active-background` and `--nexo-active-foreground` variables; hover continues to use the theme's hover-overlay variable. Reviewed active-state contrast is (9.53:1) in dark mode and (7.36:1) in light mode.

### Theme selector

A compact, bordered group pairs native Claro and Escuro buttons with inline sun and moon SVGs. Each button exposes its resolved state with `aria-pressed`; the group has a translated accessible name and the decorative icons are hidden from assistive technology. With Sistema selected in settings, the sidebar reflects the resolved light or dark theme; selecting a sidebar button explicitly chooses that theme.

The group uses the secondary surface and existing border token. Selected buttons use the same active foreground/background pair as navigation; hover uses the theme hover overlay. Keyboard focus uses the emphasis color with an outline (2px) and offset (2px). Preserve the component's balanced flex layout and minimum button height (36px), rather than creating a new global spacing or radius scale.

### Portuguese interface copy

Use the app catalog for labels, including Espaço de trabalho, Etiquetas, Imagens, smoothing controls and Vínculos bidirecionais. The pt-BR app catalog contains (2,605 keys); filling (441 missing keys) brought catalog coverage to (100%). Preserve interpolation placeholders and numbered markup tags. This percentage describes app-catalog coverage, not an exhaustive audit of every fixed BlockSuite string.

The shared `editorText` helper translates additional canonical slash-menu and toolbar controls for Portuguese document language, preserving command IDs and user-authored content. Portuguese slash search accepts queries without accents. Continue using these localization paths instead of translating saved content or renaming command identifiers.
### Local-only surfaces

Preserve the local editor, whiteboard and import/export controls. AI and cloud activation prompts remain absent. Retained notice components and variables are compatibility source, not active UI or a requirement to restore login actions.

## Do's and Don'ts

### Do:
- **Do** switch foregrounds, backgrounds and active states through semantic theme variables.
- **Do** keep sidebar and appearance theme controls synchronized, with visible focus and `aria-pressed` state.
- **Do** localize interface labels while preserving placeholders, numbered tags, command IDs and saved content.
- **Do** use white text and icons on violet primary actions in both themes.
- **Do** reuse the shared vector logo and shipped identity assets.
- **Do** preserve local notes, whiteboards and browser import/export controls.
- **Do** inherit existing editor typography, formatting and interaction patterns.

### Don't:
- **Don't** introduce AI, account, cloud, online sharing, collaboration or subscription controls into the local-only UI.
- **Don't** recreate the vector wordmark with a font or turn logo geometry into general UI tokens.
- **Don't** recolor saved editor content to match the brand palette.
- **Don't** present app-catalog coverage as a complete audit of fixed BlockSuite text.
- **Don't** use brand studies as replacement application layouts.
- **Don't** replace upstream service or distribution attribution with a Nexo claim unless the destination is actually a Nexo service or distribution.

