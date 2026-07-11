import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

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