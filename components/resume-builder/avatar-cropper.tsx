"use client";

import Cropper, { type CropperProps } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";

/**
 * react-easy-crop declares its defaulted props as required, so every caller
 * would have to pass `cropShape`, `zoomSpeed`, `style` and friends. Narrow the
 * contract to what we actually set and let the library's defaults apply.
 */
type AvatarCropperProps = Partial<CropperProps> &
  Pick<CropperProps, "image" | "crop" | "onCropChange">;

// Re-exported through its own module so `dynamic()` pulls both the component
// and its stylesheet into the lazy chunk, keeping the DOM-sniffing dependency
// out of the server render.
export default Cropper as unknown as React.ComponentType<AvatarCropperProps>;
