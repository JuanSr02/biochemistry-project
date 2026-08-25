import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("biotools_session");
  const { pathname } = request.nextUrl;

  // Si trata de ir al login o registro y ya tiene sesión, mandarlo al dashboard
  if (pathname.startsWith("/auth/")) {
    if (sessionCookie?.value) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Si trata de entrar al dashboard sin sesión, mandarlo al login
  if (pathname.startsWith("/dashboard")) {
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*"
  ],
};
