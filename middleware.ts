import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const { pathname } = request.nextUrl;

  // Redirect the Vercel deployment URL to the canonical custom domain.
  // Prevents the vercel.app URL from being indexed alongside the real domain.
  if (host.includes(".vercel.app")) {
    const destination = `https://www.thelawproject.in${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(destination, { status: 301 });
  }

  // Admin routes: protected by a simple password cookie (no Supabase Auth needed)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminCookie = request.cookies.get("tlp_admin")?.value;
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret || adminCookie !== adminSecret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Auth pages only: run Supabase session refresh + redirect if already logged in
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authPages = ["/auth/login", "/auth/signup", "/login", "/signup", "/forgot-password"];
  if (user && authPages.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Auth pages (Supabase session refresh)
    "/auth/login", "/auth/signup", "/login", "/signup", "/forgot-password",
    // Admin routes (password cookie check)
    "/admin/:path*",
    // All other pages — needed so the Vercel redirect runs site-wide.
    // Excludes _next internals, static files, and common asset extensions.
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|otf)).*)",
  ],
};
