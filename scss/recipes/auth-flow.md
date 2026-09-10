---
name: auth-flow
description: The submit → loading → success/error flow around a login or register form — session model, redirect banner, and error handling, not field validation.
category: auth
complexity: medium
cia-version: ">=1.0.0"
---

## Use this when

You're building a login or register screen and have already solved field-level validation (see [`form-validation-html5`](./form-validation-html5.md) or [`form-validation-react-hook-form`](./form-validation-react-hook-form.md) for that half). This recipe covers what happens *around* the form: disable it while submitting, show a specific error if the server rejects it, and on success either redirect with a banner (register → login) or establish a session (login → app). Getting this flow right matters as much as field validation — a form that silently hangs on submit, or resets to blank on error, loses more users than a missing `pattern` attribute ever will.

## Structure (raw HTML)

```html
<form data-cia-recipe="auth-flow" novalidate>
  <div data-slot="banner" data-variant="success" hidden role="status">
    Account created successfully! Please log in.
  </div>
  <div data-slot="banner" data-variant="error" hidden role="alert">
    Invalid email or password.
  </div>

  <div data-slot="field">
    <label for="auth-email">Email</label>
    <input id="auth-email" name="email" type="email" required autocomplete="email" />
  </div>
  <div data-slot="field">
    <label for="auth-password">Password</label>
    <input id="auth-password" name="password" type="password" required autocomplete="current-password" />
  </div>

  <button type="submit" data-slot="submit">Log in</button>
</form>
```

Notes on the markup:
- Both banners exist in the markup `hidden` by default; the submit handler reveals exactly one, it never renders both or leaves a stale one from a previous attempt visible.
- `role="status"` on the success banner and `role="alert"` on the error banner are deliberately different roles — `alert` interrupts (assertive), `status` doesn't (polite). An error deserves the interruption; "account created" doesn't need to steal focus from what the user does next.
- `novalidate` on the `<form>` is only there because this recipe's own example has no client validation to demonstrate — a real form built on `form-validation-html5` keeps native validation and layers this flow on top of it, not instead of it.

## Styling (cia mixins)

```scss
// AuthFlow.module.scss
@use 'css-is-awesome/api' as cia;

.auth-flow {
  @include cia.stack($gap: 4);
  max-width: 24rem;
}

[data-slot="banner"] {
  @include cia.pad(3);
  border-radius: cia.radius(md);
  font-size: 0.875rem;

  &[data-variant="success"] { background: cia.color(success-subtle); color: cia.color(success-text); }
  &[data-variant="error"]   { background: cia.color(error-subtle);   color: cia.color(error-text); }
}

[data-slot="field"] {
  @include cia.stack($gap: 1);

  label { @include cia.font(medium, 1); }
  input { @include cia.input-base; }
}

[data-slot="submit"] {
  @include cia.btn(primary);

  &[disabled] { cursor: progress; opacity: 0.7; }
}
```

## Interactivity

The state machine is four states, always in this order: **idle → submitting → success | error**.

1. **Submit** — `preventDefault()`, hide any existing banner, set `submitting = true` (disable every input + the submit button, swap the button label to a progress state).
2. **Request** — `fetch()` the auth endpoint with the two session models below in mind.
3. **Success** —
   - Login: establish the session (the server already did, via cookie; or store the returned token), then navigate to the app.
   - Register: navigate to the login screen with a query flag (`?registered=true`) that the login screen reads on mount to reveal the success banner — this is how a redirect carries a message across a full navigation with no shared client state.
4. **Error** — reveal the error banner with the server's message (or a generic one on network failure), re-enable the form. **Never leave `submitting = true` on any exit path** — clear it in a `finally`, not just after success, so a form that doesn't navigate away (an SPA route that stays mounted, or an error) never gets stuck disabled with no explanation.

**Two session models** — pick one per backend, don't mix:

| | httpOnly cookie | Bearer token |
|---|---|---|
| Request | `fetch(url, { credentials: "include" })`, no token handling in JS | `fetch(url)`, then store the returned token yourself |
| XSS exposure | Token never reachable from JS — safer against XSS | Token sits in JS-reachable storage (memory/localStorage) — vulnerable if an XSS bug exists elsewhere |
| CSRF exposure | Needs a CSRF token/`SameSite` strategy — cookies ride along automatically | Not exposed to CSRF the same way — the token isn't sent automatically |
| Cross-origin API | Awkward — cookies are origin-scoped | Straightforward — attach the header wherever you call |

