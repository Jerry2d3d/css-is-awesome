"use client";
import { useRef, useState } from "react";
import { z } from "zod";
import styles from "./demo.module.scss";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  age: z.coerce.number().int("Whole numbers only.").min(13, "Must be 13 or older."),
});

export default function ZodDemo() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const data = Object.fromEntries(new FormData(form));
    const result = signupSchema.safeParse(data);

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0]);
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setSuccess(false);
      const firstField = form.querySelector<HTMLInputElement>(`[name="${result.error.issues[0].path[0]}"]`);
      firstField?.focus();
      return;
    }

    setErrors({});
    setSuccess(true);
  }

  return (
    <form ref={formRef} noValidate onSubmit={handleSubmit}>
      <div className={styles.field} data-invalid={!!errors.email}>
        <label htmlFor="demo-zod-email">Email</label>
        <input id="demo-zod-email" name="email" aria-describedby="demo-zod-email-error" />
        <span className={styles.fieldError} id="demo-zod-email-error">
          {errors.email}
        </span>
      </div>

      <div className={styles.field} data-invalid={!!errors.age}>
        <label htmlFor="demo-zod-age">Age</label>
        <input id="demo-zod-age" name="age" type="number" inputMode="numeric" aria-describedby="demo-zod-age-error" />
        <span className={styles.fieldError} id="demo-zod-age-error">
          {errors.age}
        </span>
      </div>

      {success && (
        <p role="status">Valid — parsed as {"{ email: string, age: number }"}. Doesn&rsquo;t submit anywhere.</p>
      )}

      <button type="submit" className={styles.submit}>
        Continue
      </button>
    </form>
  );
}
