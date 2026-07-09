"use client";

import { useEffect } from "react";

interface ProfileViewTrackerProps {
  profileId: string;
}

export function ProfileViewTracker({ profileId }: ProfileViewTrackerProps) {
  useEffect(() => {
    void fetch("/api/profile/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId }),
    });
  }, [profileId]);

  return null;
}
