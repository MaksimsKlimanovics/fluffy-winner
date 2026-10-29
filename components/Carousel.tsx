"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

/**
 * Swipeable row of cards: native horizontal scroll with snap points (so
 * touch, trackpad and keyboard all work), the next card peeking in, and a
 * page control below. Arrows appear only with a fine pointer.
 */
export function Carousel({
  label,
  slideLabel,
  prevLabel,
  nextLabel,
  children,
}: {
  label: string;
  /** e.g. (2, 3) => "2 / 3" */
  slideLabel: (index: number, count: number) => string;
  prevLabel: string;
  nextLabel: string;
  children: React.ReactNode;
}) {
  const slides = Children.toArray(children);
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // The slide whose left edge is closest to the track's left edge is the current one.
  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    let best = 0;
    let bestDist = Infinity;
    items.forEach((el, i) => {
      const d = Math.abs(el.offsetLeft - track.offsetLeft - track.scrollLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || "0"));
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActive(best);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(sync);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [sync]);

  const go = (index: number) => {
    const track = trackRef.current;
    const el = track?.children[index] as HTMLElement | undefined;
    if (!track || !el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: el.offsetLeft - track.offsetLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || "0"), behavior: reduce ? "auto" : "smooth" });
  };

  if (slides.length < 2) return <>{slides}</>;

  return (
    <div className="carousel" role="region" aria-roledescription="carousel" aria-label={label}>
      <div className="carousel-track" ref={trackRef} tabIndex={0}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className="carousel-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={slideLabel(i + 1, slides.length)}
          >
            {slide}
          </div>
        ))}
      </div>
      <div className="carousel-controls">
        <button type="button" className="carousel-arrow" onClick={() => go(active - 1)} disabled={active === 0} aria-label={prevLabel}>
          <Icon name="chevronLeft" size={18} />
        </button>
        <div className="dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === active ? "dot active" : "dot"}
              onClick={() => go(i)}
              aria-label={slideLabel(i + 1, slides.length)}
              aria-current={i === active ? "true" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="carousel-arrow"
          onClick={() => go(active + 1)}
          disabled={active === slides.length - 1}
          aria-label={nextLabel}
        >
          <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  );
}
