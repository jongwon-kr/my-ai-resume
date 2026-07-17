import type { PublicProfile } from "@/lib/public-profile/types";

type ProfileWithPrivacyFlags = Pick<
  PublicProfile,
  "phone" | "birth_year" | "show_phone" | "show_exact_age"
>;

export function sanitizePublicProfile<T extends ProfileWithPrivacyFlags>(
  profile: T,
): T {
  return {
    ...profile,
    phone: profile.show_phone ? profile.phone : null,
    birth_year: profile.show_exact_age ? profile.birth_year : null,
  };
}
