import { formatPublicAgeLabel } from "@/lib/resume/format-age-band";
import type { Tables } from "@/types/database";

type RawProfile = Pick<
  Tables<"profiles">,
  "phone" | "birth_year" | "show_phone" | "show_exact_age"
>;

export interface SanitizedPrivacyFields {
  /** Null unless the owner opted to show it. */
  phone: string | null;
  /** Pre-rendered on the server, e.g. "30대 초반입니다". */
  ageLabel: string | null;
}

/**
 * Strips raw PII before the profile is serialized to the client.
 *
 * `birth_year` is dropped entirely rather than merely hidden: the public page
 * is a client component, so anything left on the object ships in the RSC
 * payload even when nothing renders it. The age band is therefore computed
 * here instead of in the view.
 */
export function sanitizePublicProfile<T extends RawProfile>(
  profile: T,
): Omit<T, "phone" | "birth_year"> & SanitizedPrivacyFields {
  const { birth_year, phone, ...rest } = profile;

  return {
    ...rest,
    phone: profile.show_phone ? phone : null,
    ageLabel: formatPublicAgeLabel(birth_year, profile.show_exact_age ?? false),
  };
}
