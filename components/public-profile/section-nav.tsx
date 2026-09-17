"use client";

import { useEffect, useRef, useState } from "react";

import {
  publicSectionElementId,
  type PublicSection,
} from "@/lib/public-profile/sections";
import { cn } from "@/lib/utils";

/** Sticky header (57px) plus breathing room. Must match `scroll-mt-20`. */
const SCROLL_OFFSET = 80;

export function SectionNav({
  sections,
  scrollRoot = null,
}: {
  sections: PublicSection[];
  /** Scrollable ancestor. `null` means the page itself scrolls. */
  scrollRoot?: HTMLElement | null;
}) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const visibleRef = useRef(new Map<number, boolean>());

  useEffect(() => {
    const visible = visibleRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(
            Number(entry.target.getAttribute("data-step-id")),
            entry.isIntersecting,
          );
        }

        // Entry order is not document order, so scan `sections` instead.
        const next = sections.find((section) => visible.get(section.id));
        if (next) {
          setActiveId(next.id);
        }
      },
      {
        root: scrollRoot,
        // Active band runs from just under the header down to 45% of the viewport.
        rootMargin: `-${SCROLL_OFFSET}px 0px -55% 0px`,
      },
    );

    for (const section of sections) {
      const element = document.getElementById(
        publicSectionElementId(section.id),
      );
      if (element) {
        observer.observe(element);
      }
    }

    // A short last section may never reach the band; pin it at the page end.
    const sentinel = document.getElementById("profile-sections-end");
    const endObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setActiveId(sections.at(-1)?.id ?? null);
        }
      },
      { root: scrollRoot },
    );
    if (sentinel) {
      endObserver.observe(sentinel);
    }

    return () => {
      observer.disconnect();
      endObserver.disconnect();
      visible.clear();
    };
  }, [sections, scrollRoot]);

  function handleJump(
    event: React.MouseEvent<HTMLAnchorElement>,
    stepId: number,
  ) {
    const element = document.getElementById(publicSectionElementId(stepId));
    if (!element) {
      return;
    }

    event.preventDefault();

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";

    if (scrollRoot) {
      scrollRoot.scrollTo({
        top:
          scrollRoot.scrollTop +
          element.getBoundingClientRect().top -
          scrollRoot.getBoundingClientRect().top -
          SCROLL_OFFSET,
        behavior,
      });
    } else {
      window.scrollTo({
        top:
          element.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET,
        behavior,
      });
      // Only the real page owns the URL; the builder must not get a hash.
      window.history.replaceState(
        null,
        "",
        `#${publicSectionElementId(stepId)}`,
      );
    }

    element.focus({ preventScroll: true });
    setActiveId(stepId);
  }

  return (
    <nav aria-label="프로필 목차" className="hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100vh-9rem)] overflow-y-auto rounded-2xl border bg-card/60 p-3 shadow-sm backdrop-blur">
        <p className="px-3 pb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          목차
        </p>
        <ol className="space-y-0.5">
          {sections.map((section) => {
            const active = section.id === activeId;

            return (
              <li key={section.id}>
                <a
                  href={`#${publicSectionElementId(section.id)}`}
                  aria-current={active ? "location" : undefined}
                  onClick={(event) => handleJump(event, section.id)}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
