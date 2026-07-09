import { renderToBuffer } from "@react-pdf/renderer";

import { registerResumePdfFonts } from "@/lib/resume/pdf/fonts";
import { ResumePdfDocument } from "@/lib/resume/pdf/resume-pdf-document";
import type { ResumePdfInput } from "@/lib/resume/pdf/types";

export async function generateResumePdf(input: ResumePdfInput) {
  registerResumePdfFonts();
  return renderToBuffer(<ResumePdfDocument {...input} />);
}
