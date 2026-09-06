import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/core/lib/supabase/utils";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check if we are in demo mode (no supabase config)
  const isConfigured = isSupabaseConfigured();
  
  let user = null;
  if (isConfigured) {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } else {
    // Demo mode: check for biotools_session cookie
    const sessionCookie = request.cookies.get("biotools_session");
    if (sessionCookie?.value) {
      try {
        user = JSON.parse(sessionCookie.value);
      } catch {
        user = null;
      }
    }
  }

  const { pathname } = request.nextUrl;

  // Si trata de ir al login o registro y ya tiene sesión
  if (pathname.startsWith("/auth/")) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Si trata de entrar al dashboard sin sesión
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return supabaseResponse;
}
