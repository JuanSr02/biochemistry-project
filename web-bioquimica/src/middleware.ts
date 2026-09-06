import { type NextRequest } from "next/server";
import { updateSession } from "@/core/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*"
  ],
};
