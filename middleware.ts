import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth/session";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasToken && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
