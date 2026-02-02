import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";
import { canAccessAdmin, canAccessProvider } from "@/lib/auth/roles";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/public"]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/public/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public APIs for anonymized/aggregated data
  if (pathname.startsWith("/api/public/")) return NextResponse.next();

  if (isPublicPath(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  let session: Awaited<ReturnType<typeof verifySessionToken>> | null = null;
  try {
    session = await verifySessionToken(token);
  } catch {
    session = null;
  }

  if (!session) {
    const res = NextResponse.redirect(new URL("/login", req.url));
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  // RBAC for routes
  if (pathname.startsWith("/admin")) {
    if (!canAccessAdmin(session.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
  if (pathname.startsWith("/provider")) {
    if (!canAccessProvider(session.role)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // RBAC for APIs
  if (pathname.startsWith("/api/admin")) {
    if (!canAccessAdmin(session.role)) {
      return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
};


