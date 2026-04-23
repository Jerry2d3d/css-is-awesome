"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import ThemePicker from "@/components/ThemePicker";
import styles from "./LaunchGate.module.scss";

type Flags = {
  version?: number;
  comingSoon?: boolean;
  comingSoonMessage?: string;
  announcement?: {
    active?: boolean;
    id?: string;
    status?: "info" | "success" | "warning" | "error";
    message?: string;
    href?: string;
  };
};

const DISMISSED_STORAGE_PREFIX = "cia-announcement-dismissed:";

export default function LaunchGate({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Flags | null>(null);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/flags.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Flags | null) => {
        if (cancelled) return;
        setFlags(data ?? {});
        const id = data?.announcement?.id;
        if (id && sessionStorage.getItem(DISMISSED_STORAGE_PREFIX + id)) {
          setAnnouncementDismissed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFlags({}); // treat fetch failure as "no flags"
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Noindex when coming soon
  useEffect(() => {
    if (flags?.comingSoon) {
      const meta = document.createElement("meta");
      meta.name = "robots";
      meta.content = "noindex, nofollow";
      document.head.appendChild(meta);
      return () => {
        document.head.removeChild(meta);
      };
    }
  }, [flags?.comingSoon]);

  // Coming-soon overlay — blocks the normal site
  if (flags?.comingSoon) {
    return (
      <div className={styles.overlay}>
        <div className={styles.overlayInner}>
          <h1 className={styles.overlayTitle}>Coming soon</h1>
          <p className={styles.overlayMessage}>
            {flags.comingSoonMessage ??
              "We're putting the finishing touches on css-is-awesome. Back very soon."}
          </p>
          <p className={styles.overlayHint}>
            Try the theme picker — the system works even while we're still building the site.
          </p>
        </div>
        <ThemePicker />
      </div>
    );
  }

  const a = flags?.announcement;
  const showAnnouncement =
    !!a?.active && !!a?.message && !announcementDismissed;

  const dismissAnnouncement = () => {
    if (a?.id) {
      try {
        sessionStorage.setItem(DISMISSED_STORAGE_PREFIX + a.id, "1");
      } catch {}
    }
    setAnnouncementDismissed(true);
  };

  return (
    <>
      {showAnnouncement && (
        <div
          className={[styles.announcement, styles[`status-${a!.status ?? "info"}`]].join(" ")}
          role={a!.status === "error" ? "alert" : "status"}
        >
          <span className={styles.announcementMessage}>{a!.message}</span>
          {a!.href && (
            <a
              className={styles.announcementLink}
              href={a!.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more →
            </a>
          )}
          <button
            type="button"
            className={styles.announcementDismiss}
            onClick={dismissAnnouncement}
            aria-label="Dismiss announcement"
          >
            ×
          </button>
        </div>
      )}
      {children}
      <ThemePicker />
    </>
  );
}
