# EPIC v1.3-03 — DTCG / Style Dictionary Migration CLI

**Status:** Planned (v1.3)
**Effort estimate:** ~3 working days
**Stories:** 4

## Mission

Surface the existing `scripts/dtcg-to-scss.mjs` as a polished `npx cia migrate dtcg <path>` command. Add docs page, integration test, and confidence report consistent with the v1.0 Tailwind/Bootstrap migration.

## Why now

The DTCG bridge already exists internally — used by the Figma plugin (v1.3 EPIC-01) and by the build pipeline. Surfacing as a public CLI command takes ~3 days and gives Style Dictionary users (a huge enterprise cohort) a clean on-ramp.

## Out of scope

- Style Dictionary plugin (cia ships the CLI; Style Dictionary users can run it from their build)
- DTCG → Figma direct (Figma plugin handles that)
- New DTCG spec features beyond what cia already supports

## Features

### F3.1 — CLI surface

#### US-V13.03.1.1 — `npx cia migrate dtcg <path>` registered

**Acceptance criteria:**
- [ ] Subcommand registered in cia migrate CLI
- [ ] Accepts a DTCG-spec JSON file path
- [ ] Errors helpfully if file isn't valid DTCG

**Effort:** S (≤4 hrs)
**Depends on:** v1.0 EPIC-03

#### US-V13.03.1.2 — Wrap existing dtcg-to-scss.mjs logic

**Acceptance criteria:**
- [ ] CLI calls the existing logic with consistent options
- [ ] Output respects the same writer + theme-wrap conventions as Tailwind/Bootstrap migrate
- [ ] Confidence report printed (HIGH/MEDIUM/LOW/UNMAPPED)
- [ ] Output passes `validate-themes`

**Effort:** S (≤4 hrs)

---

### F3.2 — Docs + tests

#### US-V13.03.2.1 — Docs page at `/docs/migrate/dtcg`

**Acceptance criteria:**
- [ ] Page exists with walkthrough
- [ ] Shows real Style Dictionary build output → cia theme example
- [ ] Linked from main migrate docs

**Effort:** S (≤4 hrs)

#### US-V13.03.2.2 — Integration test against a real DTCG file

**Acceptance criteria:**
- [ ] Test fixture: a real-world DTCG JSON (e.g. from Material's published tokens)
- [ ] Test runs `npx cia migrate dtcg <fixture>` → validates output
- [ ] CI runs on every PR
- [ ] CHANGELOG entry

**Effort:** S (≤4 hrs)

## Definition of done

- [ ] All 4 stories accepted
- [ ] `npx cia migrate dtcg ./tokens.json` works
- [ ] Docs page lives
- [ ] Integration test green

## Risks

- **DTCG spec drift.** Spec is still maturing. Mitigation: pin to the version cia core supports; document the supported version.

## Related

- [v1.0 EPIC-03-migration-on-ramp.md](../v1-0/EPIC-03-migration-on-ramp.md) — Tailwind + Bootstrap migration (same pattern)
- [v1.2 EPIC-05-migration-mui-chakra.md](../v1-2/EPIC-05-migration-mui-chakra.md) — MUI + Chakra migration
- [v1.3 EPIC-01-figma-plugin.md](./EPIC-01-figma-plugin.md) — Figma plugin also uses the DTCG bridge
