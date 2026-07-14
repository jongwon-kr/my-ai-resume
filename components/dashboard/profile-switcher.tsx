"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { CreateProfileDialog } from "@/components/dashboard/create-profile-dialog";
import { buttonVariants } from "@/components/ui/button";
import { getProfileDisplayLabel } from "@/lib/profile/display";
import type { UserProfileSummary } from "@/lib/profile/queries";
import { cn } from "@/lib/utils";

interface ProfileSwitcherProps {
  profiles: UserProfileSummary[];
  activeProfileId: string;
  canCreate: boolean;
  demoMode?: boolean;
}

export function ProfileSwitcher({
  profiles,
  activeProfileId,
  canCreate,
  demoMode = false,
}: ProfileSwitcherProps) {
  const router = useRouter();

  if (demoMode || (profiles.length <= 1 && !canCreate)) {
    return null;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {profiles.map((profile) => {
        const isActive = profile.id === activeProfileId;
        const label = getProfileDisplayLabel(profile);

        return (
          <Link
            key={profile.id}
            href={
              demoMode ? "/demo/dashboard" : `/dashboard?profile=${profile.id}`
            }
            className={cn(
              buttonVariants({
                variant: isActive ? "default" : "outline",
                size: "sm",
              }),
              "max-w-[12rem] truncate",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}

      {canCreate && !demoMode ? (
        <CreateProfileDialog
          onCreated={(profileId) => {
            router.push(`/dashboard/edit/${profileId}`);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
