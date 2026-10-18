"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Bottom sheet in the iOS pattern, at a medium detent so the content above
 * stays visible and usable. Slides with the drawer curve, follows the finger
 * on the grabber, and dismisses on a flick (velocity > 0.11 px/ms) or a long
 * pull — with friction when pulled the wrong way.
 */
const FLICK_VELOCITY = 0.11;
const CLOSE_MS = 320;

export function Sheet({
  host,
  label,
  onClose,
  children,
}: {
  /** Element the sheet is positioned against (the page); rendered into it. */
  host: HTMLElement;
  label: string;
  onClose: () => void;
  /** Render prop: `grab` makes an element a drag handle, `close` animates the sheet out. */
  children: (api: { grab: React.HTMLAttributes<HTMLElement>; close: () => void }) => React.ReactNode;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(onClose, CLOSE_MS);
  }, [onClose]);

  useEffect(() => {
    sheetRef.current?.focus({ preventScroll: true });
  }, []);

  // Escape closes the sheet even when focus has moved off it (e.g. a button that disabled itself).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  const setOffset = (dy: number | null) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = dy === null ? "" : "none";
    el.style.transform = dy === null ? "" : `translateY(${dy}px)`;
  };

  const grabProps: React.HTMLAttributes<HTMLElement> = {
    onPointerDown: (e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (drag.current) return; // ignore extra touch points once a drag has begun
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      drag.current = { y: e.clientY, t: performance.now(), dy: 0 };
    },
    onPointerMove: (e) => {
      if (!drag.current) return;
      const raw = e.clientY - drag.current.y;
      // Pulling up past the detent meets increasing friction instead of a hard stop.
      const dy = raw >= 0 ? raw : -Math.sqrt(-raw) * 2;
      drag.current.dy = dy;
      setOffset(dy);
    },
    onPointerUp: () => {
      const d = drag.current;
      drag.current = null;
      if (!d) return;
      const velocity = d.dy / Math.max(1, performance.now() - d.t);
      const height = sheetRef.current?.offsetHeight ?? 400;
      setOffset(null);
      if (velocity > FLICK_VELOCITY || d.dy > height * 0.35) close();
    },
    onPointerCancel: () => {
      drag.current = null;
      setOffset(null);
    },
  };

  return createPortal(
    <div
      ref={sheetRef}
      className="sheet"
      data-closing={closing || undefined}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
    >
      <div className="sheet-grabber" {...grabProps} aria-hidden="true">
        <span />
      </div>
      {children({ grab: grabProps, close })}
    </div>,
    host,
  );
}
