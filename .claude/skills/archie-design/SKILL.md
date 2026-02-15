# Archie Design System

This skill provides the complete design system for the Archipelago game directory (Archie). Use this when working on UI components, styling, or any visual design tasks.

---

## Design Direction: Technical Data Sheet Aesthetic

A refined, modern approach that treats the game list as a precise technical specification sheet. Clean, scannable, and professional.

---

## Typography

### Display Font: **Outfit**
- Geometric sans-serif with modern proportions
- Used for: Game titles, page headers
- Weights: 400 (medium), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### Monospace Font: **JetBrains Mono**
- Technical, developer-focused monospace
- Used for: Status badges, platform labels, metadata, UI labels
- Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Features: Tabular numbers for perfect alignment

### Rationale
These fonts create a **distinctive technical aesthetic** that avoids generic design system choices (Inter, Roboto, etc.). The combination of geometric sans + developer monospace reinforces the "data specification" concept.

---

## Color Palette

### Base Colors (Refined Neutrals)
```css
--background: #fafafa      /* Off-white, soft on eyes */
--foreground: #0f0f0f      /* Near-black, high contrast */
--border: #e5e5e5          /* Subtle separation */
--muted: #f5f5f5           /* Background accents */
--muted-foreground: #737373 /* Secondary text */
```

### Status Colors (Professional)
Each status has a color + background pairing for badges:

| Status | Color | Background | Use Case |
|--------|-------|------------|----------|
| Stable | `#16a34a` | `#f0fdf4` | Production-ready games |
| Official | `#3b82f6` | `#eff6ff` | Officially supported |
| Unstable | `#f59e0b` | `#fffbeb` | Work in progress |
| In Review | `#8b5cf6` | `#f5f3ff` | Under evaluation |
| Broken | `#ef4444` | `#fef2f2` | Not functional |
| Merged | `#14b8a6` | `#f0fdfa` | Code merged |
| Index Only | `#eab308` | `#fefce8` | Limited support |
| APWorld Only | `#ec4899` | `#fdf2f8` | Specific implementation |

### Rationale
The neutral palette creates a **clean canvas** that lets the data shine. Status colors are **functional, not decorative** - they convey meaning through color psychology (green = stable, orange = caution, red = broken).

---

## Layout System

### Grid Structure
```
[Game Title (flexible)] [Status (140px)] [Platform (100px)] [Emulator (120px)]
```

**Responsive Breakpoints:**
- **Mobile (default)**: 2 columns `[Game Title | Status Badge]`
- **Small+ (sm: 640px)**: 3 columns `[Game Title | Status (120px) | Platform (100px)]`
- **Large+ (lg: 1024px)**: 4 columns `[Game Title | Status (140px) | Platform (100px) | Emulator (120px)]`

**Fixed column widths** ensure perfect vertical alignment of badges and metadata across all rows.

### Spacing
- Row padding: `px-2 sm:px-6` (responsive horizontal padding)
- Column gap: `gap-2 sm:gap-4 lg:gap-6` (responsive gaps)
- Border: **1px solid** on bottom of each row

### Header Row
- Sticky positioned at top (`sticky top-0 z-10`)
- 2px bottom border for emphasis (`border-b-2`)
- Backdrop blur for depth (`bg-background/95 backdrop-blur-sm`)
- Monospace labels, uppercase, wide tracking
- Shows game count inline

### Rationale
The grid creates **visual rhythm and predictability**. Users can scan vertically down any column. The responsive design ensures usability on all device sizes.

---

## Component Details

### Game Card (Individual Row)
```tsx
<li className="border-b border-border hover:bg-muted/30 transition-colors">
  <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_120px_100px] lg:grid-cols-[1fr_140px_100px_120px] gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-6 py-4">
    <h3>Game Name</h3>           {/* Outfit, 15px, medium */}
    <div>Status Badge</div>       {/* JetBrains Mono, 11px, uppercase */}
    <span>Platform</span>         {/* JetBrains Mono, 13px, uppercase */}
    <span>Emulator</span>         {/* JetBrains Mono, 13px, uppercase */}
  </div>
</li>
```

**Hover state**: Subtle background (`bg-muted/30`) + smooth transition

**Animation**: Staggered fade-in on initial render (50ms delay per row)

### Status Badge
- **Border**: 1px solid in status color
- **Background**: Tinted version of status color
- **Text**: Full saturation status color
- **Font**: Monospace, bold, uppercase, wide tracking
- **Padding**: `px-3 py-1` with `rounded-sm`

### Platform Label
- **Font**: Monospace, medium weight, uppercase
- **Color**: Muted foreground (secondary importance)
- **Size**: `text-[13px]`

### Rationale
Every detail reinforces the **technical specification** aesthetic. Monospace for data, generous spacing for scannability, subtle interactions that don't distract.

---

## Key Design Decisions

### ✅ What We Did
1. **Removed redundant PC icons** - Meaningless visual noise
2. **Fixed column widths** - Perfect badge alignment
3. **Responsive grid layout** - Mobile-first, progressively enhanced
4. **Monospace metadata** - Technical, data-focused
5. **Clean grid header** - Immediate context for columns
6. **Refined color palette** - Professional, not playful
7. **Distinctive fonts** - Avoid generic "AI slop" aesthetics

### ❌ What We Avoided
- Zebra striping (requested by user)
- Bright arcade colors (too playful)
- Generic system fonts (Inter, Roboto, etc.)
- Heavy shadows and gradients (distracting)
- Tight spacing (hard to scan)
- Rounded corners everywhere (over-designed)

---

## Component Patterns

### Search Bar
```tsx
<Input
  type="text"
  placeholder="Search games..."
  aria-label="Search games by name, status, platform, or emulator"
  className="h-12 w-full rounded-lg"
/>
```

### Filters
- **Mobile**: Use Sheet (bottom drawer) for filter selections
- **Desktop**: Use Popover dropdowns
- **Active filters**: Display as dismissible badges with count indicators
- **Font**: Monospace, uppercase, tracking-widest

### Loading States
- Use Skeleton components from shadcn/ui
- Match the exact layout structure of loaded content
- Apply staggered fade-in animation

---

## Accessibility

- Semantic HTML (proper heading hierarchy)
- ARIA labels on interactive elements
- High contrast ratios (WCAG AA compliant)
- Keyboard navigation support
- Focus states on all interactive elements
- Screen reader friendly status badges

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid required
- CSS custom properties required
- No IE11 support needed

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.4
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: lucide-react
- **Testing**: Vitest + React Testing Library

---

## Usage Guidelines

When implementing new features:

1. **Follow the typography system** - Use Outfit for display text, JetBrains Mono for technical/data elements
2. **Respect the responsive grid** - Use the established breakpoints (sm, lg)
3. **Maintain the color palette** - Use status colors functionally, not decoratively
4. **Keep spacing consistent** - Use the established padding/gap patterns
5. **Test on mobile** - Mobile-first responsive design
6. **Add proper accessibility** - ARIA labels, semantic HTML, keyboard nav

---

## Examples

### Adding a new data column
If you need to add a new column (e.g., "Players"), update the grid structure:

```tsx
// Update grid cols
grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_120px_100px_100px] lg:grid-cols-[1fr_140px_100px_120px_100px]
```

### Creating a new status badge
Follow the status color pattern in globals.css:

```css
.badge-newstatus {
  @apply border-[color] bg-[bg-color] text-[color];
}
```

---

*Design completed: 2026-02-14*
*Last updated: 2026-02-15*
