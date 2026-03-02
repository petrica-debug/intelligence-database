import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
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

  const isAuthRoute = request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/search") ||
    request.nextUrl.pathname.startsWith("/new-entry") ||
    request.nextUrl.pathname.startsWith("/network") ||
    request.nextUrl.pathname.startsWith("/geo") ||
    request.nextUrl.pathname.startsWith("/analytics") ||
    request.nextUrl.pathname.startsWith("/intelligence") ||
    request.nextUrl.pathname.startsWith("/timeline") ||
    request.nextUrl.pathname.startsWith("/reports") ||
    request.nextUrl.pathname.startsWith("/persons") ||
    request.nextUrl.pathname.startsWith("/companies") ||
    request.nextUrl.pathname.startsWith("/addresses") ||
    request.nextUrl.pathname.startsWith("/mobile") ||
    request.nextUrl.pathname.startsWith("/vehicles") ||
    request.nextUrl.pathname.startsWith("/entry") ||
    request.nextUrl.pathname.startsWith("/admin");

  if (!user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
