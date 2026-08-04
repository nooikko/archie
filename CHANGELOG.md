# Changelog

All notable changes to ARCHIE will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Feedback form at `/feedback` — submit data corrections, suggest new games, report missing info, or leave general community feedback
- Submissions open a GitHub issue for maintainer review; nothing is applied automatically
- Emulator column restored to the game list
- Changelog and Feedback links moved into the header alongside the theme toggle, visible from every page

### Changed
- ARCHIE has moved to [archie.findquinn.com](https://archie.findquinn.com) — social share cards, the preview image, and README links now point to the new address
- Refreshed game data — 83 corrected download links and 65 platform corrections across the directory
- ARCHIE is now in maintenance mode; see `SECURITY.md` for what that means for support and reporting

### Fixed
- 43 download links carried a stray `amp;` in their web address, which sent some of them to the wrong page — all now resolve correctly
- The 18+ / unrated marker from the game sheet is now recorded correctly — 25 affected games were being stored as unflagged. The marker is not shown anywhere in the app yet

### Security
- Removed the unmaintained `xlsx` spreadsheet dependency, clearing a high-severity advisory that had no fix available
- Updated Next.js to 16.2.12, resolving 22 advisories including server-side request forgery, middleware bypass, and cross-site scripting
- Updated the Markdown renderer to patch a denial-of-service issue
- Patched transitive `postcss` and `sharp` vulnerabilities
- The production dependency tree now has no known vulnerabilities
- Dependency installs now refuse any package version published less than 7 days ago, so a compromised release has time to be caught and pulled before it can reach a build

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
