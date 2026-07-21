"use client";

import { useEffect, useId, useRef, useState } from "react";

import { DROPDOWN_ANIMATION_MS } from "@/components/ui/SelectDropdown";

type IconDropdownProps = {
  label: string;
  trigger: React.ReactNode | ((open: boolean) => React.ReactNode);
  children: React.ReactNode;
  triggerClassName?: string;
  /** Where the menu opens relative to the trigger. Default: below. */
  menuPlacement?: "bottom" | "top";
};

const DEFAULT_TRIGGER_CLASS =
  "inline-flex h-11 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 pr-3 text-gray-800 shadow-sm transition-colors hover:border-gray-300";

export function IconDropdown({
  label,
  trigger,
  children,
  triggerClassName,
  menuPlacement = "bottom",
}: IconDropdownProps) {
  const [open, setOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (open) {
      setElevated(true);
      return;
    }
    const timer = setTimeout(() => setElevated(false), DROPDOWN_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const placementOpen =
    menuPlacement === "top"
      ? "bottom-full mb-2 origin-bottom"
      : "top-full mt-2 origin-top";
  const placementClosedTransform =
    menuPlacement === "top" ? "translate-y-1" : "-translate-y-1";

  return (
    <div
      ref={rootRef}
      className={elevated ? "relative z-50" : "relative z-0"}
    >
      <button
        type="button"
        className={triggerClassName ?? DEFAULT_TRIGGER_CLASS}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        {typeof trigger === "function" ? trigger(open) : trigger}
      </button>

      <div
        className={`absolute right-0 z-[100] grid min-w-40 transition-[grid-template-rows,opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] ${placementOpen} ${
          open
            ? "translate-y-0 grid-rows-[1fr] opacity-100"
            : `pointer-events-none grid-rows-[0fr] opacity-0 ${placementClosedTransform}`
        }`}
        style={{ transitionDuration: `${DROPDOWN_ANIMATION_MS}ms` }}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            id={menuId}
            role="menu"
            aria-label={label}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white py-2"
          >
            <div
              onClick={(event) => {
                // Closing unmounts interactive children. Form submits (e.g. logout)
                // must finish first; the following redirect navigates away.
                const target = event.target;
                if (
                  target instanceof Element &&
                  target.closest("form, button[type='submit']")
                ) {
                  return;
                }
                setOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return;
                }
                const target = event.target;
                if (
                  target instanceof Element &&
                  target.closest("form, button[type='submit']")
                ) {
                  return;
                }
                setOpen(false);
              }}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
