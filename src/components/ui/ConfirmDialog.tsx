"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export const CONFIRM_DIALOG_ANIMATION_MS = 280;

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Builds the standard destructive delete copy used across admin confirms. */
export function deleteConfirmDescription(
  entityLabel: string,
  name: string,
): string {
  return `Are you sure you want to delete the ${entityLabel} "${name}"? This action cannot be undone.`;
}

/**
 * Centered confirmation modal: rounded white card, cancel outline + red confirm.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [entered, setEntered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setEntered(false);
      setRendered(true);
      return;
    }

    setEntered(false);
    const timer = setTimeout(
      () => setRendered(false),
      CONFIRM_DIALOG_ANIMATION_MS,
    );
    return () => clearTimeout(timer);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !rendered) return;

    // Commit the closed styles before animating open (avoids first-open skip).
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (panel) void panel.getBoundingClientRect();
    if (backdrop) void backdrop.getBoundingClientRect();

    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => setEntered(true));
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [open, rendered]);

  useEffect(() => {
    if (!rendered) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !isPending) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered, isPending, onClose]);

  if (!mounted || !rendered) return null;

  const ease = "cubic-bezier(0.22, 1, 0.36, 1)";

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <button
        ref={backdropRef}
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          transitionDuration: `${CONFIRM_DIALOG_ANIMATION_MS}ms`,
          transitionTimingFunction: ease,
        }}
        aria-label={cancelLabel}
        disabled={isPending}
        onClick={() => {
          if (!isPending) onClose();
        }}
      />
      <div
        ref={panelRef}
        className={`relative z-[1] w-full max-w-md rounded-3xl bg-white p-6 shadow-xl transition-[opacity,transform] sm:p-7 ${
          entered
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.96] opacity-0"
        }`}
        style={{
          transitionDuration: `${CONFIRM_DIALOG_ANIMATION_MS}ms`,
          transitionTimingFunction: ease,
        }}
      >
        <h2
          id="confirm-dialog-title"
          className="text-xl font-semibold text-gray-900"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="mt-3 text-sm leading-relaxed text-gray-600"
        >
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="inline-flex h-10 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
