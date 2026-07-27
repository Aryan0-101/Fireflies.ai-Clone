# Fireflies.ai Clone Design System

## Source Priority

1. Authenticated Fireflies.ai screenshots and DOM captured during implementation.
2. Downloaded Fireflies.ai pages in `app.fireflies.ai/`.
3. Stitch screens in `stitch_fireflies_replica_workspace/` only for missing content states.

## Visual Direction

Faithful product clone. White and cool-gray workspace surfaces, compact navigation, purple primary actions, restrained borders, and dense meeting information. No redesign or stylistic reinterpretation.

## Core Tokens

- Primary purple: `#6C3BF5`
- Primary dark: `#4B16D1`
- AI pink: `#F25BB8`
- Success teal: `#0B7A70`
- Canvas: `#F7F7FA`
- Surface: `#FFFFFF`
- Muted surface: `#F1F1F5`
- Border: `#E5E5EC`
- Text: `#24212F`
- Muted text: `#6F6B7D`
- Sidebar width: `248px`
- Header height: `64px`
- Standard radius: `8px`
- Compact radius: `6px`

## Typography

Use `Inter`, then system sans-serif. Product headings remain compact and fixed-size. Body copy uses 14-16px. Metadata uses 11-13px with normal letter spacing unless source screenshot shows uppercase labeling.

## Layout

Desktop uses fixed left navigation and sticky top toolbar. Meeting library uses list/table density. Transcript view uses transcript content plus meeting intelligence side panel. Tablet collapses navigation to an icon rail. Mobile uses a drawer and stacked content.

## Components

- Navigation: line icons, subdued inactive states, purple selected background.
- Buttons: 36-40px height; purple primary, bordered secondary, icon-only for compact tools.
- Inputs: cool gray fill, subtle border/focus ring, 8px radius.
- Meeting rows: flat table rows with separators, not floating cards.
- Transcript segments: timestamp, speaker identity, readable text, selected tint.
- AI content: restrained purple tint, clear generated-content disclaimer.
- Status: text plus icon/dot; teal for completed/transcribed, lavender for processing.

## Motion

Use 150-220ms state transitions. Motion communicates menus, selection, loading, and panel changes. Respect `prefers-reduced-motion`.
