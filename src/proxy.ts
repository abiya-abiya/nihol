import { NextResponse, type NextRequest } from "next/server";

/** Optimistic role routing (real checks happen in layouts via requireRole). */
const AREAS: Array<[string, string]> = [
  ["/teacher", "teacher"],
  ["/student", "student"],
  ["/parent", "parent"],
  ["/org", "org"],
];

function roleOf(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const json = atob(token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/"));
    return (JSON.parse(json) as { role?: string }).role ?? null;
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const area = AREAS.find(([p]) => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p + "/"));
  if (!area) return NextResponse.next();
  const role = roleOf(req.cookies.get("ildiz_session")?.value);
  if (role === area[1]) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${area[1]}`;
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/teacher/:path*", "/student/:path*", "/parent/:path*", "/org/:path*", "/org"] };
