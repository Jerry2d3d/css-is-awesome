# Epic 7: Community & Project Meta

> **STATUS — audited 2026-07-16 (v0.8.2). Mostly shipped.** Present at repo root / `.github/`: `CONTRIBUTING.md` (Feature 7.1), `CODE_OF_CONDUCT.md` (7.2), `SECURITY.md` (7.3), issue templates bug/feature/question/config + `theme_submission.yml` (7.4), `pull_request_template.md` (7.5), `VERSIONING.md` covering both SemVer and deprecation policy (7.7 / 7.8), and `CHANGELOG.md` (7.9). **Not shipped:** `.github/FUNDING.yml` (7.6), `MAINTAINERS.md` (7.13), a `brand/` assets folder (7.12), and an announcement kit under `roadmap/launch/` (7.11). GitHub Discussions enablement (7.10) and the Sponsor button can't be verified from the file tree. Per-criteria `- [ ]` boxes below are **stale**.

## Summary
Make css-is-awesome feel like a welcoming, credible open-source project rather than one person's GitHub repo. Today the project ships LICENSE, ROADMAP, CHANGELOG, THEMING, and README and nothing else — no CONTRIBUTING, no Code of Conduct, no SECURITY contact, no issue or PR templates, no funding config, no versioning policy, no discussion channel. This epic writes the policies, templates, and community scaffolding that a would-be contributor, security researcher, sponsor, or evaluator expects to find on day one. The actual release automation lives in Epic 5; this epic is the documents and GitHub config those releases are governed by.

## Goals
- All standard OSS community files present and discoverable from the README: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, issue templates, PR template, `FUNDING.yml`.
- Versioning and deprecation policy documented and unambiguous — a contributor can classify any change as patch/minor/major without asking.
- Every security disclosure follows the documented policy: private contact, acknowledged within the stated SLA, fix coordinated, public advisory filed.
- Zero "how do I contribute?" questions answered by linking to source code — every such question is answered by an already-written doc page.
- A single public discussion channel exists, is linked from README, and is actively read by a maintainer.
- First external PR that follows the documented process lands within 8 weeks of 1.0.

## Out of scope
- Actual code review of external contributions — happens organically per PR, not governed by this epic.
- Release automation and CI pipelines — see Epic 5. This epic writes the policy the automation enforces.
- Documentation content on the docs site itself — see Epic 4. This epic covers repo-root and `.github/` project-meta files.
- Contributor recruitment and community growth programs — post-1.0 concern.
- Moderation of the discussion channel beyond initial setup and category structure.
- Trademark registration, formal legal entity, or any step beyond MIT license + brand-use guidelines.

## Features

### Feature 7.1: CONTRIBUTING.md
A repo-root `CONTRIBUTING.md` that walks a would-be contributor from "cloned the repo" to "PR merged". Covers local setup (Node version, install, build, test commands), branch naming, commit message format, the PR template and review expectations, merge strategy, and cross-links to `CONTRIBUTING-THEMES.md` for theme-specific contributions (owned by Epic 2).

#### User Stories

**US-7.1.1** — As a new contributor, I want a single `CONTRIBUTING.md` that covers local setup, test commands, and PR expectations, so that I can ship my first PR without reverse-engineering the project.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`CONTRIBUTING.md` at repo root).
- [ ] Covers clone, install, dev server, build, and test commands with exact copy-pastable invocations.
- [ ] States branch naming convention and commit message format.
- [ ] Links to the PR template and describes review expectations.
- [ ] Readable and actionable — not just boilerplate copy.
- [ ] Cross-linked from README.

**Priority:** P0
**Effort:** 3
**Role:** new contributor

**US-7.1.2** — As a theme author, I want `CONTRIBUTING.md` to point me at the theme-specific contribution guide, so that I follow the theme-author path instead of the library-contributor path.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`CONTRIBUTING.md` at repo root).
- [ ] Contains a "Contributing a theme" section that links to `CONTRIBUTING-THEMES.md`.
- [ ] States clearly which contribution type uses which guide.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P0
**Effort:** 1
**Role:** theme author

