"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { RotateCcwIcon, RotateCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AVATAR_ASPECT,
  AVATAR_CROP_FAILED_MESSAGE,
} from "@/lib/avatar/constants";
import { getCroppedBlob, type CropArea } from "@/lib/avatar/crop-image";

const Cropper = dynamic(
  () => import("@/components/resume-builder/avatar-cropper"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
        편집기를 불러오는 중…
      </div>
    ),
  },
);

export interface CropSource {
  url: string;
  blob: Blob;
}

interface AvatarCropDialogProps {
  open: boolean;
  source: CropSource | null;
  saving: boolean;
  onCancel: () => void;
  onSave: (cropped: Blob) => Promise<void>;
}

export function AvatarCropDialog({
  open,
  source,
  saving,
  onCancel,
  onSave,
}: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // onCropComplete fires on every gesture end; a ref keeps it out of render.
  const areaRef = useRef<CropArea | null>(null);

  async function handleSave() {
    if (!source || !areaRef.current) {
      return;
    }

    setError(null);

    try {
      const cropped = await getCroppedBlob(
        source.blob,
        areaRef.current,
        rotation,
      );
      await onSave(cropped);
    } catch (cropError) {
      console.error(cropError);
      setError(AVATAR_CROP_FAILED_MESSAGE);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>프로필 사진 자르기</DialogTitle>
          <DialogDescription>
            드래그해 위치를 잡고 확대·회전으로 다듬으세요. 공개 페이지에는 3:4
            세로 비율로 표시됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-lg bg-muted sm:h-80">
          {source ? (
            <Cropper
              image={source.url}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={AVATAR_ASPECT}
              minZoom={1}
              maxZoom={3}
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={(_, areaPixels) => {
                areaRef.current = areaPixels;
              }}
            />
          ) : null}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 text-sm">
            <span className="w-8 shrink-0 text-muted-foreground">확대</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="h-1 w-full accent-primary"
            />
          </label>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-8 shrink-0 text-muted-foreground">회전</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRotation((value) => (value + 270) % 360)}
            >
              <RotateCcwIcon />
              왼쪽
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRotation((value) => (value + 90) % 360)}
            >
              <RotateCwIcon />
              오른쪽
            </Button>
          </div>
        </div>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? "저장 중…" : "이 영역으로 저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
