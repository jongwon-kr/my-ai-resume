import { ProfileHero } from "@/components/public-profile/profile-hero";
import { ResumePanel } from "@/components/public-profile/resume-panel";
import { SectionNav } from "@/components/public-profile/section-nav";
import { getVisiblePublicSections } from "@/lib/public-profile/sections";
import type { PublicProfileData } from "@/lib/public-profile/types";
import { cn } from "@/lib/utils";

interface PublicProfileBodyProps {
  data: PublicProfileData;
  /** Off in the builder preview: every share action targets a live URL. */
  showShare?: boolean;
  /** Scrollable ancestor when the body is not the page (builder preview). */
  scrollRoot?: HTMLElement | null;
}

/**
 * Hero, résumé and nav rail with no page chrome.
 *
 * Shared by the real public page and the builder's live preview so the two can
 * never drift on layout. Everything the preview must NOT run — the view
 * tracker, the site header, the watermark CTA and the chat launcher — stays in
 * `public-profile-view.tsx`, so it is structurally absent here.
 */
export function PublicProfileBody({
  data,
  showShare = true,
  scrollRoot = null,
}: PublicProfileBodyProps) {
  // Computed once so the rail can never list a section the body does not render.
  const sections = getVisiblePublicSections(data);
  const hasRail = sections.length > 1;

  return (
    <>
      <ProfileHero
        profile={data.profile}
        profileLinks={data.profileLinks}
        showShare={showShare}
      />

      <div
        className={cn(
          // `grid-cols-1` is load-bearing: a grid with no explicit track
          // sizes its column to max-content and long words widen the page.
          "mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:py-14",
          hasRail && "lg:grid-cols-[minmax(0,1fr)_14rem]",
        )}
      >
        {/* min-w-0 keeps pre-wrapped prose from blowing out the grid track. */}
        <div className="min-w-0 space-y-12">
          <ResumePanel data={data} sections={sections} />
        </div>
        {hasRail ? (
          <SectionNav sections={sections} scrollRoot={scrollRoot} />
        ) : null}
      </div>
    </>
  );
}
