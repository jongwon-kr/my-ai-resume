import { AVATAR_BUCKET } from "@/lib/avatar/constants";

/**
 * `<...>/avatars/<profileId>/<name>[?t=...]` -> `<profileId>/<name>`.
 *
 * Anchoring on the profile id means a tampered URL can never aim a delete at
 * another profile's folder, and stripping the query keeps the legacy `?t=`
 * cache-busted URLs working.
 */
export function avatarStoragePath(publicUrl: string, profileId: string) {
  const marker = `/${AVATAR_BUCKET}/${profileId}/`;
  const index = publicUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  const name = publicUrl.slice(index + marker.length).split("?")[0];

  return name ? `${profileId}/${name}` : null;
}
