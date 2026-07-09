import { describe, expect, it } from "vitest";

import { isAdminUser, getUserRole } from "@/lib/auth/admin";

describe("isAdminUser", () => {
  it("returns true when app_metadata.role is admin", () => {
    expect(
      isAdminUser({
        id: "1",
        app_metadata: { role: "admin" },
      } as never),
    ).toBe(true);
  });

  it("returns false for non-admin users", () => {
    expect(
      isAdminUser({
        id: "1",
        app_metadata: { role: "user" },
      } as never),
    ).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });

  it("reads role via getUserRole", () => {
    expect(
      getUserRole({
        id: "1",
        app_metadata: { role: "admin" },
      } as never),
    ).toBe("admin");
  });
});
