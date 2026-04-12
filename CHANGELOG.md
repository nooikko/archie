# Changelog

All notable changes to ARCHIE will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-04-12

### Added
- Changelog page at `/changelog`

### Changed
- Removed the Emulator column from the game list (no data available yet)
- Status column is wider, so longer labels like "Broken on Main" display cleanly
- Platform labels are now consistent — GameCube entries previously split between "GC" and "GameCube" now all show "GameCube"; "NDS" now shows as "DS"
- Bundled games with no separate download link now link to their official Archipelago game page
- Roughly 50 fewer duplicate entries in the game list, where the same APWorld was appearing under two slightly different names

### Fixed
- Deployments no longer fail when environment variables are absent
- Environment variable parsing now handles quoted values and inline comments correctly
- Build cache is validated before being used to skip regeneration
- Typing in the search box no longer loses focus mid-search
- Column headers now align properly with the rows below them

## [0.1.0] - 2025-04-12

### Added
- Initial release of ARCHIE — the Archipelago Multi-Game Randomizer Directory
- Browse and search games supported by the Archipelago randomizer
- Filter by status, platform, emulator, genre, and type
- Shareable URLs that preserve your current search and filters
- Dark and light mode
- Mobile-friendly layout

[Unreleased]: https://github.com/nooikko/archie/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/nooikko/archie/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/nooikko/archie/releases/tag/v0.1.0
