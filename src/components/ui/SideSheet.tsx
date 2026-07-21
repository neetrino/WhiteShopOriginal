"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export const SIDE_SHEET_ANIMATION_MS = 280;

type SideSheetProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  /** Width classes applied to the docked panel (default: `w-full max-w-md`). */
  panelClassName?: string;
  side?: "left" | "right";
  zIndexClassName?: string;
  /** External circle (default) or MaMarie-style edge tab. */
  closeVariant?: "circle" | "edge-tab";
  /** Soften backdrop (cart-style). */
  backdropBlur?: boolean;
};

/**
 * Full-viewport-height side sheet docked to the left/right edge.
 * Portaled to `document.body` so admin overflow shells cannot clip or re-contain `fixed`.
 */
export function SideSheet({
  open,
  onClose,
  ariaLabel,
  children,
  panelClassName = "w-full max-w-md",
  side = "right",
  zIndexClassName = "z-50",
  closeVariant = "circle",
  backdropBlur = false,
}: SideSheetProps) {
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
    const timer = setTimeout(() => setRendered(false), SIDE_SHEET_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !rendered) {
      return;
    }

    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (panel) {
      void panel.getBoundingClientRect();
    }
    if (backdrop) {
      void backdrop.getBoundingClientRect();
    }

    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setEntered(true);
      });
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
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered, onClose]);

  if (!mounted || !rendered) return null;

  const isRight = side === "right";
  const closedTransform = isRight ? "translate-x-full" : "-translate-x-full";
  const edgeClass = isRight ? "right-0" : "left-0";
  const panelRadius = isRight
    ? "rounded-l-[var(--radius)]"
    : "rounded-r-[var(--radius)]";
  const closePosition = isRight ? "right-full" : "left-full";
  const CloseChevron = isRight ? ChevronLeft : ChevronRight;

  return createPortal(
    <div
      className={`fixed inset-0 ${zIndexClassName}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <button
        ref={backdropRef}
        type="button"
        className={`absolute inset-0 bg-black/40 transition-opacity ease-out ${
          backdropBlur ? "backdrop-blur-sm" : ""
        } ${entered ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDuration: `${SIDE_SHEET_ANIMATION_MS}ms` }}
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`fixed inset-y-0 ${edgeClass} z-[1] flex h-dvh max-h-dvh transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] ${
          entered ? "translate-x-0" : closedTransform
        } ${panelClassName}`}
        style={{ transitionDuration: `${SIDE_SHEET_ANIMATION_MS}ms` }}
      >
        {closeVariant === "edge-tab" ? (
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-1/2 ${closePosition} z-10 flex h-[38px] w-10 -translate-y-1/2 items-center justify-center bg-gray-900 text-white transition-transform hover:scale-105 ${
              isRight
                ? "rounded-l-full rounded-r-none"
                : "rounded-r-full rounded-l-none"
            }`}
            aria-label="Close"
          >
            <CloseChevron className="h-4 w-4" strokeWidth={2.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className={`absolute top-5 ${closePosition} z-10 flex h-10 w-10 shrink-0 items-center justify-center bg-gray-900 text-white transition-colors hover:bg-black ${
              isRight
                ? "rounded-l-full rounded-r-none"
                : "rounded-r-full rounded-l-none"
            }`}
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        )}
        <div
          className={`flex h-full min-h-0 w-full flex-col overflow-hidden bg-white shadow-2xl ${panelRadius}`}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
