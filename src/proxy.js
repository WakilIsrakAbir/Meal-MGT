import { NextResponse } from "next/server";
import { SESSION_COOKIE, decrypt } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/register"];

// Quick check only: send people without a valid login cookie to /login.
// The real permission checks happen on the server in every page and action.
export default async function proxy(request) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session?.memberId) return NextResponse.redirect(new URL("/login", request.nextUrl));

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico|webp)$).*)"],
};
