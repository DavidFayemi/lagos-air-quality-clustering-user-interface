import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl as string,
    supabaseAnonKey as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get user from session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");

  const isProtectedPage =
    pathname.startsWith("/(authenticated)") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/locations") ||
    pathname.startsWith("/bookmarks") ||
    pathname.startsWith("/settings");

  // Console logs for debugging
  console.log("[MIDDLEWARE]", pathname, "user:", !!user, "isAuth:", isAuthPage, "isProtected:", isProtectedPage);

  // Redirect authenticated users away from auth pages
  if (isAuthPage && user) {
    console.log("[MIDDLEWARE] Authenticated user on auth page, redirecting to /dashboard");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedPage && !user) {
    console.log("[MIDDLEWARE] Unauthenticated user on protected page, redirecting to /auth/login");
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
