# Research: Shadcn UI Dark Mode Implementation for Next.js App Router

Date: 2026-02-15

## Summary

This research documents the recommended approach for implementing dark mode with Shadcn UI in a Next.js 16 App Router project using Tailwind CSS v4, React 19, and TypeScript strict mode. The solution uses `next-themes` for theme management and leverages Tailwind v4's CSS-based dark mode configuration.

## Prior Research

No prior research on this topic found in AI_RESEARCH/. This is the initial documentation of dark mode implementation patterns for the ARCHIE project.

## Current Findings

### 1. Recommended Library: next-themes

**Package**: `next-themes` by pacocoursey
**Purpose**: Theme management abstraction for React applications
**GitHub**: https://github.com/pacocoursey/next-themes
**npm**: https://www.npmjs.com/package/next-themes

#### Key Features
- Zero-flash theme application (prevents FOUC - Flash of Unstyled Content)
- Automatic system preference detection via `prefers-color-scheme`
- localStorage persistence for user preferences
- SSR/SSG compatible with Next.js App Router
- Tab synchronization (theme changes sync across browser tabs)
- Minimal bundle size (2 lines of integration code)

#### React 19 Compatibility Status

**Current Situation (as of February 2026)**:
- Official peer dependencies in next-themes versions ≤0.3.0 only declare support for React ^16.8, ^17, or ^18
- **Functional compatibility confirmed**: The library works without issues with React 19, but npm shows peer dependency warnings
- **Community workarounds**:
  - Use `pnpm` (recommended for this project) - shows silent warnings only
  - Use `--force` or `--legacy-peer-deps` flags with npm
  - Wait for official peer dependency update (feature requests filed)

**For ARCHIE project**: Since the project uses pnpm v10.x, next-themes will install successfully with only silent warnings.

