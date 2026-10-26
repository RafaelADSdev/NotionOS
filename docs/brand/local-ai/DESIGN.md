---
name: Nexo local AI chat
description: Sparse local assistant surface within the existing Nexo workspace.
colors:
  primary: 'var(--affine-primary-color)'
  surface: 'var(--affine-background-primary-color)'
  secondary-surface: 'var(--affine-background-secondary-color)'
  overlay: 'var(--affine-background-overlay-panel-color)'
  text: 'var(--affine-text-primary-color)'
  muted: 'var(--affine-text-secondary-color)'
  border: 'var(--affine-border-color)'
  hover: 'var(--affine-hover-color)'
typography:
  title:
    fontSize: '18px'
    fontWeight: 600
    lineHeight: '26px'
  body:
    fontSize: '14px'
    lineHeight: 1.7
  input:
    fontSize: '14px'
    lineHeight: '22px'
  label:
    fontSize: '13px'
  caption:
    fontSize: '12px'
    lineHeight: '18px'
rounded:
  control: '6px'
  container: '8px'
spacing:
  compact: '4px'
  control: '8px'
  field: '12px'
  section: '16px'
  conversation: '24px'
components:
  quiet-button:
    backgroundColor: 'transparent'
    textColor: '{colors.muted}'
    typography: '{typography.label}'
    rounded: '{rounded.control}'
    padding: '4px 8px'
  quiet-button-hover:
    backgroundColor: '{colors.hover}'
  secondary-button:
    backgroundColor: '{colors.secondary-surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
  primary-button:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface}'
    rounded: '{rounded.control}'
    padding: '6px 10px'
  primary-button-hover:
    backgroundColor: '{colors.primary}'
  context-chip:
    backgroundColor: '{colors.secondary-surface}'
    textColor: '{colors.muted}'
    rounded: '{rounded.control}'
    padding: '4px 8px'
  settings-field:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    padding: '8px 10px'
---

# Design System: Nexo local AI chat

## Overview

**Creative North Star: "Continuous connection"**

This scoped record captures the shipped local assistant, its settings and reply actions. It inherits Nexo's existing application typography, Portuguese interface and paired themes. The original AFFiNE composition supplies a quiet greeting and an immediately available composer; the workspace remains the surrounding visual authority.

Evidence: `packages/frontend/core/src/components/local-ai/{panel.tsx,chat.css.ts,styles.css.ts,settings.tsx,reply-actions.tsx}`, the workspace chat route, `packages/frontend/component/src/theme/nexo.css`, and `PRODUCT.md`. This record does not replace `docs/brand/DESIGN.md` or define other application surfaces. The product now includes optional local AI; the older brand record's instruction to omit AI is outside this scoped record's current product truth.

**Key Characteristics:**

- Sparse centered empty state with compact toolbar controls.
- Semantic Nexo colors across light and dark themes.
- Existing rich response rendering and explicit review actions.

## Colors

Purple and lilac identify action and focus; paired neutral surfaces carry reading and writing. Frontmatter references the actual application variables so both themes remain authoritative.

### Primary

- **Primary:** violet in light mode and lilac in dark mode, used by the assistant icon, send control, selection and focus.

### Neutral

- **Surface and secondary surface:** the workspace canvas, user messages, context chips and quiet raised controls.
- **Overlay:** context menus use the theme's overlay surface.
- **Text and muted:** separate content from tool labels, placeholder text and supporting hints.
- **Border and hover:** thin neutral boundaries and translucent accent hover feedback.

**The Theme Pair Rule.** Resolve colors through the application variables so text, surfaces, borders and focus change together.

## Typography

Inherit the host application's font stack. No separate display face is introduced. The compact ramp steps from caption to label to body to title; rich assistant content retains the original `LitTextRenderer` hierarchy, including headings, lists, tables and code.

The title role serves the greeting and review dialog heading. Body text uses comfortable conversational leading; the composer has its own input leading. Labels identify actions, while captions carry the caution and contextual hints. The settings copy also uses muted text at label size with (1.6) leading.

**The Inherited Voice Rule.** Preserve the original rich renderer and application type family when extending local assistant content.

## Layout

The full-page route mounts the panel within the existing workbench body and header. The toolbar places Nova conversa at the left and pin/history controls at the right. The panel is a full-height flex column with an independently scrollable body.

