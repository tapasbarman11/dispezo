export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/whatsapp/:path*",
    "/campaigns/:path*",
    "/contacts/:path*",
    "/templates/:path*",
    "/settings/:path*",
  ],
};