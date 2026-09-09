"use client";
import { useForm } from "react-hook-form";
import styles from "./demo.module.scss";

type FormValues = { email: string; username: string };

export default function ReactHookFormDemo() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    setFocus,
  } = useForm<FormValues>({ mode: "onBlur" });

  const onValid = () => {
    // This demo doesn't submit anywhere real.
  };
  const onInvalid = () => {
    const first = Object.keys(errors)[0] as keyof FormValues | undefined;
    if (first) setFocus(first);
  };

  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate>
      <div className={styles.field} data-invalid={!!errors.email}>
        <label htmlFor="demo-rhf-email">Email</label>
        <input
          id="demo-rhf-email"
          aria-invalid={!!errors.email}
          aria-describedby="demo-rhf-email-error"
          {...register("email", {
            required: "Email is required.",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
          })}
        />
        <span className={styles.fieldError} id="demo-rhf-email-error">
          {errors.email?.message}
        </span>
      </div>

      <div className={styles.field} data-invalid={!!errors.username}>
        <label htmlFor="demo-rhf-username">Username</label>
        <input
          id="demo-rhf-username"
          aria-invalid={!!errors.username}
          aria-describedby="demo-rhf-username-error"
          {...register("username", {
            required: "Username is required.",
            minLength: { value: 3, message: "3+ characters." },
          })}
        />
        <span className={styles.fieldError} id="demo-rhf-username-error">
          {errors.username?.message}
        </span>
      </div>

      {isSubmitSuccessful && (
        <p role="status">Valid — this demo doesn&rsquo;t actually submit anywhere.</p>
      )}

      <button type="submit" className={styles.submit}>
        Create account
      </button>
    </form>
  );
}