**US-7.1.3** — As a maintainer, I want the commit message format documented (Conventional Commits), so that release automation (Epic 5) can derive changelog entries and SemVer bumps mechanically.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`CONTRIBUTING.md` at repo root).
- [ ] Documents the chosen commit format with examples for feat, fix, docs, refactor, chore, and breaking-change footer.
- [ ] Cross-references the SemVer policy (Feature 7.7) and changelog format (Feature 7.9).
- [ ] Uses an existing recognized template (Conventional Commits) where one exists.

**Priority:** P0
**Effort:** 1
**Role:** maintainer

---

### Feature 7.2: CODE_OF_CONDUCT.md
A repo-root `CODE_OF_CONDUCT.md` adopting Contributor Covenant 2.1 (or current stable version) with a real, monitored reporting channel — not a "coming soon" placeholder. Enforcement steps stated so it is not purely aspirational.

#### User Stories

**US-7.2.1** — As a visitor evaluating project health, I want to see a recognizable Code of Conduct at the conventional path, so that I can trust the project takes community norms seriously.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`CODE_OF_CONDUCT.md` at repo root).
- [ ] Uses an existing recognized template (Contributor Covenant 2.1).
- [ ] Cross-linked from README and CONTRIBUTING.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P0
**Effort:** 1
**Role:** visitor evaluating project health

**US-7.2.2** — As someone who needs to report a violation, I want a real, monitored reporting channel, so that my report reaches a human who will act on it.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`CODE_OF_CONDUCT.md` at repo root).
- [ ] Reporting section states a real email address (not a placeholder) and a stated response SLA.
- [ ] Enforcement ladder documents steps and consequences.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P0
**Effort:** 1
**Role:** someone who needs to report a violation

---

### Feature 7.3: SECURITY.md
A repo-root `SECURITY.md` describing responsible-disclosure procedure: how to contact privately, expected acknowledgement SLA, supported versions, typical disclosure timeline, and credit policy. Wired to GitHub's security advisory feature.

#### User Stories

**US-7.3.1** — As a security researcher, I want a `SECURITY.md` with a private contact and SLA, so that I can report a vulnerability without posting it publicly.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`SECURITY.md` at repo root).
- [ ] States a real private contact (email or GitHub security advisory link).
- [ ] States acknowledgement SLA and expected fix timeline.
- [ ] Readable and actionable — not just boilerplate copy.
- [ ] Cross-linked from README.

**Priority:** P0
**Effort:** 1
**Role:** security researcher

**US-7.3.2** — As a security researcher, I want the supported-versions table and disclosure timeline stated, so that I know which versions qualify for a fix and when I can publish.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`SECURITY.md` at repo root).
- [ ] Supported-versions section lists which release lines receive security fixes.
- [ ] Disclosure timeline states when a researcher may publish post-fix.
- [ ] Credit / acknowledgement policy stated.
- [ ] Uses an existing recognized template (GitHub security advisory template) where one exists.

**Priority:** P0
**Effort:** 1
**Role:** security researcher

**US-7.3.3** — As a maintainer, I want the private advisory workflow (GitHub Security Advisories) enabled and documented, so that a report moves through a repeatable process instead of ad-hoc email.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`SECURITY.md` at repo root).
- [ ] Repo has GitHub Security Advisories enabled.
- [ ] `SECURITY.md` describes the advisory intake and coordination flow.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P0
**Effort:** 1
**Role:** maintainer

---

### Feature 7.4: Issue templates
YAML-form issue templates under `.github/ISSUE_TEMPLATE/` — `bug_report.yml`, `feature_request.yml`, `question.yml` — each with required fields (version, environment, reproduction, expected/actual), a short description, and labels applied automatically.

#### User Stories