Neither is "correct" in the abstract — it's a property of your backend's session model, decided once, not per-request. A **register** submission typically sends neither (it doesn't establish a session — it creates an account, then hands off to a separate login step), so don't assume every auth POST needs credentials.

## A11y checklist

- [ ] The error banner is `role="alert"` (assertive, interrupts) and the success banner is `role="status"` (polite, doesn't) — using the same role for both misrepresents one of them ([WAI-ARIA: alert](https://www.w3.org/TR/wai-aria-1.2/#alert), [WAI-ARIA: status](https://www.w3.org/TR/wai-aria-1.2/#status))
- [ ] Every input is `disabled` while submitting, and the submit button's accessible name changes to reflect it ("Logging in…"), not just a visual spinner a screen reader can't see
- [ ] `disabled` is cleared on every exit path — success, error, and network failure alike — never left stuck ([WCAG 2.2 SC 4.1.3 Status Messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html))
- [ ] On a redirect that carries a success banner (register → login), focus moves to that banner (or it's announced via its `role="status"`) rather than silently appearing off-screen
- [ ] Error messages are specific enough to act on ("Invalid email or password") without revealing which part was wrong in a way that helps an attacker enumerate real accounts

## Framework examples

### React

```tsx
"use client";
import { useState } from "react";
import styles from "./AuthFlow.module.scss";

export default function LoginForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");
    const data = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Invalid email or password.");
        setStatus("error");
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    } finally {
      setStatus((s) => (s === "submitting" ? "idle" : s));
    }
  }

  return (
    <form className={styles.authFlow} onSubmit={handleSubmit} noValidate>
      {status === "error" && (
        <div role="alert" data-variant="error">
          {error}
        </div>
      )}
      <div data-slot="field">
        <label htmlFor="auth-email">Email</label>
        <input id="auth-email" name="email" type="email" required disabled={status === "submitting"} />
      </div>
      <div data-slot="field">
        <label htmlFor="auth-password">Password</label>
        <input id="auth-password" name="password" type="password" required disabled={status === "submitting"} />
      </div>
      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
```

### Vue

```vue
<script setup>
import { ref } from "vue";

const status = ref("idle");
const error = ref("");

async function handleSubmit(e) {
  status.value = "submitting";
  error.value = "";
  const data = new FormData(e.target);

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      error.value = body?.message ?? "Invalid email or password.";
      status.value = "error";
      return;
    }
    window.location.href = "/dashboard";
  } catch {
    error.value = "Something went wrong. Please try again.";
    status.value = "error";
  } finally {
    if (status.value === "submitting") status.value = "idle";
  }
}
</script>

<template>
  <form class="auth-flow" @submit.prevent="handleSubmit" novalidate>
    <div v-if="status === 'error'" role="alert" data-variant="error">{{ error }}</div>
    <div data-slot="field">
      <label for="auth-email">Email</label>
      <input id="auth-email" name="email" type="email" required :disabled="status === 'submitting'" />
    </div>
    <div data-slot="field">
      <label for="auth-password">Password</label>
      <input id="auth-password" name="password" type="password" required :disabled="status === 'submitting'" />
    </div>
    <button type="submit" :disabled="status === 'submitting'">
      {{ status === "submitting" ? "Logging in…" : "Log in" }}
    </button>
  </form>
</template>
```

### Svelte

```svelte
<script>
  let status = "idle";
  let error = "";

  async function handleSubmit(e) {
    status = "submitting";
    error = "";
    const data = new FormData(e.target);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        error = body?.message ?? "Invalid email or password.";
        status = "error";
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      error = "Something went wrong. Please try again.";
      status = "error";
    } finally {
      if (status === "submitting") status = "idle";
    }
  }
</script>

<form class="auth-flow" on:submit|preventDefault={handleSubmit} novalidate>
  {#if status === "error"}
    <div role="alert" data-variant="error">{error}</div>
  {/if}
  <div data-slot="field">
    <label for="auth-email">Email</label>
    <input id="auth-email" name="email" type="email" required disabled={status === "submitting"} />
  </div>
  <div data-slot="field">
    <label for="auth-password">Password</label>
    <input id="auth-password" name="password" type="password" required disabled={status === "submitting"} />
  </div>
  <button type="submit" disabled={status === "submitting"}>
    {status === "submitting" ? "Logging in…" : "Log in"}
  </button>
</form>
```

### Vanilla (Web Component)

```js
class AuthFlowForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form novalidate>
        <div data-slot="banner" data-variant="error" role="alert" hidden></div>
        <div data-slot="field">
          <label for="auth-email">Email</label>
          <input id="auth-email" name="email" type="email" required />
        </div>
        <div data-slot="field">
          <label for="auth-password">Password</label>
          <input id="auth-password" name="password" type="password" required />
        </div>
        <button type="submit">Log in</button>
      </form>
    `;
    this.querySelector("form").addEventListener("submit", (e) => this._submit(e));
  }

  async _submit(e) {
    e.preventDefault();
    const form = e.target;
    const banner = form.querySelector('[data-slot="banner"]');
    const button = form.querySelector("button");
    banner.hidden = true;
    button.disabled = true;
    button.textContent = "Logging in…";

    try {
      const data = new FormData(form);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        banner.textContent = body?.message ?? "Invalid email or password.";
        banner.hidden = false;
        return;
      }
      window.location.href = "/dashboard";
    } catch {
      banner.textContent = "Something went wrong. Please try again.";
      banner.hidden = false;
    } finally {
      button.disabled = false;
      button.textContent = "Log in";
    }
  }
}
customElements.define("auth-flow-form", AuthFlowForm);
```

## Pitfalls

- **Don't leave `disabled` set on a success path that doesn't navigate away.** If your success handler is a client-side route change rather than a full page navigation, the component stays mounted — clear the loading state in a `finally`, always, not only inside the error branch.
- **Don't reveal both banners, or a stale one.** Hide every banner at the start of every submit attempt, then reveal at most one based on the outcome.
- **Don't send `credentials: "include"` on a register request** unless your backend actually sets a cookie there — sending credentials nowhere they're read is a needless CORS complication for no benefit.

## Related recipes

- [`form-validation-html5`](./form-validation-html5.md) — field-level validation; pair with this recipe rather than duplicating it here
- [`otp-input`](./otp-input.md) — a natural next step after `auth-flow` for a 2FA or email-verification step
