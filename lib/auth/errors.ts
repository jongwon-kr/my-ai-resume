/** Maps Supabase Auth error messages to user-friendly Korean text. */
export function getAuthErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("email rate limit exceeded") ||
    normalized.includes("over_email_send_rate_limit")
  ) {
    return "이메일 발송 한도를 초과했습니다. 약 1시간 후 다시 시도하거나, Google 로그인을 이용해 주세요. (개발 중에는 Supabase Dashboard에서 이메일 확인을 끄면 해결됩니다)";
  }

  if (normalized.includes("user already registered")) {
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }

  if (normalized.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 받은 메일함을 확인해 주세요.";
  }

  if (
    normalized.includes("password should be at least") ||
    normalized.includes("weak password")
  ) {
    return "비밀번호는 8자 이상이어야 합니다.";
  }

  return message;
}