A centered content column has a maximum width of (800px), including (24px) horizontal padding. Empty state centers the icon, greeting and composer as one group with (64px) bottom padding. At a container width of (540px) or less, column padding becomes (12px) and empty-state bottom padding becomes (24px). These are container rules, suitable for the note sidebar as well as the full page.

Messages are separated by the conversation spacing step. User messages align right with a maximum width of (92%); assistant messages remain open on the canvas. Context chips wrap, model names truncate within `min(240px, 55cqw)`, and menus constrain their width to the local container. Settings use a (600px) maximum width and stacked fields.

## Elevation & Depth

The surface is mostly flat, using thin neutral strokes and secondary backgrounds. The composer has a restrained ambient shadow (`0 2px 3px rgba(0,0,0,0.05)`); the greeting icon uses `0 2px 4px rgba(0,0,0,0.06)`. Context menus inherit `--affine-shadow-2`. These specific treatments do not establish a general card-shadow scale.

## Shapes

Compact controls use the control radius; menus, settings containers and preview frames use the container radius. The composer has a distinct soft shell (16px), user messages use (12px), and the send control is circular. Preserve these component-specific silhouettes rather than promoting each one into a reusable radius token. Toolbar and composer strokes are (0.5px); form controls and menus use (1px).

## Components

### Buttons and toolbar

Quiet buttons are compact and muted with transparent backgrounds, theme hover feedback and a primary outline (2px) offset by (2px) on keyboard focus. Icon controls are (36px) square with (20px) SVG icons; the context control is smaller (28px). Nova conversa adds a secondary background and medium weight. Disabled controls reduce opacity and use the default cursor. Settings and confirmation actions retain the bordered button variant; filled settings and confirmation buttons pair primary color with the primary surface foreground, yielding white-on-violet in light mode and near-black-on-lilac in dark mode. Their hover retains the primary background with `brightness(0.95)` rather than inheriting the quiet hover overlay.

### Composer and context chips

The composer is a full-width column with field padding, minimum height (94px), theme input background and a primary border on focus within. Its transparent textarea grows from (36px) to (180px), preserves the normal Enter/Shift+Enter writing interaction and carries an accessible label. The plus control opens contextual tools. Selected references appear as removable, wrapping secondary-surface chips. The model control opens settings; API key entry belongs in settings.

The circular send/stop control is (30px), primary-filled with the primary surface as its foreground; unavailable send uses reduced opacity. The caution and configuration hint remain below the composer.

### Menus and history

Context menus use compact spacing, theme overlay background, border and inherited menu elevation. History uses the existing Popover component; its content width is `min(300px, calc(100vw - 32px))`. Pinning and history apply to the current mounted screen's in-memory conversations.

### Settings and reply review

Settings retain stacked labels, full-width bordered fields and explicit status text. Reply actions use quiet buttons under the original rich renderer. Editing a note or creating a page opens a review dialog before application. HTML previews use a distinct isolated iframe with an explicit explanatory label; preview content is its own white document, not a Nexo palette token.

## Do's and Don'ts

### Do:

- **Do** use the application semantic colors and inherited rich renderer.
- **Do** preserve compact controls, visible keyboard focus and wrapping context chips.
- **Do** keep review and application actions explicit and API key fields in settings.

### Don't:

- **Don't** replace the approved sparse empty state with promotional sections or invented onboarding labels.
- **Don't** treat component-specific radii, preview document colors or isolated shadows as global tokens.
- **Don't** imply persistent conversation storage through history styling or copy.

Scope and verification: captures cover empty light (1440 × 1000), empty narrow (430 × 900) and note dark (1440 × 1000) at `.codex/local-ai-empty-light.png`, `.codex/local-ai-empty-narrow.png` and `.codex/local-ai-note-dark.png`. Finish review reported ship with no material empty-layout defects; the parent workflow reported 17 unit tests and all 14 browser tests passed. The later primary-button foreground and hover correction is reflected here; targeted color verification is handled by the parent workflow. The installed detector could not run because `scripts/detector/engines/browser/detect-url.mjs` was missing; no detector pass is claimed. This is a source-derived design record, not a comprehensive accessibility certification.

Not canonized: the iframe's white background belongs to isolated generated preview content, not the host application's theme palette. No remaining craft-floor defect is promoted into this record.
