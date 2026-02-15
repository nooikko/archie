# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ARCHIE** is a searchable directory of games supported by the Archipelago multi-game randomizer platform. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4, it provides instant search and filtering across hundreds of games.

## Commands

### Development
```bash
pnpm dev              # Start development server (localhost:3000)
pnpm build            # Production build (includes CSV data processing)
pnpm start            # Start production server
```

### Code Quality
```bash
pnpm typecheck        # TypeScript type checking (strict mode)
pnpm lint             # Biome lint + auto-fix
pnpm lint:check       # Biome lint check only (no fixes)
pnpm test             # Run all tests with Vitest
pnpm vitest           # Run tests in watch mode
pnpm vitest --ui      # Open Vitest UI
```

### Package Manager
- **Required**: pnpm v10.x (enforced via packageManager field)
- **Never use npm or yarn** - this project requires pnpm

## Architecture

### Data Flow
1. **Source**: `Archipelago_Master_Game_List.csv` (game data)
2. **Build-time**: `scripts/build-games-data.ts` parses CSV → JSON
3. **Runtime**: `src/lib/search/index.ts` imports JSON as static data
4. **Client-side**: All filtering/searching happens in browser (no server actions)

The CSV is processed during the **prebuild** phase (before Next.js build), generating `src/lib/search/data/games-data.json`. This JSON file is imported directly and bundled with the app.

### Component Structure
```
src/app/page.tsx              # Home page (server component)
  └─ GameBrowser              # Client component with URL state sync
      ├─ SearchBar            # Debounced search input
      ├─ GameFilters          # Multi-select filters (status/platform/emulator)
      └─ GameGrid             # Renders filtered games
          └─ GameCard         # Individual game row
```

**Key architectural decisions**:
- **Client-side filtering**: All 400+ games load once, filter in memory (fast, simple)
- **URL state sync**: Search query and filters sync to URL for shareable links
- **React Transitions**: Uses `useTransition` for non-blocking UI updates during filtering
- **No server actions**: This is a static site with client-side interactivity

### URL Parameters
- `?q=<query>` - Search query
- `?status=Official,Stable` - Comma-separated status filters
- `?platform=PC,SNES` - Comma-separated platform filters
- `?emulator=BizHawk` - Comma-separated emulator filters

All parameters are optional and can be combined.

## TypeScript Configuration

- **Strict mode enabled**: All code must pass strict type checking
- **Path alias**: `@/*` maps to `./src/*`
- **JSON imports**: `resolveJsonModule` is enabled for importing games-data.json

## Biome Configuration

- **Line width**: 150 characters (wider than default)
- **Quotes**: Single quotes for JSX and JS/TS
- **Semicolons**: Always required
- **Accessibility**: Strict a11y rules enforced (WCAG AA compliance)
- **Key rules**:
  - `noExplicitAny: error` - Never use `any` type
  - `noUnusedImports: error` - Auto-removes unused imports
  - All a11y rules set to error/warn

## Git Hooks (Husky)

### Pre-commit (runs on every commit)
1. TypeScript type checking (`pnpm typecheck`)
2. Biome linting (`pnpm lint:check`)
3. Unit tests (`pnpm test`)

### Pre-push (runs on every push)
1. Production build (`pnpm build`)

**Important**: The build step includes data generation, so if the CSV is malformed, the push will fail.

## Design System

Run `/archie-design` skill for complete design documentation. Key principles:

### Typography
- **Display**: Outfit (geometric sans) for game titles and headers
- **Monospace**: JetBrains Mono for status badges, platform labels, metadata
- Avoid generic fonts (Inter, Roboto) - we use distinctive fonts for technical aesthetic

### Layout
- **Responsive grid**: Mobile-first with fixed column widths for badge alignment
- **Breakpoints**: `sm:640px`, `lg:1024px`
- **Grid structure**: `[Game | Status | Platform | Emulator]` (responsive columns)

### Status Colors
Each status has a color + background pairing (e.g., Stable = green, Unstable = orange, Broken = red). Status colors are functional, not decorative.

### Accessibility
- WCAG AA compliant
- Semantic HTML with proper heading hierarchy
- ARIA labels on all interactive elements
- Keyboard navigation support

## Testing

- **Framework**: Vitest + React Testing Library
- **Coverage**: 75+ tests across components
- **Test files**: Co-located with components in `__tests__/` folders
- **Run single test**: `pnpm vitest path/to/test.test.tsx`

### Test patterns
- Use `@testing-library/react` for component testing
- Use `@testing-library/user-event` for user interactions
- Tests should verify behavior, not implementation details
- Always include accessibility checks in component tests

## Common Tasks

### Modifying game data structure
If you need to add/change CSV columns:
1. Update `Game` interface in `src/lib/search/index.ts`
2. Update CSV parsing logic in `scripts/build-games-data.ts`
3. Update UI components to display new fields
4. Run `pnpm build` to regenerate JSON

### Adding a new component
1. Create component in `src/components/`
2. Add tests in `src/components/__tests__/`
3. Follow design system (see `/archie-design` skill)
4. Run tests and type checking before committing

### Updating filters
All filter logic is in `src/components/game-browser.tsx`. Filters use multi-select (comma-separated values) and sync to URL.

## Important Constraints

1. **No zebra striping**: User explicitly rejected alternating row colors
2. **No PC icons**: Removed as visual noise (see design decisions)
3. **Client-side only**: No server actions, API routes, or database
4. **Static export ready**: Architecture supports `next export` if needed
5. **TypeScript strict mode**: All code must satisfy strict type checking

## Claude Skills

This project includes custom Claude Code skills:
- `/archie-design` - Complete design system documentation
- `/do` - Smart orchestrator for complex tasks

Use these skills when working on UI or complex features.
