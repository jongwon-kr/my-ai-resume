import {
  AVATAR_ACCEPT,
  AVATAR_MAX_BYTES,
  AVATAR_MAX_SIZE_MESSAGE,
  AVATAR_TYPE_MESSAGE,
} from "@/lib/avatar/constants";

interface UploadCandidate {
  size: number;
  type: string;
}

/**
 * Returns a Korean error message, or null when the file may be uploaded.
 * Mirrors `lib/portfolio/validate-upload.ts`.
 */
export function validateAvatarFile(file: UploadCandidate): string | null {
  if (!AVATAR_ACCEPT.split(",").includes(file.type)) {
    return AVATAR_TYPE_MESSAGE;
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return AVATAR_MAX_SIZE_MESSAGE;
  }

  return null;
}