**US-7.4.1** — As a new contributor reporting a bug, I want a structured bug-report form, so that I provide the repro information a maintainer needs without guessing.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`.github/ISSUE_TEMPLATE/bug_report.yml`).
- [ ] Required fields: version, environment, steps to reproduce, expected result, actual result.
- [ ] Auto-applies a `bug` label on submission.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P0
**Effort:** 1
**Role:** new contributor reporting a bug

**US-7.4.2** — As a new contributor proposing a feature, I want a feature-request form that asks for problem statement and proposed solution, so that I describe the need before the implementation.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`.github/ISSUE_TEMPLATE/feature_request.yml`).
- [ ] Required fields: problem, proposed solution, alternatives considered.
- [ ] Auto-applies an `enhancement` label on submission.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P0
**Effort:** 1
**Role:** new contributor proposing a feature

**US-7.4.3** — As a visitor with a usage question, I want a question template that points me at the discussion channel first, so that I use the right channel for support vs. bug reports.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`.github/ISSUE_TEMPLATE/question.yml` or `.github/ISSUE_TEMPLATE/config.yml`).
- [ ] Redirects usage questions to the chosen discussion channel (Feature 7.10).
- [ ] Auto-applies a `question` label or closes with a pointer template.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** visitor with a usage question

---

### Feature 7.5: PR template
A `.github/pull_request_template.md` with summary, related-issue link, test plan, screenshots for visual changes, and a contributor checklist (lint, tests, docs updated, changelog fragment added).

#### User Stories

**US-7.5.1** — As a new contributor, I want a PR template that tells me what to include, so that I do not submit a PR missing context the reviewer needs.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`.github/pull_request_template.md`).
- [ ] Prompts for summary, related issue, test plan, and screenshots when applicable.
- [ ] Readable and actionable — not just boilerplate copy.
- [ ] Cross-linked from `CONTRIBUTING.md`.

**Priority:** P0
**Effort:** 1
**Role:** new contributor

**US-7.5.2** — As a maintainer, I want a contributor checklist in the PR template, so that lint, tests, docs, and changelog updates are surfaced before review rather than discovered in review.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`.github/pull_request_template.md`).
- [ ] Checklist includes lint passes, tests added/updated, docs updated, changelog fragment added where required.
- [ ] Checklist items map to concrete commands or files.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P0
**Effort:** 1
**Role:** maintainer

---

### Feature 7.6: Funding / sponsors
A `.github/FUNDING.yml` listing GitHub Sponsors (and optionally Open Collective, Buy Me a Coffee) so the "Sponsor" button appears on the repo page. A short sponsors section on README naming active sponsors.

#### User Stories

**US-7.6.1** — As a sponsor or funder, I want a visible "Sponsor" button on the repo, so that I can back the project through a familiar channel.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`.github/FUNDING.yml`).
- [ ] Enables at least GitHub Sponsors; other channels listed as available.
- [ ] Sponsor button is visible on the repo page.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** sponsor or funder

**US-7.6.2** — As a visitor evaluating project health, I want a sponsors section in the README, so that I see the project is backed and who backs it.

**Acceptance criteria:**
- [ ] README has a "Sponsors" or "Backers" section with links to active sponsors.
- [ ] Section rules explain sponsor tier benefits (logo placement, naming).
- [ ] Cross-linked from README.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P2
**Effort:** 1
**Role:** visitor evaluating project health

---

### Feature 7.7: SemVer policy
A `VERSIONING.md` (or dedicated section in `CONTRIBUTING.md`) stating how css-is-awesome applies Semantic Versioning to a CSS framework: what counts as patch, minor, major. Covers mixin additions/renames, token defaults, utility class renames, breaking visual changes, and semantic aliases.

#### User Stories

