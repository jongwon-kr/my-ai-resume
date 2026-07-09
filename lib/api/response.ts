export const API_ERROR_MESSAGE = "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";

export function jsonError(message: string, status = 500) {
  return Response.json({ error: message }, { status });
}

export function jsonOk<T extends Record<string, unknown>>(payload: T, status = 200) {
  return Response.json(payload, { status });
}

export async function parseJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
