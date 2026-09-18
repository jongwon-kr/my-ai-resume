import {
  CalendarDaysIcon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";

import { ShareButtons } from "@/components/public-profile/share-buttons";
import type {
  PublicProfile,
  PublicProfileLink,
} from "@/lib/public-profile/types";
import { cn } from "@/lib/utils";

// `max-w-full` + `break-all` keep a long email or link inside the hero column.
const CHIP =
  "inline-flex max-w-full items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1.5 text-sm break-all text-muted-foreground shadow-sm backdrop-blur";

const CHIP_LINK = `${CHIP} transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground`;

/**
 * Fixed 3:4 portrait so the frame matches the crop editor exactly and fills the
 * height of the intro column instead of leaving dead space under a square.
 *
 * `self-start` is load-bearing: `aspect-ratio` leaves the height `auto`, so a
 * stretching flex row would override the ratio and silently re-crop the photo.
 */
const AVATAR_FRAME = [
  "aspect-[3/4] w-32 shrink-0 self-start rounded-2xl shadow-sm ring-1 ring-foreground/10 sm:w-36 lg:w-40",
  // Theme shapes. `circle`/`square` re-frame the stored 3:4 pixels to a square
  // anchored at the top — faces sit high in a portrait, so cropping from the
  // bottom keeps the head. The saved image, AVATAR_ASPECT and the crop dialog
  // are untouched, so switching shape never re-crops the original.
  "group-data-[avatar-shape=circle]/theme:aspect-square group-data-[avatar-shape=circle]/theme:rounded-full group-data-[avatar-shape=circle]/theme:object-top",
  "group-data-[avatar-shape=square]/theme:aspect-square group-data-[avatar-shape=square]/theme:rounded-none group-data-[avatar-shape=square]/theme:object-top",
].join(" ");

interface ProfileHeroProps {
  profile: PublicProfile;
  profileLinks: PublicProfileLink[];
  /** Off in the builder preview: sharing and reporting need a live profile. */
  showShare?: boolean;
  /** Phone layout regardless of viewport — see PublicProfileBody. */
  narrow?: boolean;
}

export function ProfileHero({
  profile,
  profileLinks,
  showShare = true,
  narrow = false,
}: ProfileHeroProps) {
  const socialLinks = profileLinks
    .filter((link) => link.url?.trim())
    .map((link) => ({
      id: link.id,
      label: link.label.trim() || "링크",
      url: link.url.trim(),
    }));

  return (
    <section className="relative overflow-hidden border-b">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-brand-accent/5 to-transparent"
      />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 group-data-[header-style=spacious]/theme:py-16 sm:px-6 lg:py-14 lg:group-data-[header-style=spacious]/theme:py-24">
        <div
          className={cn(
            "flex flex-col gap-8",
            !narrow && "lg:flex-row lg:items-start lg:justify-between",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 flex-col gap-6",
              !narrow && "sm:flex-row sm:items-start",
            )}
          >
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className={`${AVATAR_FRAME} object-cover`}
              />
            ) : (
              <div
                className={`${AVATAR_FRAME} flex items-center justify-center bg-gradient-to-br from-primary/15 to-brand-accent/15 text-4xl font-semibold text-primary sm:text-5xl`}
              >
                {profile.name.slice(0, 1)}
              </div>
            )}

            <div className="min-w-0 space-y-4">
              <div className="space-y-1.5">
                {profile.role_title ? (
                  <p className="text-sm font-medium break-words text-primary">
                    {profile.role_title}
                  </p>
                ) : null}
                <h1 className="text-3xl font-bold tracking-tight break-words sm:text-4xl">
                  {profile.name}
                </h1>
                <p className="font-mono text-sm break-all text-muted-foreground">
                  @{profile.slug}
                </p>
              </div>

              {profile.intro ? (
                <p className="max-w-2xl leading-relaxed break-words text-muted-foreground">
                  {profile.intro}
                </p>
              ) : null}

              <ul className="flex flex-wrap gap-2">
                {profile.ageLabel ? (
                  <li className={CHIP}>
                    <CalendarDaysIcon
                      aria-hidden
                      className="size-3.5 shrink-0 opacity-70"
                    />
                    {profile.ageLabel.replace(/입니다$/, "")}
                  </li>
                ) : null}
                {profile.location ? (
                  <li className={CHIP}>
                    <MapPinIcon
                      aria-hidden
                      className="size-3.5 shrink-0 opacity-70"
                    />
                    {profile.location}
                  </li>
                ) : null}
                {profile.public_email ? (
                  <li>
                    <a
                      href={`mailto:${profile.public_email}`}
                      className={CHIP_LINK}
                    >
                      <MailIcon
                        aria-hidden
                        className="size-3.5 shrink-0 opacity-70"
                      />
                      {profile.public_email}
                    </a>
                  </li>
                ) : null}
                {profile.phone ? (
                  <li className={CHIP}>
                    <PhoneIcon
                      aria-hidden
                      className="size-3.5 shrink-0 opacity-70"
                    />
                    {profile.phone}
                  </li>
                ) : null}
                {socialLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={CHIP_LINK}
                    >
                      <ExternalLinkIcon
                        aria-hidden
                        className="size-3.5 shrink-0 opacity-70"
                      />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {showShare ? (
            <div className="lg:shrink-0">
              <ShareButtons
                profileId={profile.id}
                slug={profile.slug}
                name={profile.name}
                roleTitle={profile.role_title}
                intro={profile.intro}
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