**US-7.7.1** — As a maintainer, I want a SemVer policy I can apply to any change without judgment calls, so that version bumps are mechanical.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`VERSIONING.md` at repo root or a clearly anchored section of `CONTRIBUTING.md`).
- [ ] Rules cover: adding a new mixin (minor), renaming a public mixin (major), removing a mixin (major), changing a default value that changes rendered output (major), adding a semantic alias (patch), adding a utility class (minor), renaming a utility class (major).
- [ ] Examples accompany each rule.
- [ ] Uses an existing recognized template (SemVer 2.0.0) where one exists.
- [ ] Cross-linked from README and CONTRIBUTING.

**Priority:** P1
**Effort:** 3
**Role:** maintainer

**US-7.7.2** — As a user pinning a version, I want the SemVer policy to tell me what upgrading a patch or minor version can and cannot do to my rendered output, so that I know how safely I can `npm update`.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`VERSIONING.md` or anchored section).
- [ ] States rendered-output guarantees per bump type.
- [ ] Covers visual regressions separately from API regressions.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** user pinning a version

**US-7.7.3** — As a release manager, I want the SemVer policy wired to the commit message format, so that the release tool (Epic 5) can compute the next version from the commit log.

**Acceptance criteria:**
- [ ] Policy references the Conventional Commits types used (feat, fix, feat!, BREAKING CHANGE footer).
- [ ] Mapping from commit type to bump is explicit.
- [ ] Cross-linked from CONTRIBUTING.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** release manager

---

### Feature 7.8: Deprecation policy
A `DEPRECATION.md` (or section in `VERSIONING.md`) stating how deprecations work: how long deprecated APIs survive (e.g. two minor versions), how they are marked in code and docs, where deprecation notices appear (changelog, docs, console warning where applicable), and when they become hard removals.

#### User Stories

**US-7.8.1** — As a user, I want a deprecation policy stating how long old APIs survive after being deprecated, so that I can plan migration without being surprised.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`DEPRECATION.md` at repo root, or a clearly anchored section of `VERSIONING.md`).
- [ ] States minimum deprecation window before removal.
- [ ] States where deprecation notices appear (changelog, docs, runtime warnings if applicable).
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** user

**US-7.8.2** — As a maintainer, I want the deprecation policy to specify how a deprecated item is marked in source and in docs, so that deprecation is uniformly discoverable.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`DEPRECATION.md` or anchored section).
- [ ] States the SCSS/CSS source marker (comment convention) and docs marker (badge or callout).
- [ ] Readable and actionable — not just boilerplate copy.
- [ ] Cross-linked from CONTRIBUTING.

**Priority:** P1
**Effort:** 1
**Role:** maintainer

---

### Feature 7.9: Changelog format and adoption
Pick and document a changelog format — Keep a Changelog structure, entries grouped by Added/Changed/Deprecated/Removed/Fixed/Security — and wire it to the Conventional Commits flow. The file itself (`CHANGELOG.md`) exists today; this feature formalizes the format and the automation contract Epic 5 will implement.

#### User Stories

**US-7.9.1** — As a user reading `CHANGELOG.md`, I want a consistent format (Keep a Changelog), so that I can scan releases quickly and find breaking changes at a glance.

**Acceptance criteria:**
- [ ] `CHANGELOG.md` at repo root follows the Keep a Changelog structure.
- [ ] Every release entry groups changes under Added/Changed/Deprecated/Removed/Fixed/Security.
- [ ] Uses an existing recognized template (Keep a Changelog).
- [ ] Cross-linked from README.

**Priority:** P1
**Effort:** 1
**Role:** user reading `CHANGELOG.md`

**US-7.9.2** — As a release manager, I want the changelog format documented so Epic 5 automation can generate entries from Conventional Commits, so that changelog maintenance is not manual per release.

**Acceptance criteria:**
- [ ] `CONTRIBUTING.md` (or a dedicated `CHANGELOG-POLICY.md`) documents the format and the automation contract.
- [ ] Mapping from commit type to changelog section is explicit.
- [ ] States whether contributors add changelog fragments manually or rely on commit-derived generation.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** release manager

---

