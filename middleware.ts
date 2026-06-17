import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

function isSupabaseConfigured() {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}

function createSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}

async function getUserRole(request: NextRequest, response: NextResponse, userId: string) {
  const supabase = createSupabaseMiddlewareClient(request, response);
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (!error && data?.role) {
    return data.role;
  }

  const { data: authUser } = await supabase.auth.getUser();
  return (authUser.user?.user_metadata?.role as "buyer" | "creator" | "superadmin" | undefined) ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createSupabaseMiddlewareClient(request, response);
  const { data } = await supabase.auth.getUser();
  const user = data.user ?? null;

  if ((pathname === "/login" || pathname === "/signup") && user) {
    const role = await getUserRole(request, response, user.id);
    const redirectUrl = new URL(
      role === "creator"
        ? "/dashboard/creator"
        : role === "superadmin"
          ? "/superadmin"
          : "/dashboard/user",
      request.url,
    );
    return NextResponse.redirect(redirectUrl);
  }

  const protectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/superadmin") ||
    pathname.endsWith("/chat");

  if (!protectedRoute) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = await getUserRole(request, response, user.id);

  if (pathname === "/superadmin" || pathname.startsWith("/superadmin/")) {
    if (role !== "superadmin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname === "/dashboard/creator" && role !== "creator") {
    return NextResponse.redirect(new URL("/dashboard/user", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/dashboard/:path*",
    "/superadmin/:path*",
    "/agents/:path*/chat",
  ],
};