**Sources**:
- [Feature request: React 19 support · Issue #296](https://github.com/pacocoursey/next-themes/issues/296)
- [Bug: Warning when upgrading to React v19 · Issue #337](https://github.com/pacocoursey/next-themes/issues/337)

### 2. Tailwind CSS v4 Dark Mode Configuration

Tailwind CSS v4 introduces significant changes to dark mode configuration, moving from JavaScript config files to CSS-based variant definitions.

#### Key Changes from v3 to v4

| Aspect | Tailwind v3 | Tailwind v4 |
|--------|-------------|-------------|
| Configuration location | `tailwind.config.js` | `globals.css` or main CSS file |
| Dark mode setting | `darkMode: 'class'` in config | `@custom-variant` directive in CSS |
| Default behavior | System preference only | System preference (configurable via variant) |
| Color system | Hardcoded values | CSS custom properties (`var(--color-*)`) |

#### Configuration Syntax

**For class-based dark mode** (recommended for manual toggle):

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

This tells Tailwind to apply `dark:` utilities when the `.dark` class exists on any parent element.

**For data-attribute based** (alternative approach):

```css
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

#### Current ARCHIE Configuration

The project already has dark mode configured in `/Users/quinn/dev/archipelago/src/app/globals.css`:

```css
@custom-variant dark (&:is(.dark *));
```

**Note**: This variant uses `.dark *` (descendant selector) which applies dark mode to all children of an element with the `.dark` class. The official Tailwind docs recommend `(&:where(.dark, .dark *))` but the current implementation is functionally equivalent.

The project also has comprehensive dark mode CSS variables defined (lines 102-134), including:
- Base colors (background, foreground, card, etc.)
- Component colors (popover, sidebar, etc.)
- Chart colors
- All using OKLCH color space for better perceptual uniformity

**Sources**:
- [Dark mode - Core concepts - Tailwind CSS](https://tailwindcss.com/docs/dark-mode)
- [Implementing Dark Mode and Theme Switching using Tailwind v4 and Next.js](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs)
- [Theme colors with Tailwind CSS v4.0 and Next Themes](https://medium.com/@kevstrosky/theme-colors-with-tailwind-css-v4-0-and-next-themes-dark-light-custom-mode-36dca1e20419)

### 3. Implementation Steps for ARCHIE

Based on Shadcn UI's official Next.js App Router documentation:

#### Step 1: Install next-themes

```bash
pnpm add next-themes
```

Expected outcome: Package installs successfully with silent peer dependency warnings (acceptable with pnpm).

#### Step 2: Create Theme Provider Component

**File**: `src/components/theme-provider.tsx`

```typescript
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Why a wrapper component?**
- Follows Shadcn UI's recommended pattern
- Provides a stable import location for the provider
- Allows future customization without changing imports throughout the app
- The `"use client"` directive is required because ThemeProvider uses React hooks

#### Step 3: Update Root Layout

**File**: `src/app/layout.tsx`

Add the ThemeProvider with these specific props:

```typescript
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Configuration explained**:
- `suppressHydrationWarning`: **Critical** - Prevents React hydration mismatch warnings when next-themes applies the theme class before React hydrates
- `attribute="class"`: Applies theme via `.dark` class (matches Tailwind v4 variant configuration)
- `defaultTheme="system"`: Defaults to user's OS preference if no theme is saved
- `enableSystem`: Enables automatic system preference detection
- `disableTransitionOnChange`: Prevents jarring CSS transitions when theme changes

#### Step 4: Create Mode Toggle Component

**File**: `src/components/mode-toggle.tsx`

```typescript
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Accessibility features**:
- `<span className="sr-only">Toggle theme</span>`: Screen reader text (WCAG 2.5.3 Label in Name compliance)
- Icon animations use CSS transforms (smooth, performant)
- Dropdown menu uses Radix UI primitives (built-in ARIA attributes)
- Keyboard navigation fully supported (Arrow keys, Enter, Escape)

**Sources**:
- [Next.js - shadcn/ui Dark Mode Docs](https://ui.shadcn.com/docs/dark-mode/next)
- [Shadcn-ui codebase analysis: Perfect Next.js dark mode in 2 lines of code](https://thinkthroo.com/blog/shadcn-ui-codebase-analysis-perfect-next-js-dark-mode-in-2-lines-of-code-with-next-themes)

### 4. Accessible Theme Toggle Patterns

#### WCAG AA Compliance Requirements

**Contrast ratios** (WCAG 2.1 / 2.2 standards):
- Normal text: 4.5:1 minimum
- Large text (18pt+ or 14pt+ bold): 3:1 minimum
- UI components and graphical objects: 3:1 minimum

**Best practices for dark mode**:
- Avoid pure black (#000000) - causes eye strain
- Use dark grays (e.g., `#0f0f0f`, `oklch(0.145 0 0)`) instead
- Maintain focus indicators with sufficient contrast
- Test with actual screen readers and keyboard navigation

**ARIA implementation**:
- Use semantic HTML first (First Rule of ARIA: "Don't use ARIA")
- `aria-label` should match or contain visible text (WCAG 2.5.3)
- For icon-only buttons, use `sr-only` class for screen reader text
- Radix UI components (used by Shadcn) provide compliant ARIA by default

**Sources**:
- [Designing Accessible Dark Mode: A WCAG-Compliant Interface Redesign](https://medium.com/@design.ebuniged/designing-accessible-dark-mode-a-wcag-compliant-interface-redesign-0e0225833aa4)
- [ARIA Labels for Web Accessibility: Complete 2025 Implementation Guide](https://www.allaccessible.org/blog/implementing-aria-labels-for-web-accessibility)
- [Dark Mode: Best Practices for Accessibility](https://dubbot.com/dubblog/2023/dark-mode-a11y.html)

### 5. Implementation Notes for ARCHIE

#### Existing Dark Mode Foundation

The project **already has**:
1. Tailwind v4 dark mode variant configured (`@custom-variant dark`)
2. Comprehensive dark mode CSS variables with OKLCH colors
3. Status colors defined for both light and dark modes
4. Proper contrast ratios in existing design

#### What's Missing

The project **needs**:
1. `next-themes` package installation
2. `ThemeProvider` wrapper component
3. Root layout integration with `suppressHydrationWarning`
4. `ModeToggle` UI component
5. Placement of toggle in header/navigation

#### Integration Points

**Where to add the theme toggle**:
- Primary recommendation: Site header (top-right corner)
- Alternative: Sidebar navigation (if added in future)
- Mobile: Consider hamburger menu or sticky position

**Component hierarchy**:
```
src/app/layout.tsx (root)
  └─ ThemeProvider (wraps all children)
      └─ [page content]
          └─ Header/Navigation
              └─ ModeToggle
```

#### Testing Considerations

Based on CLAUDE.md requirements:
- Add Vitest tests for ThemeProvider integration
- Test ModeToggle component with React Testing Library
- Verify keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Test screen reader announcements with `@testing-library/user-event`
- Verify theme persistence across navigation (URL state)
- Test hydration without flash (SSR behavior)

## Key Takeaways

1. **next-themes is production-ready** with React 19 using pnpm (silent warnings acceptable)
2. **Tailwind v4 uses CSS-based configuration** - project already has this configured correctly
3. **Shadcn UI pattern is battle-tested** - follows official Next.js App Router best practices
4. **Accessibility is built-in** - Radix UI primitives provide WCAG AA compliance by default
5. **Three-mode support is standard** - Light, Dark, System preference (recommended UX)
6. **Zero-flash implementation** - `suppressHydrationWarning` + next-themes prevents FOUC
7. **ARCHIE's dark mode colors are already WCAG compliant** - uses OKLCH with proper contrast

## Gotchas and Warnings

1. **React 19 peer dependency warnings**: Expected and safe to ignore with pnpm
2. **suppressHydrationWarning is required**: Without it, React will show hydration errors
3. **Must be "use client"**: ThemeProvider uses hooks, cannot be server component
4. **Avoid pure black**: Current dark mode uses `oklch(0.145 0 0)` which is correct
5. **Test persistence**: Verify localStorage works across page navigation
6. **Mobile UX**: Consider larger touch targets for theme toggle (44x44px minimum)

## Recommended Next Steps

1. **Install next-themes**: Use `pnpm add next-themes` (research agent can't execute)
2. **Create components**: TypeScript-expert or implementation agent can scaffold these
3. **Update layout**: Integration requires editing root layout with provider
4. **Add toggle to header**: UI placement decision (user preference required)
5. **Write tests**: unit-test-maintainer agent can create Vitest tests
6. **Verify accessibility**: Test with keyboard and screen readers

## Alternative Approaches Considered

### Option 1: Custom Context (no library)
- **Pros**: Zero dependencies, full control
- **Cons**: Must handle hydration, localStorage, system preference manually
- **Verdict**: Not recommended - next-themes solves complex edge cases

### Option 2: Radix Themes (built-in theming)
- **Pros**: Integrated with Radix UI primitives
- **Cons**: Couples theming to UI library, less flexible than next-themes
- **Verdict**: Not recommended - Shadcn pattern is more widely adopted

### Option 3: CSS-only (prefers-color-scheme)
- **Pros**: Zero JavaScript, works without hydration
- **Cons**: No manual toggle, can't persist user preference
- **Verdict**: Not recommended - users expect manual control

## Sources

### Official Documentation
- [Next.js - shadcn/ui Dark Mode](https://ui.shadcn.com/docs/dark-mode/next)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [next-themes GitHub Repository](https://github.com/pacocoursey/next-themes)

### Implementation Guides
- [Implementing Dark Mode with Tailwind v4 and Next.js](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs)
- [Theme colors with Tailwind CSS v4.0 and Next Themes](https://medium.com/@kevstrosky/theme-colors-with-tailwind-css-v4-0-and-next-themes-dark-light-custom-mode-36dca1e20419)
- [Shadcn-ui codebase analysis: Perfect Next.js dark mode in 2 lines of code](https://thinkthroo.com/blog/shadcn-ui-codebase-analysis-perfect-next-js-dark-mode-in-2-lines-of-code-with-next-themes)

### Accessibility Resources
- [Designing Accessible Dark Mode: A WCAG-Compliant Interface Redesign](https://medium.com/@design.ebuniged/designing-accessible-dark-mode-a-wcag-compliant-interface-redesign-0e0225833aa4)
- [Dark Mode: Best Practices for Accessibility | DubBot](https://dubbot.com/dubblog/2023/dark-mode-a11y.html)
- [ARIA Labels for Web Accessibility: Complete 2025 Implementation Guide](https://www.allaccessible.org/blog/implementing-aria-labels-for-web-accessibility)

### React 19 Compatibility
- [Feature request: React 19 support · Issue #296](https://github.com/pacocoursey/next-themes/issues/296)
- [Bug: Warning when upgrading to React v19 · Issue #337](https://github.com/pacocoursey/next-themes/issues/337)
- [Next.js 15 + React 19 - shadcn/ui](https://ui.shadcn.com/docs/react-19)

### Community Resources
- [Dark Mode Using ShadCn With NextJs | Medium](https://medium.com/@elhamrani.omar23/dark-mode-using-shadcn-with-nextjs-2b3f7163a4cb)
- [Light and Dark theme switch using Shadcn](https://blog.nidhin.dev/setup-dark-light-mode-for-your-nextjs-application-using-shadcn)

---

**Research completed**: 2026-02-15
**Recommended for**: ARCHIE project (Next.js 16, React 19, Tailwind v4, TypeScript strict mode)
**Status**: Ready for implementation
