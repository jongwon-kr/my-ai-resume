import { Font } from "@react-pdf/renderer";

const NOTO_SANS_KR_REGULAR =
  "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/Korean/NotoSansCJKkr-Regular.otf";
const NOTO_SANS_KR_BOLD =
  "https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/OTF/Korean/NotoSansCJKkr-Bold.otf";

let registered = false;

export function registerResumePdfFonts() {
  if (registered) {
    return;
  }

  Font.register({
    family: "NotoSansKR",
    fonts: [
      { src: NOTO_SANS_KR_REGULAR, fontWeight: 400 },
      { src: NOTO_SANS_KR_BOLD, fontWeight: 700 },
    ],
  });

  registered = true;
}
