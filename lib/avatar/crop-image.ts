import {
  AVATAR_ASPECT,
  AVATAR_OUTPUT_QUALITY,
  AVATAR_OUTPUT_TYPE,
  AVATAR_OUTPUT_WIDTH,
} from "@/lib/avatar/constants";

/** Same shape as react-easy-crop's `Area`, so lib/ stays UI-free. */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Bounding box of `width`x`height` rotated `rotation` degrees about its centre. */
export function rotateSize(width: number, height: number, rotation: number) {
  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  return {
    width: Math.round(cos * width + sin * height),
    height: Math.round(sin * width + cos * height),
  };
}

/**
 * Output size for a crop `cropWidth` source pixels wide.
 *
 * Never upscales: a small source stays sharp instead of being blown up to the
 * nominal width.
 */
export function avatarOutputSize(cropWidth: number) {
  const width = Math.max(
    1,
    Math.min(AVATAR_OUTPUT_WIDTH, Math.round(cropWidth)),
  );

  return { width, height: Math.round(width / AVATAR_ASPECT) };
}

/**
 * Renders the chosen crop to a JPEG blob.
 *
 * Decoding the bytes we already hold keeps the canvas same-origin, so an
 * already-uploaded avatar can be re-cropped without a CORS round trip and
 * `toBlob` can never throw a SecurityError.
 */
export async function getCroppedBlob(
  source: Blob,
  area: CropArea,
  rotation: number,
): Promise<Blob> {
  // `from-image` matches what the cropper displayed, since browsers apply EXIF
  // orientation to <img> by default.
  const bitmap = await createImageBitmap(source, {
    imageOrientation: "from-image",
  });

  try {
    // Stage 1: rotate the whole image into its bounding box. react-easy-crop
    // reports the crop area in this rotated space.
    const rotated = rotateSize(bitmap.width, bitmap.height, rotation);
    const stage = document.createElement("canvas");
    stage.width = rotated.width;
    stage.height = rotated.height;

    const stageContext = stage.getContext("2d");
    if (!stageContext) {
      throw new Error("2d context unavailable");
    }

    // JPEG has no alpha, so paint white first or a transparent source comes
    // out on black.
    stageContext.fillStyle = "#ffffff";
    stageContext.fillRect(0, 0, stage.width, stage.height);
    stageContext.translate(stage.width / 2, stage.height / 2);
    stageContext.rotate((rotation * Math.PI) / 180);
    stageContext.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

    // Stage 2: lift the crop rect out at the output resolution.
    const { width, height } = avatarOutputSize(area.width);
    const output = document.createElement("canvas");
    output.width = width;
    output.height = height;

    const outputContext = output.getContext("2d");
    if (!outputContext) {
      throw new Error("2d context unavailable");
    }

    outputContext.imageSmoothingQuality = "high";
    outputContext.fillStyle = "#ffffff";
    outputContext.fillRect(0, 0, width, height);
    outputContext.drawImage(
      stage,
      area.x,
      area.y,
      area.width,
      area.height,
      0,
      0,
      width,
      height,
    );

    return await new Promise<Blob>((resolve, reject) => {
      output.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("toBlob returned null")),
        AVATAR_OUTPUT_TYPE,
        AVATAR_OUTPUT_QUALITY,
      );
    });
  } finally {
    bitmap.close();
  }
}
