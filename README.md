# 🎮 ARCHIE - Archipelago Multi-Game Randomizer Directory

A modern, searchable directory of all games supported by the [Archipelago multi-game randomizer platform](https://archipelago.gg).

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

---

## ✨ Features

- 🔍 **Instant Search** - Search games by name, status, platform, or emulator
- 🎯 **Multi-Select Filters** - Filter by status, platform, and emulator
- 📱 **Responsive Design** - Optimized for mobile, tablet, and desktop
- ⚡ **Performance Focused** - Fast search with debouncing and URL state sync
- 🎨 **Technical Design System** - Clean, professional data sheet aesthetic
- ♿ **Accessible** - WCAG AA compliant with full keyboard navigation
- 🧪 **Fully Tested** - 75+ unit tests with Vitest + React Testing Library

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v22.x or higher
- **pnpm**: v10.x (required package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📜 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server at localhost:3000 |
| `pnpm build` | Build production bundle (includes data generation) |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linter and auto-fix issues |
| `pnpm lint:check` | Check for linting issues without fixing |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run all unit tests with Vitest |

---

## 🏗️ Project Structure

```
archipelago/
├── .claude/              # Claude Code configuration and skills
│   └── skills/          # Custom Claude skills (do, archie-design)
├── .husky/              # Git hooks (pre-commit, pre-push)
├── public/              # Static assets
├── scripts/             # Build scripts (CSV data processing)
├── src/
│   ├── app/             # Next.js App Router pages
│   │   ├── __tests__/   # Page-level tests
│   │   ├── layout.tsx   # Root layout with fonts
│   │   ├── page.tsx     # Home page
│   │   ├── loading.tsx  # Loading skeleton
│   │   └── error.tsx    # Error boundary
│   ├── components/      # React components
│   │   ├── __tests__/   # Component tests
│   │   ├── ui/          # shadcn/ui components
│   │   ├── game-browser.tsx
│   │   ├── game-grid.tsx
│   │   ├── game-card/
│   │   ├── game-filters.tsx
│   │   ├── search-bar.tsx
│   │   └── status-legend.tsx
│   └── lib/             # Utilities and data
│       └── search.ts    # Game data and search utilities
├── biome.json           # Biome linter configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
├── vitest.config.ts     # Vitest test configuration
└── package.json         # Project dependencies and scripts
```

---

## 🎨 Design System

Run `/archie-design` in Claude Code to see the full design system documentation.

### Key Design Principles

- **Technical Data Sheet Aesthetic** - Clean, scannable, professional
- **Typography**: Outfit (display) + JetBrains Mono (monospace)
- **Color Palette**: Refined neutrals with functional status colors
- **Responsive Grid**: Mobile-first with progressive enhancement
- **Accessibility**: WCAG AA compliant with proper ARIA labels

---

## 🧪 Testing

The project uses **Vitest** and **React Testing Library** for comprehensive unit testing.

```bash
# Run all tests
pnpm test

# Run tests in watch mode (development)
pnpm vitest

# Run tests with coverage
pnpm vitest --coverage

# Open Vitest UI
pnpm vitest --ui
```

### Test Coverage

- ✅ **75+ tests** across all components
- ✅ Component rendering and interactions
- ✅ Search and filter functionality
- ✅ Loading states and error boundaries
- ✅ Accessibility attributes
- ✅ Responsive behavior

---

## 🔧 Git Hooks (Husky)

Pre-commit and pre-push hooks ensure code quality:

### Pre-Commit Hook
Runs automatically before every commit:
1. ✅ TypeScript type checking (`pnpm typecheck`)
2. ✅ Biome linting (`pnpm lint:check`)
3. ✅ Unit tests (`pnpm test`)

### Pre-Push Hook
Runs automatically before every push:
1. ✅ Production build validation (`pnpm build`)

*Hooks are automatically installed via `pnpm install` (prepare script)*

---

## 📊 Data Source

Game data is sourced from `Archipelago_Master_Game_List.csv` and processed during the build step via `scripts/build-games-data.ts`.

The CSV includes:
- Game names
- Support status (Stable, Official, Unstable, etc.)
- Platform information
- Emulator requirements

---

## 🛠️ Tech Stack

### Core
- **Next.js 16** - React framework with App Router
- **React 19.2** - UI library
- **TypeScript 5.9** - Type safety
- **Tailwind CSS v4** - Utility-first styling

### UI Components
- **shadcn/ui** - Radix UI primitives
- **cmdk** - Command palette for filters
- **lucide-react** - Icon system

### Development Tools
- **Biome** - Fast linter and formatter
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **Husky** - Git hooks
- **pnpm** - Fast, efficient package manager

---

## 🤝 Contributing

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Ensure all checks pass:
   - Type checking: `pnpm typecheck`
   - Linting: `pnpm lint`
   - Tests: `pnpm test`
   - Build: `pnpm build`
4. Commit your changes (pre-commit hooks will run automatically)
5. Push to your branch (pre-push hooks will run automatically)
6. Open a pull request

### Code Style

- Follow the established design system (see `/archie-design` skill)
- Write tests for new features
- Maintain TypeScript strict mode compliance
- Use semantic HTML and proper ARIA labels
- Follow Biome formatting rules (auto-applied on save)

---

## 📝 License

This project is for the Archipelago community. See [archipelago.gg](https://archipelago.gg) for more information.

---

## 🔗 Links

- **Archipelago Website**: [https://archipelago.gg](https://archipelago.gg)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui**: [https://ui.shadcn.com](https://ui.shadcn.com)

---

*Built with ❤️ for the Archipelago community*
