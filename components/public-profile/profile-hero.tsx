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

const CHIP =
  "inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1.5 text-sm text-muted-foreground shadow-sm backdrop-blur";

const CHIP_LINK = `${CHIP} transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground`;

interface ProfileHeroProps {
  profile: PublicProfile;
  profileLinks: PublicProfileLink[];
}

export function ProfileHero({ profile, profileLinks }: ProfileHeroProps) {
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
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-start">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="size-24 shrink-0 rounded-2xl object-cover shadow-sm ring-1 ring-foreground/10 sm:size-28"
              />
            ) : (
              <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-brand-accent/15 text-3xl font-semibold text-primary shadow-sm ring-1 ring-foreground/10 sm:size-28">
                {profile.name.slice(0, 1)}
              </div>
            )}

            <div className="min-w-0 space-y-4">
              <div className="space-y-1.5">
                {profile.role_title ? (
                  <p className="text-sm font-medium text-primary">
                    {profile.role_title}
                  </p>
                ) : null}
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {profile.name}
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                  @{profile.slug}
                </p>
              </div>

              {profile.intro ? (
                <p className="max-w-2xl leading-relaxed text-muted-foreground">
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

          <div className="lg:shrink-0">
            <ShareButtons
              profileId={profile.id}
              slug={profile.slug}
              name={profile.name}
              roleTitle={profile.role_title}
              intro={profile.intro}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
