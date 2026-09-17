export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export const AVATAR_MAX_SIZE_MESSAGE =
  "프로필 사진은 5MB 이하만 업로드할 수 있습니다.";

export const AVATAR_TYPE_MESSAGE =
  "JPEG, PNG, WebP, GIF 형식만 업로드할 수 있습니다.";

export const AVATAR_BUCKET = "avatars";

/** The public hero, the crop editor and the OG card all render this ratio. */
export const AVATAR_ASPECT = 3 / 4;

/** The crop always fills the frame, so alpha is never needed. */
export const AVATAR_OUTPUT_TYPE = "image/jpeg";
export const AVATAR_OUTPUT_QUALITY = 0.9;
/** 600x800 — about 4x the widest display size, ~100KB at q0.9. */
export const AVATAR_OUTPUT_WIDTH = 600;

export const AVATAR_UPLOAD_FAILED_MESSAGE =
  "프로필 사진 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.";

export const AVATAR_CROP_FAILED_MESSAGE =
  "이미지를 자르지 못했습니다. 다른 파일을 선택해 주세요.";
