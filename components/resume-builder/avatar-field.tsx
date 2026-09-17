"use client";

import { useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import {
  AvatarCropDialog,
  type CropSource,
} from "@/components/resume-builder/avatar-crop-dialog";
import { UploadDropzone } from "@/components/resume-builder/upload-dropzone";
import { Button } from "@/components/ui/button";
import {
  AVATAR_ACCEPT,
  AVATAR_UPLOAD_FAILED_MESSAGE,
} from "@/lib/avatar/constants";
import { validateAvatarFile } from "@/lib/avatar/validate-upload";
import { removeAvatar, uploadAvatar } from "@/lib/resume/persistence";
import type { ResumeFormValues } from "@/lib/resume/schema";
import { createClient } from "@/lib/supabase/client";
import { useResumeBuilderStore } from "@/stores/resume-builder-store";

/** Same frame as the public hero, so the editor shows what visitors will see. */
const PREVIEW_FRAME =
  "aspect-[3/4] w-24 rounded-2xl object-cover ring-1 ring-foreground/10";

export function AvatarField({ onBlurSave }: { onBlurSave: () => void }) {
  const profileId = useResumeBuilderStore((state) => state.profileId);
  const demoMode = useResumeBuilderStore((state) => state.demoMode);
  const { setValue, watch } = useFormContext<ResumeFormValues>();

  const avatarUrl = watch("avatar_url");
  // The picked bytes stay for the life of the page so "다시 자르기" needs no
  // re-pick. After a reload the user selects the file again.
  const [picked, setPicked] = useState<CropSource | null>(null);
  const [cropping, setCropping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pickedUrlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (pickedUrlRef.current) {
        URL.revokeObjectURL(pickedUrlRef.current);
      }
    },
    [],
  );

  function openCropper(file: File) {
    const validationError = validateAvatarFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);

    if (pickedUrlRef.current) {
      URL.revokeObjectURL(pickedUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    pickedUrlRef.current = url;
    setPicked({ url, blob: file });
    setCropping(true);
  }

  async function handleSave(cropped: Blob) {
    if (!profileId) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const publicUrl = await uploadAvatar(
        supabase,
        profileId,
        cropped,
        avatarUrl || null,
      );
      setValue("avatar_url", publicUrl, { shouldDirty: true });
      onBlurSave();
      setCropping(false);
    } catch (uploadError) {
      console.error(uploadError);
      setError(AVATAR_UPLOAD_FAILED_MESSAGE);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    if (!profileId || !avatarUrl) {
      return;
    }

    setError(null);

    try {
      const supabase = createClient();
      await removeAvatar(supabase, profileId, avatarUrl);
    } catch (removeError) {
      // The object may already be gone; the field still has to clear.
      console.error(removeError);
    }

    setValue("avatar_url", "", { shouldDirty: true });
    onBlurSave();
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">프로필 사진 (선택)</label>

      <div className="flex items-start gap-4">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="프로필 사진 미리보기"
            className={PREVIEW_FRAME}
          />
        ) : null}

        <div className="min-w-0 flex-1 space-y-2">
          <UploadDropzone
            accept={AVATAR_ACCEPT}
            busy={saving}
            label={
              avatarUrl
                ? "다른 사진을 끌어다 놓거나 클릭해서 선택"
                : "사진을 끌어다 놓거나 클릭해서 선택"
            }
            hint="JPEG · PNG · WebP · GIF · 최대 5MB · 3:4 세로로 잘립니다"
            onFile={openCropper}
          />

          <div className="flex flex-wrap gap-2">
            {picked && !saving ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCropping(true)}
              >
                다시 자르기
              </Button>
            ) : null}
            {avatarUrl && !demoMode ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void handleRemove()}
              >
                사진 삭제
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      <AvatarCropDialog
        // A new photo resets crop/zoom/rotation; re-cropping the same one resumes.
        key={picked?.url ?? "empty"}
        open={cropping && picked !== null}
        source={picked}
        saving={saving}
        onCancel={() => setCropping(false)}
        onSave={handleSave}
      />
    </div>
  );
}
