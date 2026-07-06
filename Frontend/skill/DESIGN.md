---
name: Zenith Focus
colors:
  surface: '#f9f9fe'
  surface-dim: '#d9dade'
  surface-bright: '#f9f9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f8'
  surface-container: '#ededf2'
  surface-container-high: '#e8e8ed'
  surface-container-highest: '#e2e2e7'
  on-surface: '#1a1c1f'
  on-surface-variant: '#434656'
  inverse-surface: '#2e3034'
  inverse-on-surface: '#f0f0f5'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#bc000a'
  on-secondary: '#ffffff'
  secondary-container: '#e2241f'
  on-secondary-container: '#fffbff'
  tertiary: '#745b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#d0a600'
  on-tertiary-container: '#4f3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4aa'
  on-secondary-fixed: '#410001'
  on-secondary-fixed-variant: '#930005'
  tertiary-fixed: '#ffe08b'
  tertiary-fixed-dim: '#f1c100'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#f9f9fe'
  on-background: '#1a1c1f'
  surface-variant: '#e2e2e7'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-margin: 20px
  stack-gap: 12px
  touch-target-min: 44px
  section-padding: 24px
  gutter: 16px
---

## Brand & Style

The design system is built on the principles of **Modern Minimalism**, specifically tailored for a mobile-first productivity environment. The brand personality is calm, disciplined, and dependable, aiming to reduce cognitive load rather than compete for attention. 

The goal is to evoke a sense of clarity and "flow" (Trạng thái tập trung). By utilizing generous whitespace and a restricted visual palette, the UI disappears to let the user's tasks take center stage. Every element serves a functional purpose, following the "less but better" philosophy to ensure the user feels in control and organized.

## Colors

The palette is anchored by a high-precision **Electric Blue** (Primary), chosen to symbolize trust and cognitive focus. This is contrasted against a stark white background to maintain a "clean sheet" feel.

- **Primary (#0052FF):** Used for primary actions, active states, and progress indicators.
- **Secondary / Urgent (#FF3B30):** Reserved strictly for overdue tasks or high-priority deadlines.
- **Tertiary / Important (#FFCC00):** Used for medium-priority markers, providing a clear visual distinction without the alarm of red.
- **Neutral / Background (#F2F2F7):** Used for grouping content and secondary backgrounds to create subtle separation without harsh lines.
- **Success (#34C759):** Applied to completed task states to provide a hit of dopamine and clarity.

## Typography

This design system uses a dual-font strategy to balance character with utility. **Plus Jakarta Sans** is used for headings to provide a friendly, modern, and open feel. **Inter** is used for all body text and UI labels due to its exceptional legibility at small sizes and its systematic, neutral tone.

Hierarchy is established primarily through weight and size. Body text maintains a generous line height (150%) to ensure readability during quick scanning of task lists. Use `label-md` for metadata like categories or dates to create clear visual separation from the task title.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for thumb-reachability. We prioritize a "comfort-first" spacing rhythm, moving away from dense lists to allow for accidental taps and easy scanning.

- **Margins:** A consistent 20px outer margin ensures content doesn't feel cramped against the device edges.
- **Vertical Rhythm:** Tasks are separated by a 12px gap (stack-gap) to ensure each item is perceived as an individual interactive card.
- **Touch Targets:** All interactive elements (checkboxes, edit buttons) must adhere to a minimum 44x44px touch area, even if the visual icon is smaller.
- **Safe Areas:** Significant bottom padding is applied to the main list to ensure the Floating Action Button (FAB) does not obscure the final task.

## Elevation & Depth

To maintain a minimalist aesthetic, the design system avoids heavy shadows. Instead, it utilizes **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Base):** The main background uses pure white (#FFFFFF).
- **Level 1 (Cards):** Task items use a very subtle 1px border (#E5E5EA) or a light grey fill (#F2F2F7) to define boundaries.
- **Active State:** When a user drags a task to reorder, a soft, high-diffusion ambient shadow (10% opacity, 20px blur) is applied to "lift" the element above the grid.
- **Modals:** Use a backdrop blur (20px) on the background layer to maintain context while focusing the user on the entry task.

## Shapes

The shape language is **Rounded**, reflecting a modern and approachable tool. 

- **Primary Container:** 0.5rem (8px) corner radius for task cards and input fields.
- **Large Components:** 1rem (16px) corner radius for bottom sheets and large modal containers.
- **Action Elements:** The Floating Action Button (FAB) and Status Pills use a fully rounded (Pill-shaped) radius to distinguish them as high-interaction points.

## Components

### Buttons
- **Primary:** Filled Blue (#0052FF) with white text. Pill-shaped.
- **Secondary:** Ghost style (Blue border, transparent background) for less urgent actions like "Add Subtask."

### Task Cards
- A horizontal layout: Checkbox on the far left, Task Title in `body-lg`, and Priority Indicator (a small vertical strip of color) on the far right edge.
- Subtle background change to light grey when a task is marked "Done."

### Checkboxes
- Large, 24x24px circular targets. When checked, they fill with the Primary Blue and trigger a subtle haptic feedback.

### Input Fields
- Clean, underline-only or subtle border-box styling. The focus state is indicated by a 2px Primary Blue bottom border. No placeholder text should be visible once typing begins; use floating labels if necessary.

### Priority Chips
- Small, rounded-pill labels using a 10% opacity version of the priority color (Red or Yellow) with high-contrast colored text inside.

### Floating Action Button (FAB)
- A circular button located at the bottom-right of the screen, housing a simple "+" icon. It uses the Primary Blue and a medium elevation shadow to signify it is the most important action.