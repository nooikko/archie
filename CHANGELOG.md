# Changelog

All notable changes to ARCHIE will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Changelog page at `/changelog`

### Changed
- Removed the Emulator column from the game list (no data available yet)
- Status column is wider, so longer labels like "Broken on Main" display cleanly

### Fixed
- Typing in the search box no longer loses focus mid-search — the input stays active while results update
- Column headers (Type, Status, Platform) now align properly with the rows below them

## [0.1.0] - 2025-04-12

### Added
- Initial release of ARCHIE — the Archipelago Multi-Game Randomizer Directory
- Browse and search games supported by the Archipelago randomizer
- Filter by status, platform, emulator, genre, and type
- Shareable URLs that preserve your current search and filters
- Dark and light mode
- Mobile-friendly layout

[Unreleased]: https://github.com/nooikko/archie/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/nooikko/archie/releases/tag/v0.1.0
