import { GoogleGenAI } from "@google/genai";
import { ApiError } from "@google/genai";

import { CHAT_QUOTA_ERROR_MESSAGE, GEMINI_MODEL } from "@/lib/chat/constants";
import {
  geminiResumeImportResponseSchema,
  type GeminiResumeImportResponse,
} from "@/lib/resume/import/schema";

const RESUME_IMPORT_PROMPT = `당신은 이력서 PDF 분석 전문가입니다. 첨부 PDF에 **명시적으로 적힌 내용만** 추출하세요.

규칙:
1. PDF에 없는 정보는 빈 문자열("") 또는 빈 배열([])로 두세요. 추측·보완·hallucination 금지.
2. 불확실하거나 OCR이 애매한 필드는 needs_review 배열에 필드 경로를 추가하세요. (예: "name", "careers", "projects.0.title")
3. 한국어/영어 이력서 모두 처리합니다.
4. projects는 STAR(상황/과제, 수행, 성과, 트러블슈팅) 구조로 분리해 가능한 범위에서 매핑하세요. PDF에 없으면 빈 문자열.
5. skills.proficiency는 PDF에 숙련도가 있을 때만 (입문/초급/중급/고급/전문가) 사용.
6. birth_year는 출생연도·나이 정보가 명확할 때만 숫자(예: 1995), 없으면 null.
7. owner_faqs는 PDF에 Q&A 형식이 있을 때만 추출. 없으면 [].
8. 반드시 아래 JSON 스키마만 출력하세요. 다른 텍스트 금지.

JSON 스키마:
{
  "name": string,
  "role_title": string,
  "intro": string,
  "birth_year": number | null,
  "phone": string,
  "public_email": string,
  "location": string,
  "github_url": string,
  "linkedin_url": string,
  "blog_url": string,
  "careers": [{ "company", "position", "period", "description" }],
  "education": [{ "school", "major", "degree", "status", "period" }],
  "certifications": [{ "name", "issuer", "acquired_date" }],
  "skills": [{ "name", "proficiency" }],
  "projects": [{ "title", "period", "role", "tech_stack", "situation", "actions", "results", "troubleshooting" }],
  "cover_letters": [{ "title", "content" }],
  "owner_faqs": [{ "question", "answer" }],
  "needs_review": string[]
}`;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey });
}

function parseJsonResponse(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const payload = fenced ? fenced[1] : trimmed;
  return JSON.parse(payload) as unknown;
}

export async function extractResumeFromPdf(
  pdfBuffer: Buffer,
): Promise<GeminiResumeImportResponse> {
  const ai = getGeminiClient();
  const base64 = pdfBuffer.toString("base64");

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            { text: RESUME_IMPORT_PROMPT },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error("Empty Gemini response.");
    }

    const parsed = parseJsonResponse(text);
    return geminiResumeImportResponseSchema.parse(parsed);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      throw new Error(CHAT_QUOTA_ERROR_MESSAGE);
    }

    throw error;
  }
}
