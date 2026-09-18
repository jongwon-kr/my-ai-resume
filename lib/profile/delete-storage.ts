import type { SupabaseClient } from "@supabase/supabase-js";

import { AVATAR_BUCKET } from "@/lib/avatar/constants";
import { PORTFOLIO_MEDIA_BUCKET } from "@/lib/portfolio/constants";
import type { Database } from "@/types/database";

const PROFILE_BUCKETS = [AVATAR_BUCKET, PORTFOLIO_MEDIA_BUCKET];

async function emptyBucketFolder(
  supabase: SupabaseClient<Database>,
  bucket: string,
  profileId: string,
) {
  const { data, error } = await supabase.storage.from(bucket).list(profileId);

  if (error) {
    throw new Error(`[${bucket}] list failed: ${error.message}`);
  }

  const paths = (data ?? []).map((file) => `${profileId}/${file.name}`);
  if (paths.length === 0) {
    return;
  }

  const { error: removeError } = await supabase.storage
    .from(bucket)
    .remove(paths);

  if (removeError) {
    throw new Error(`[${bucket}] remove failed: ${removeError.message}`);
  }
}

/**
 * Deletes every uploaded file belonging to a profile.
 *
 * Must run *before* the `profiles` row is deleted. The storage RLS predicate is
 * `profile_owned_by_user((storage.foldername(name))[1]::uuid)`, so once the row
 * is gone the predicate is permanently false and not even the owner can remove
 * these files — while the public read policy (`USING (bucket_id = '...')`)
 * keeps serving them. Postgres FK cascades never reach `storage.objects`.
 *
 * Returns rather than throws: losing the files is bad, but blocking a profile
 * deletion behind a storage outage is worse. The caller surfaces the failure.
 */
export async function removeProfileStorage(
  supabase: SupabaseClient<Database>,
  profileId: string,
): Promise<{ ok: boolean }> {
  try {
    await Promise.all(
      PROFILE_BUCKETS.map((bucket) =>
        emptyBucketFolder(supabase, bucket, profileId),
      ),
    );
    return { ok: true };
  } catch (error) {
    console.error("[profile/delete-storage] cleanup failed", error);
    return { ok: false };
  }
}
