import { describe, expect, it } from "vitest";

import {
  PORTFOLIO_FILE_MAX_BYTES,
  PORTFOLIO_FILE_SIZE_MESSAGE,
  PORTFOLIO_FILE_TYPE_MESSAGE,
  PORTFOLIO_IMAGE_MAX_BYTES,
  PORTFOLIO_IMAGE_SIZE_MESSAGE,
  PORTFOLIO_IMAGE_TYPE_MESSAGE,
} from "@/lib/portfolio/constants";
import { validatePortfolioFile } from "@/lib/portfolio/validate-upload";

describe("validatePortfolioFile", () => {
  it("accepts an image within the limit", () => {
    expect(
      validatePortfolioFile("image", { size: 1024, type: "image/png" }),
    ).toBeNull();
  });

  it("rejects an oversized image", () => {
    expect(
      validatePortfolioFile("image", {
        size: PORTFOLIO_IMAGE_MAX_BYTES + 1,
        type: "image/png",
      }),
    ).toBe(PORTFOLIO_IMAGE_SIZE_MESSAGE);
  });

  it("rejects a non-image type for the image kind", () => {
    expect(
      validatePortfolioFile("image", { size: 1024, type: "application/pdf" }),
    ).toBe(PORTFOLIO_IMAGE_TYPE_MESSAGE);
  });

  it("accepts a PDF within the limit", () => {
    expect(
      validatePortfolioFile("file", { size: 1024, type: "application/pdf" }),
    ).toBeNull();
  });

  it("rejects an oversized PDF", () => {
    expect(
      validatePortfolioFile("file", {
        size: PORTFOLIO_FILE_MAX_BYTES + 1,
        type: "application/pdf",
      }),
    ).toBe(PORTFOLIO_FILE_SIZE_MESSAGE);
  });

  it("rejects an image uploaded as a file", () => {
    expect(
      validatePortfolioFile("file", { size: 1024, type: "image/png" }),
    ).toBe(PORTFOLIO_FILE_TYPE_MESSAGE);
  });

  it("rejects a blank MIME type", () => {
    expect(validatePortfolioFile("image", { size: 1024, type: "" })).toBe(
      PORTFOLIO_IMAGE_TYPE_MESSAGE,
    );
  });

  it("accepts a file exactly at the limit", () => {
    expect(
      validatePortfolioFile("image", {
        size: PORTFOLIO_IMAGE_MAX_BYTES,
        type: "image/webp",
      }),
    ).toBeNull();
  });
});
