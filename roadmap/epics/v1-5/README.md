# v1.5 — IDE Integration

**Target release:** v1.5.0 (~3-6 months after v1.3 — gives v1.1-v1.3 time to settle)
**Theme:** IDE integration. The single epic is the VS Code extension Jerry explicitly slated for v1.5 during the 2026-05-23 architecture lock.

> **Status: Not started (planned).** This is a post-v1.0 version (v1.0 shipped: tagged 2026-08-17, launched 2026-09-01). No story in the epic below has begun; everything here is future work.

## Epics

| # | Epic | Mission | Effort | Stories |
|---|---|---|---|---|
| [01](./EPIC-01-vscode-extension.md) | **VS Code Extension** | Mixin signature hovers, token autocomplete, jump-to-definition for cia mixins, inline contrast preview on color tokens. Like Tailwind CSS IntelliSense, but for cia. | ~2 weeks | 15 |

**Total v1.5 effort:** ~10 working days. **Total stories:** 15.

## Definition of done for v1.5

- [ ] Extension published to VS Code Marketplace
- [ ] All 15 stories accepted
- [ ] Tested against the 5 v1.0 recipes + a real consumer project
- [ ] CHANGELOG.md v1.5.0 entry (extension version bump, no cia core change required if all features are extension-side)

## Why v1.5 (not v1.1 or v1.2)

Jerry's explicit decision 2026-05-23: "v1.0 ships playground; VS Code extension lives in v1.5." Reasoning:
- Playground (v1.0) covers the "I want to see what cia does" need with zero install
- VS Code extension is the "I'm using cia every day" upgrade — earned by post-launch traction
- IDE integration is high-leverage but high-effort; sequencing it after framework packs + ecosystem (v1.1-v1.3) lets the extension reflect a mature API surface
