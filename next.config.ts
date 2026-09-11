import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Model IDs are not secrets; expose so the chat UI can read the same .env list.
  env: {
    GEMINI_MODEL: process.env.GEMINI_MODEL ?? "",
    GEMINI_MODELS: process.env.GEMINI_MODELS ?? "",
  },
};

export default nextConfig;
