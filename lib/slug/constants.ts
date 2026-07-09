/** Slugs blocked from public profile URLs and routing conflicts. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "dashboard",
  "login",
  "logout",
  "onboarding",
  "signup",
  "signin",
  "signout",
  "www",
  "app",
  "static",
  "public",
  "settings",
  "help",
  "about",
  "demo",
  "_next",
]);

export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 20;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const SLUG_DEBOUNCE_MS = 500;
