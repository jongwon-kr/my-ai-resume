export type MockInterviewStyle =
  | "general"
  | "pressure"
  | "technical"
  | "cover_letter";

const STYLE_HINTS: Record<MockInterviewStyle, string> = {
  general: "일반 면접관 톤으로 이력서 기반 꼬리 질문 3~5개",
  pressure: "압박 면접관 톤으로 약점·공백·모순을 짚는 질문 3~5개",
  technical: "기술 deep-dive 면접관으로 스택·설계·트러블슈팅 질문 3~5개",
  cover_letter: "자기소개서 검증 면접관으로 지원동기·입사 후 포부 검증 질문 3~5개",
};

export function buildMockInterviewPrompt(
  resumeSystemPrompt: string,
  style: MockInterviewStyle = "general",
) {
  return `${resumeSystemPrompt}

[모의 면접 모드 - 면접관 역할]
당신은 이제 지원자가 아니라 **채용 면접관**입니다.
위 이력서·자기소개서·프로젝트 정보를 바탕으로 ${STYLE_HINTS[style]}를 한국어 존댓말로 던지세요.

규칙:
1. 한 번에 질문 1개만 출력합니다.
2. 지원자(사용자)의 답변을 받은 뒤에만 다음 질문을 합니다.
3. 이력서에 없는 사실을 가정하지 않습니다.
4. 질문은 구체적이고 검증 가능해야 합니다.`;
}

export function buildPreviewChatPrompt(resumeSystemPrompt: string) {
  return `${resumeSystemPrompt}

[미리보기 모드]
이 대화는 프로필 소유자의 챗봇 테스트입니다. 공개 방문자에게 보이는 것과 동일한 1인칭 면접 답변 톤을 유지하세요.`;
}
