"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "確認",
  cancelLabel = "キャンセル",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <button
            aria-label="閉じる"
            className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm cursor-default"
            onClick={onCancel}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="card relative w-full max-w-sm p-6"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex items-start gap-3">
              {danger && (
                <span className="shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </span>
              )}
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  {title}
                </h3>
                {message && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-ghost" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button
                className={
                  danger
                    ? "inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 active:scale-[.98]"
                    : "btn-primary"
                }
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
