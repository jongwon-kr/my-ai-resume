"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger offset for siblings, in milliseconds. */
  delayMs?: number;
  className?: string;
}

/**
 * Fades content in when it first scrolls into view.
 *
 * `tw-animate-css`'s `animate-in` utilities fire on mount, which for anything
 * below the fold means the animation is over before the reader gets there — so
 * this observes instead.
 *
 * Toggles a DOM attribute rather than React state: there is no state the rest
 * of the tree needs, and it keeps the reveal out of the render cycle. Falls
 * back to visible whenever the effect cannot run (reduced motion, no
 * IntersectionObserver), so content is never stranded at opacity 0.
 */
export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const reveal = () => {
      node.dataset.revealed = "true";
    };

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "translate-y-2 opacity-0 transition-all duration-500 ease-out",
        "data-revealed:translate-y-0 data-revealed:opacity-100",
        "motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
