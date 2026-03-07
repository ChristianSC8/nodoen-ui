import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get("session")?.value

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/overview", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
