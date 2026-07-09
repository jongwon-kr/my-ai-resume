import { describe, expect, it } from "vitest";

import { REPORT_RATE_LIMIT_PER_HOUR } from "@/lib/reports/rate-limit";

describe("report rate limit constants", () => {
  it("limits reports per hour", () => {
    expect(REPORT_RATE_LIMIT_PER_HOUR).toBeGreaterThan(0);
    expect(REPORT_RATE_LIMIT_PER_HOUR).toBeLessThanOrEqual(10);
  });
});
