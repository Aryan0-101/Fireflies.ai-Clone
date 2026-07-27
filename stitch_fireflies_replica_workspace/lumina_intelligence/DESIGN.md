---
name: Lumina Intelligence
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#494456'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#7a7487'
  outline-variant: '#cac3d8'
  surface-tint: '#6633ec'
  primary: '#5006d7'
  on-primary: '#ffffff'
  primary-container: '#6938ef'
  on-primary-container: '#e2d8ff'
  inverse-primary: '#ccbdff'
  secondary: '#5e588c'
  on-secondary: '#ffffff'
  secondary-container: '#cac2fe'
  on-secondary-container: '#544e82'
  tertiary: '#00544b'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e63'
  on-tertiary-container: '#6bf3df'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e7deff'
  primary-fixed-dim: '#ccbdff'
  on-primary-fixed: '#1f0060'
  on-primary-fixed-variant: '#4d00d2'
  secondary-fixed: '#e5deff'
  secondary-fixed-dim: '#c8bffb'
  on-secondary-fixed: '#1a1345'
  on-secondary-fixed-variant: '#464073'
  tertiary-fixed: '#71f8e4'
  tertiary-fixed-dim: '#4fdbc8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  border-subtle: '#E5E7EB'
  text-charcoal: '#111827'
  text-muted: '#6B7280'
  accent-pink: '#F472B6'
  surface-card: '#FFFFFF'
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: DM Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: DM Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.011em
  transcript-text:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  metadata:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: DM Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 260px
  sidebar-collapsed: 72px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for a high-performance AI productivity environment. It balances a sophisticated, "AI-first" aesthetic with the rigorous organization required for executive-level workflows. The brand personality is efficient, visionary, and dependable, evoking the feeling of a calm, hyper-organized assistant that never sleeps.

The visual style follows a **Modern Corporate** direction with **Glassmorphic** accents. It utilizes high information density without visual clutter, relying on generous white space and a strict hierarchy of functional surfaces. The interface should feel "airy" yet grounded, using purposeful motion and subtle transparency to signify AI intelligence and real-time processing.

## Colors

The palette centers on a vibrant "Electric Indigo" (#6938EF) as the primary driver for key actions and AI-driven interactions. The background architecture is primarily white (#FFFFFF) with a secondary deep navy (#0E0539) reserved for the sidebar and global navigation to provide a strong structural anchor.

- **Primary:** Use for primary buttons, active states, and AI highlights.
- **Surface & Neutral:** Use #F9FAFB for page backgrounds to reduce eye strain, while #FFFFFF is reserved for floating cards and interactive modules. 
- **Status & Accents:** Teal is used for "Success" or "Live" states, while Soft Pink identifies "Action Items" or "Needs Review."
- **Typography:** Deep charcoal ensures maximum legibility for transcripts, while muted gray is strictly for metadata and non-essential timestamps.

## Typography

This design system uses a dual-font strategy. **DM Sans** provides a modern, geometric feel for headlines and prominent UI titles, while **Inter** is the workhorse for high-legibility body text and complex transcript data.

A tight negative letter-spacing is applied to headings to create a "locked-in" professional look. The transcript text uses a slightly larger line-height (1.7x) compared to standard body text to facilitate effortless scanning during long reading sessions. Metadata always appears in uppercase or medium weights to differentiate it from primary conversational content.

## Layout & Spacing

The system utilizes a **Fixed-Fluid Hybrid** grid. The primary sidebar is fixed, while the main content area expands to a maximum of 1440px. 

- **Desktop:** 12-column grid with 24px gutters. Use a 3nd-column "AI Sidebar" for summaries when viewing transcripts.
- **Tablet:** 8-column grid. The main navigation collapses to an icon-only rail.
- **Mobile:** Single column with 16px margins. Complex panels stack vertically, and the sidebar transforms into a bottom-sheet or hamburger drawer.

Spacing follows an 8px base unit. Internal card padding is consistently 24px to maintain an "airy" feel even with high data density.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layers** and **Soft Ambient Shadows**. 

1. **Level 0 (Background):** #F9FAFB - The base canvas.
2. **Level 1 (Cards/Containers):** #FFFFFF with a 1px border (#E5E7EB). This level uses a very soft, diffused shadow: `0px 4px 20px rgba(0, 0, 0, 0.03)`.
3. **Level 2 (Popovers/Modals):** #FFFFFF with a more pronounced shadow: `0px 12px 32px rgba(14, 5, 57, 0.08)`.

AI-specific components (like Summary Panels) may feature a subtle gradient border or a faint purple-tinted backdrop blur to signal they are "generated" rather than "static" content.

## Shapes

The shape language is modern and approachable. A standard radius of **12px (rounded-lg)** is used for meeting cards, AI panels, and main containers. This curvature softens the data-heavy interface.

- **Buttons & Inputs:** 8px (rounded-md) for a more precise, functional feel.
- **Tags & Avatars:** Fully rounded (pill-shaped) to distinguish them from structural elements.

## Components

### Buttons & Key Actions
Primary buttons use the #6938EF background with white text. Secondary buttons use a transparent background with a 1px #E5E7EB border. Hover states should involve a subtle darkening of the color or a slight lift via shadow.

### Sidebar
The sidebar uses a dark theme (#0E0539) to provide high contrast against the content. Icons are line-art style (20px) with 60% opacity, moving to 100% opacity and a left-accent purple bar on active states.

### Meeting Cards
Cards display the meeting title in **headline-md**, with a horizontal row of participant avatars and a "Summary" snippet in **body-md**. Metadata (date, duration) sits at the top right in **metadata** style.

### Transcript Interface
Rows alternate with a subtle background shift (White to #F9FAFB). Speaker names are bolded in Primary Purple. Timestamps appear in the left margin in **metadata** gray, remaining visible on scroll.

### AI Panels
Summary and Action Item panels use a subtle #6938EF 5% opacity tint or a "glass" blur to differentiate them from the manual transcript. Action items should include a custom checkbox component that uses the teal accent color when completed.