### Feature 7.10: Discussion channel
Enable GitHub Discussions on the repo with a minimal, committed category structure (e.g. Help, Ideas, Showcase, Announcements). Link from README. Pick one channel and commit — no "we also have a Discord and a Mastodon and a forum" sprawl before 1.0.

#### User Stories

**US-7.10.1** — As a visitor with a usage question, I want a discussion channel linked from the README, so that I have a support path other than filing an issue.

**Acceptance criteria:**
- [ ] GitHub Discussions is enabled on the repo.
- [ ] Categories exist for Help, Ideas, Showcase, and Announcements (or equivalent committed structure).
- [ ] Cross-linked from README.
- [ ] Issue templates (Feature 7.4) redirect usage questions here.

**Priority:** P1
**Effort:** 1
**Role:** visitor with a usage question

**US-7.10.2** — As a maintainer, I want a single committed discussion channel rather than several, so that community attention is not fragmented across platforms before the project has critical mass.

**Acceptance criteria:**
- [ ] Only one public discussion channel is linked from README at 1.0.
- [ ] Decision rationale (why this channel, not others) recorded in the project notes.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** maintainer

---

### Feature 7.11: Announcement plan
A pre-written, reviewed announcement kit for 1.0: where to post (Hacker News, r/webdev, r/css, Product Hunt, Dev.to, Hacker Newsletter, CSS-Tricks Almanac community, Mastodon web-dev tags), what the headline is, and the 1-paragraph pitch, 1-screen demo, and "why now" narrative.

#### User Stories

**US-7.11.1** — As a maintainer shipping 1.0, I want a pre-written announcement kit, so that launch day is executing a plan rather than drafting copy under pressure.

**Acceptance criteria:**
- [ ] Lives under `roadmap/launch/` or similar conventional path in the repo.
- [ ] Lists each target channel with headline, body copy, and any channel-specific format rules.
- [ ] Includes a canonical screenshot or demo URL.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P2
**Effort:** 3
**Role:** maintainer shipping 1.0

**US-7.11.2** — As a visitor evaluating the project via a launch post, I want the launch copy to state the "why now" (mixin-first, theme-token model, Bootstrap alternative) in one paragraph, so that I can decide whether to click through in ten seconds.

**Acceptance criteria:**
- [ ] Announcement kit contains a one-paragraph pitch approved by the project owner.
- [ ] Pitch emphasizes theme-as-one-file, mixin-first authoring, and Bootstrap migration path.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P2
**Effort:** 1
**Role:** visitor evaluating the project via a launch post

---

### Feature 7.12: Brand assets
A repo-root `brand/` folder (or `/brand` page on the docs site) shipping the logo SVG, wordmark, allowed/disallowed uses, color-on-light and color-on-dark variants, and a short "say you built something with css-is-awesome" snippet for community themes and press.

#### User Stories

**US-7.12.1** — As a sponsor or press outlet, I want logo and wordmark assets with allowed-use guidelines, so that I can represent the project accurately without asking.

**Acceptance criteria:**
- [ ] Lives at a conventional path (`brand/` at repo root, or `/brand` on the docs site linked from README).
- [ ] Ships SVG logo, SVG wordmark, and light/dark variants.
- [ ] Allowed/disallowed uses stated in a short `BRAND.md` or page section.
- [ ] Cross-linked from README.

**Priority:** P2
**Effort:** 3
**Role:** sponsor or press outlet

**US-7.12.2** — As a community theme author, I want a "Built with css-is-awesome" badge snippet, so that I can link back from my theme's readme or demo page.

**Acceptance criteria:**
- [ ] Brand assets folder/page includes a ready-to-paste badge snippet (HTML and markdown).
- [ ] Badge points to the canonical project URL.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P2
**Effort:** 1
**Role:** community theme author

---

### Feature 7.13: Maintainer onboarding
A `MAINTAINERS.md` (or section of `CONTRIBUTING.md`) for when anyone other than the original author holds commit rights: who the current maintainers are, how secrets are managed, the release procedure, issue triage guidelines, and the security-advisory workflow from the maintainer side.

