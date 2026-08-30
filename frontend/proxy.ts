import { NextResponse } from "next/server";

import { auth } from "@/auth";

const AUTH_ROUTES = ["/login", "/signup"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isDashboardRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|ico)$).*)"],
};
