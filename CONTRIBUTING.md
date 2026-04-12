# Contributing to Archie

Thanks for your interest in contributing! The most common contribution is adding or updating game data.

## Ways to Contribute

- **Add a game** — a game supported by Archipelago that isn't in the directory yet
- **Update game data** — fix incorrect info, add a missing apworld link, etc.
- **Bug reports** — something broken on the site
- **Code improvements** — UI fixes, performance, accessibility

## Adding or Updating Game Data

Game data lives in `src/lib/search/data/games-data.json`. Each entry follows this shape:

```json
{
  "id": "unique-slug",
  "name": "Game Name",
  "aliases": [],
  "apworld": "https://link-to-apworld-or-release",
  "tags": ["RPG", "Action"]
}
```

To add or update a game:

1. Fork the repo and create a branch: `git checkout -b add-game-name`
2. Edit `src/lib/search/data/games-data.json`
3. Open a PR with the game name in the title and a link to the Archipelago support page or apworld source

## Code Contributions

1. Fork the repo
2. Create a branch: `git checkout -b fix/description`
3. Make your changes
4. Run the linter: `pnpm lint`
5. Run the tests: `pnpm test`
6. Open a PR — one change per PR, please

### Local Setup

```bash
pnpm install
pnpm dev
```

See the README for full setup instructions including environment variables.

## Pull Request Guidelines

- Keep PRs focused — one fix or feature per PR
- Link to a related issue if one exists
- Data PRs don't need tests; code PRs should pass `pnpm test`
- The maintainer reviews and merges all PRs

## Questions

Open an issue if you're unsure about something before putting in the work.