#### User Stories

**US-7.13.1** — As a new maintainer, I want a `MAINTAINERS.md` covering secrets management, release procedure, and triage expectations, so that I can operate the project without shoulder-surfing the original author.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`MAINTAINERS.md` at repo root, or a clearly anchored section of `CONTRIBUTING.md`).
- [ ] Lists current maintainers and their areas.
- [ ] Covers secrets rotation and where secrets live (GitHub Actions, npm, domain registrar).
- [ ] Cross-references the release procedure (Epic 5) and security advisory workflow (Feature 7.3).
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P2
**Effort:** 3
**Role:** new maintainer

**US-7.13.2** — As a maintainer triaging issues, I want documented triage guidelines (labels, priority rules, close-stale policy), so that the issue tracker stays coherent as volume grows.

**Acceptance criteria:**
- [ ] Lives at the conventional path (`MAINTAINERS.md` or anchored section).
- [ ] Lists the label taxonomy and when each label applies.
- [ ] States priority rules (what makes an issue P0/P1/P2).
- [ ] States the stale-issue policy if any.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P2
**Effort:** 1
**Role:** maintainer triaging issues

---

### Feature 7.14: Release notes process
A documented release-notes process: who writes them (release manager), where they live (GitHub Releases + `CHANGELOG.md` + a `/docs/releases` page on the docs site), what they include (summary, migration notes for breaking changes, shout-outs, full changelog link), and when they publish relative to the tag.

#### User Stories

**US-7.14.1** — As a user on an existing version, I want release notes that call out breaking changes and migration steps, so that I can upgrade without reading the full changelog.

**Acceptance criteria:**
- [ ] Release notes process documented in `CONTRIBUTING.md` or a dedicated `RELEASING.md`.
- [ ] Template states that every major/minor release notes entry includes a "Breaking changes" section with migration steps.
- [ ] Release notes appear on GitHub Releases and the docs site `/docs/releases`.
- [ ] Cross-linked from README.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** user on an existing version

**US-7.14.2** — As a release manager, I want the release-notes template and timing rules documented, so that every release follows the same shape without ad-hoc copy per version.

**Acceptance criteria:**
- [ ] Release notes process documented at a conventional path.
- [ ] Template lists required sections: summary, highlights, breaking changes + migration, full changelog link, contributor thanks.
- [ ] Timing rule states when notes publish relative to the git tag and the npm publish.
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P1
**Effort:** 1
**Role:** release manager

**US-7.14.3** — As a contributor whose PR shipped, I want release notes to include contributor thanks, so that external contribution is recognized.

**Acceptance criteria:**
- [ ] Release notes template includes a "Thanks" or "Contributors" section.
- [ ] Process states how contributors are surfaced (derived from merged PRs or manual curation).
- [ ] Readable and actionable — not just boilerplate copy.

**Priority:** P2
**Effort:** 1
**Role:** contributor whose PR shipped

---

## Dependencies
- Blocked by: nothing. All of these artifacts are documents and GitHub config; none require library or site code to exist first. Most can land in parallel with any other epic.
- Blocks: 1.0 public launch. Shipping 1.0 without `CONTRIBUTING`, `CODE_OF_CONDUCT`, `SECURITY`, and the PR/issue templates leaves the project looking abandoned to anyone doing due diligence. The SemVer/deprecation/changelog policies gate Epic 5's release automation — that automation needs a policy to enforce.

## Priority
P0 (blocker for 1.0): Features 9.1 CONTRIBUTING, 9.2 Code of Conduct, 9.3 SECURITY, 9.4 Issue templates, 9.5 PR template.
P1 (wanted for 1.0): Features 9.6 Funding, 9.7 SemVer policy, 9.8 Deprecation policy, 9.9 Changelog format, 9.10 Discussion channel, 9.14 Release notes process.
P2 (post-1.0): Features 9.11 Announcement plan, 9.12 Brand assets, 9.13 Maintainer onboarding.
