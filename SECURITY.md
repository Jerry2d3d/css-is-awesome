# Security Policy

Thanks for helping keep **css-is-awesome** and its users safe. This document describes how to report vulnerabilities and what to expect in return.

css-is-awesome is a pre-1.0 CSS / SCSS design system plus a Next.js docs site. The security surface is small: there is no authentication, no server-side data, and no user-input processing. The realistic concerns are:

- **XSS via user-contributed themes or icons.** Malicious CSS (`url(...)`, `content:`, animation-driven exfiltration) or crafted SVG (`<script>`, `on*` handlers, embedded foreignObject) shipped inside a theme file or icon set.
- **Dependency vulnerabilities.** Issues in our direct or transitive npm dependencies.
- **Future npm-package-level supply-chain issues** once we publish to the registry — typosquats, compromised publish tokens, post-install scripts.
- **Docs-site build pipeline.** The Next.js docs site builds in CI; a compromised build step could ship malicious CSS to readers.

## Supported versions

Security fixes land on `main` and the latest release line. We are pre-1.0, so older tagged releases are **not** backported.

| Version | Supported |
|---------|-----------|
| `main` (unreleased) | Yes |
| Pre-1.0 tagged releases | Best-effort, no backports |
| 1.0+ (when released) | Yes — details will be added to this policy |

Once 1.0 ships, this table will be updated to describe the support window for each minor line.

## Reporting a vulnerability

Please report privately. **Do not open a public GitHub issue** for security problems.

**Preferred — GitHub Security Advisories**

1. Go to the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Fill in the advisory form.

This keeps the discussion private until a fix is ready.

**Email fallback**

If you cannot use GitHub Security Advisories, email: **jhansenportfolio@gmail.com**

Please use the subject line `[css-is-awesome security]` so it routes correctly.

**Include in your report**

- A clear description of the issue.
- Reproduction steps (minimal repro preferred).
- Affected version, tag, or commit SHA.
- Suggested severity (CVSS v3.1 vector if possible).
- Impact — what an attacker can do.
- Any suggested fix or mitigation.

## No bug bounty

We do **not** run a paid bug-bounty program. There is no monetary reward for reports. Credit and a public thank-you in the advisory are the available forms of recognition. This may change if the project grows, but any change will be announced here before it takes effect.

## What to expect

We are a small project. These targets are honest commitments, not aspirational.

| Stage | Target |
|-------|--------|
| Acknowledgement of your report | 3 business days |
| Initial triage and severity assessment | 7 business days |
| Fix for Critical / High severity | 14 days (may request coordinated disclosure) |
| Fix for Medium severity | 30 days |
| Fix for Low severity | Best-effort, bundled with next minor release |

Reporters are credited in the published advisory unless they ask to remain anonymous.

If we accept the report, we will open a private security advisory and add you as a collaborator so you can see fix progress. If we dispute the report, we will explain why and — if you disagree — leave the thread open for discussion before closing.

## Scope

**In scope**

- Code in this repository — library SCSS, React components, the docs-site app.
- The `css-is-awesome` npm package once published.
- Build outputs shipped in the repo's releases.

**Out of scope**

- Third-party hosted copies or forks of the library or themes.
- End-user misuse of utility classes in their own applications.
- Denial-of-service affecting only a user's own deployment.
- Findings that require physical access to a developer's machine.
- Social-engineering of maintainers or contributors.

## Safe-harbor statement

We will not pursue legal action or file a report with law enforcement against researchers who report vulnerabilities in good faith, follow this policy, avoid privacy violations, data destruction, and service disruption, give us reasonable time to fix the issue before public disclosure, and do not exploit the vulnerability beyond what is necessary to confirm it.

If in doubt about whether a specific test is in scope, email first and ask.

## Public advisories

Once a fix ships, we publish a GitHub Security Advisory on the repository that includes:

- Affected versions.
- Patched version(s).
- Workarounds, if any.
- Credit to the reporter (unless anonymity was requested).
- CVE identifier, if one has been assigned.

## Coordinated disclosure

We prefer a **90-day** window from initial report to public disclosure. The window may be extended by mutual agreement for high-severity issues that need more coordination time — for example, when a downstream project also has to patch.

If you intend to present or publish research on a finding, please tell us the planned disclosure date in your initial report so we can align.

## Hardening notes for users

These are not vulnerabilities, but they affect whether using css-is-awesome is safe in your app:

- **Don't serve user-submitted SCSS, CSS, or SVG icons unsanitized.** Run third-party themes or icon packs through a sanitizer before shipping them to browsers.
- **Set a Content-Security-Policy** on pages that load our CSS. A strict `style-src` and `img-src` blocks the class of attacks that rely on injected `url(...)` or inline styles.
- **Pin your dependency version** (`"css-is-awesome": "1.2.3"` rather than `"^1.2.3"`) if you need reproducible builds, and use `npm audit` / `pnpm audit` in CI.

## See also

- [CONTRIBUTING.md](./CONTRIBUTING.md) — how to contribute code and docs.
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) — expected behavior in project spaces.

---

Thank you for taking the time to disclose responsibly.
