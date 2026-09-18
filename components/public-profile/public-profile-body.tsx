import { ProfileHero } from "@/components/public-profile/profile-hero";
import { ResumePanel } from "@/components/public-profile/resume-panel";
import { SectionNav } from "@/components/public-profile/section-nav";
import { getVisiblePublicSections } from "@/lib/public-profile/sections";
import type { PublicProfileData } from "@/lib/public-profile/types";
import { themeToCssVars } from "@/lib/theme/css-vars";
import { cn } from "@/lib/utils";

interface PublicProfileBodyProps {
  data: PublicProfileData;
  /** Off in the builder preview: every share action targets a live URL. */
  showShare?: boolean;
  /** Scrollable ancestor when the body is not the page (builder preview). */
  scrollRoot?: HTMLElement | null;
  /**
   * Lays out as if the viewport were a phone.
   *
   * A preview box narrowed with CSS is still inside a wide window, and
   * Tailwind's `lg:` variants key off the viewport — so without this the mobile
   * preview keeps the desktop two-column layout and squeezes the résumé into a
   * sliver. Only the design customizer sets it.
   */
  narrow?: boolean;
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
  narrow = false,
}: PublicProfileBodyProps) {
  // Computed once so the rail can never list a section the body does not render.
  const sections = getVisiblePublicSections(data);
  const hasRail = sections.length > 1 && !narrow;

  const theme = data.themeConfig;

  return (
    // The one place the profile theme is applied. Because the CSS variables
    // shadow the very names `globals.css` sets on `:root`, every component
    // below follows along with no class changes; the `data-*` attributes carry
    // the choices that are not colours. `group/theme` lets descendants opt in
    // with `group-data-[…]/theme:` variants.
    <div
      className="group/theme"
      data-theme-preset={theme.preset}
      data-avatar-shape={theme.avatarShape}
      data-card-style={theme.cardStyle}
      data-header-style={theme.headerStyle}
      style={themeToCssVars(theme)}
    >
      <ProfileHero
        profile={data.profile}
        profileLinks={data.profileLinks}
        showShare={showShare}
        narrow={narrow}
      />

      <div
        className={cn(
          // `grid-cols-1` is load-bearing: a grid with no explicit track
          // sizes its column to max-content and long words widen the page.
          "mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 py-10 sm:px-6",
          narrow ? "py-10" : "lg:py-14",
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
    </div>
  );
}
