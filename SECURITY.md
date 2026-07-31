# Security Policy

## Project status

ARCHIE is in **maintenance mode**. The directory is still live and security issues
still get fixed, but new features are not being added and non-security changes are
handled slowly or not at all. Dependency and security updates are the work that
continues.

## Scope

ARCHIE is a mostly static Next.js directory of Archipelago game support. The game
data is generated at build time, so most of the site has no server behaviour to
attack.

The parts that do carry risk:

- **`/api/feedback`** — the only server-side endpoint. It takes an untrusted
  submission and creates a GitHub issue on this repository using a token held
  server-side. The realistic threats are abuse of that endpoint to spam the issue
  tracker, and anything that gets the endpoint to act outside its intended
  narrow use of the token.
- **Rendered user-influenced content** — game notes and changelog content pass
  through a Markdown renderer. An injection that escapes into executable script
  in a visitor's browser is a security issue.
- **The release pipeline** — anything that could ship a deployed build that does
  not match this source.

If you find something in those areas, I want to know.

## Supported versions

The currently deployed site, and the latest release. This is a small side project;
fixes go forward, not into old tags.

## Reporting a vulnerability

Please report privately through
[GitHub Security Advisories](https://github.com/nooikko/archie/security/advisories/new)
rather than opening a public issue — and please don't use the feedback form for
security reports, since that creates a public issue automatically.

Include what you did, what happened, and the affected URL or version. A minimal
reproduction is the most useful thing you can attach.

On timing: this is a maintenance-mode side project and I do not check it daily.
Please allow **up to two weeks** for an initial response rather than expecting a
quick reply. A security advisory emails me, which is the most reliable way to
reach me.

Once I've seen it, I'll confirm the report, agree a fix, and credit you in the
release notes unless you'd rather I didn't.

## Known accepted risks

- **`xlsx` (SheetJS) 0.18.5** carries two unpatched high advisories (prototype
  pollution, ReDoS). The published npm package is abandoned at this version;
  fixes exist only on the vendor's own CDN. It is a devDependency used by one
  manual script (`scripts/blend-data.ts`) that reads a spreadsheet the maintainer
  supplies from their own Drive. It is not imported by `src/`, not part of the
  build, and not in the deployed bundle, so neither advisory is reachable by a
  visitor. Assessed and accepted rather than overlooked. The production
  dependency tree has no known vulnerabilities.

## Out of scope

- **The games themselves**, their randomizers, and their APWorld files. ARCHIE
  links to and describes third-party work; it does not host or vet it.
- **Third-party download links** in the directory. Availability and contents of
  those are the responsibility of whoever publishes them. If a link points at
  something actively malicious, that is worth reporting — but as a data problem,
  not a vulnerability in this codebase.
- **Inaccurate game data.** Wrong or missing information is a data correction;
  please use the feedback form or open a normal issue.
- **Missing hardening headers or rate limits with no demonstrated impact.**
  Reports that are only the output of an automated scanner, with no working
  exploit, will usually be closed.
