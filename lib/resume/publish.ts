export async function generateSystemPrompt(profileId: string) {
  const response = await fetch("/api/prompt/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? "프롬프트 생성에 실패했습니다.");
  }

  return response.json() as Promise<{ success: true; version: number }>;
}
