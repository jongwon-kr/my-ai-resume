import {
  PORTFOLIO_FILE_ACCEPT,
  PORTFOLIO_FILE_MAX_BYTES,
  PORTFOLIO_FILE_SIZE_MESSAGE,
  PORTFOLIO_FILE_TYPE_MESSAGE,
  PORTFOLIO_IMAGE_ACCEPT,
  PORTFOLIO_IMAGE_MAX_BYTES,
  PORTFOLIO_IMAGE_SIZE_MESSAGE,
  PORTFOLIO_IMAGE_TYPE_MESSAGE,
} from "@/lib/portfolio/constants";

export type UploadKind = "image" | "file";

interface UploadCandidate {
  size: number;
  type: string;
}

const RULES: Record<
  UploadKind,
  { maxBytes: number; accept: string; sizeMessage: string; typeMessage: string }
> = {
  image: {
    maxBytes: PORTFOLIO_IMAGE_MAX_BYTES,
    accept: PORTFOLIO_IMAGE_ACCEPT,
    sizeMessage: PORTFOLIO_IMAGE_SIZE_MESSAGE,
    typeMessage: PORTFOLIO_IMAGE_TYPE_MESSAGE,
  },
  file: {
    maxBytes: PORTFOLIO_FILE_MAX_BYTES,
    accept: PORTFOLIO_FILE_ACCEPT,
    sizeMessage: PORTFOLIO_FILE_SIZE_MESSAGE,
    typeMessage: PORTFOLIO_FILE_TYPE_MESSAGE,
  },
};

/** Returns a Korean error message, or null when the file may be uploaded. */
export function validatePortfolioFile(
  kind: UploadKind,
  file: UploadCandidate,
): string | null {
  const rule = RULES[kind];

  if (!rule.accept.split(",").includes(file.type)) {
    return rule.typeMessage;
  }

  if (file.size > rule.maxBytes) {
    return rule.sizeMessage;
  }

  return null;
}

export const PORTFOLIO_ACCEPT_BY_KIND: Record<UploadKind, string> = {
  image: PORTFOLIO_IMAGE_ACCEPT,
  file: PORTFOLIO_FILE_ACCEPT,
};
