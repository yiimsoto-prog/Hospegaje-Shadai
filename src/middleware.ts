import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge security headers + basic abuse controls.
 * TLS/SSL and DDoS mitigation are provided by Cloudflare at the edge.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: https://images.unsplash.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.workers.dev https://images.unsplash.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );

  // Soft rate-limit signal for API clients (real quotas live in Cloudflare WAF/Rate Limiting).
  if (path.startsWith("/api/")) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-API-Version", "shadai-ops-1");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.png|icons/|manifest.webmanifest).*)"],
};
