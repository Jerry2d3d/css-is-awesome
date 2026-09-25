---
title: A green check that proved nothing
date: 2026-09-18
tags: contract, ci, semver
---

A consumer reported that upgrading broke their theme validation. They were
right, and the break was mine: release 1.12.0 added a required token to the
theme contract while the contract version stayed put. The versioning policy in
this repo forbids exactly that in a minor, in writing, and I did it anyway.

What makes it worth a note is why nothing caught it.

The repository has a `validate-themes` check that runs on every push and had
been green the whole time. It validates the 24 themes that ship with the
library. All 24 declare the new token, because the same commit that required
it also added it to every one of them. So the check passed, and it would have
passed no matter how many required tokens I added, because the only themes it
ever sees are the ones edited in the same breath.

The check was not weak. It was answering a different question than the one I
believed it was answering. It proves the shipped themes are self-consistent.
It says nothing at all about a theme written by someone else, which is the
only population the contract exists to protect.

The fix was not a better theme validator. It was a second check that diffs
the contract against the last release tag and fails when the required list
grows without the major bump the policy demands. That one is at
`scripts/check-contract-growth.mjs`, and it was proven against a deliberately
broken contract before being trusted.

The token moved from required to optional the same day and shipped in 1.16.1.

I have started asking a different question of every check in this repo: not
"does it pass" but "what would have to be true for it to fail". Several of
them have no good answer.
