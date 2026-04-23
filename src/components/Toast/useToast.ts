"use client";
import { useContext } from "react";
import { ToastContext } from "./ToastProvider";
import type { ToastContextValue } from "./ToastProvider";

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be called inside <ToastProvider>");
  }
  return ctx;
}

export default useToast;
