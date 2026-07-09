import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isAdminUser } from "@/lib/auth/admin";
import { PUBLIC_PROFILE_HEADER } from "@/lib/constants";

function copyResponseCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

function isProtectedAdminPath(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isProtectedAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin/");
}

/**
 * Rewrites /@slug public profile URLs to /[id] dynamic route.
 * Refreshes Supabase auth session when env vars are configured.
 * Guards /admin routes for admin role only.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  let user: Awaited<
    ReturnType<
      Awaited<ReturnType<typeof createServerClient>>["auth"]["getUser"]
    >
  >["data"]["user"] = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    const authResult = await supabase.auth.getUser();
    user = authResult.data.user;
  }

  const { pathname } = request.nextUrl;

  if (isProtectedAdminPath(pathname) || isProtectedAdminApi(pathname)) {
    if (!user || !isAdminUser(user)) {
      if (isProtectedAdminApi(pathname)) {
        return NextResponse.json(
          { error: "관리자 권한이 필요합니다." },
          { status: 403 },
        );
      }

      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = user ? "/dashboard" : "/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  if (pathname.startsWith("/@") && pathname.length > 2) {
    const rest = pathname.slice(2);
    const slug = rest.split("/")[0];
    const suffix = rest.slice(slug.length);
    const url = request.nextUrl.clone();
    url.pathname = `/${slug}${suffix}`;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(PUBLIC_PROFILE_HEADER, "1");

    const rewriteResponse = NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
    copyResponseCookies(response, rewriteResponse);
    response = rewriteResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
