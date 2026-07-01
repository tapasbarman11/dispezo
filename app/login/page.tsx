"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BRAND } from "@/config/branding";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (status !== "authenticated") return;

      try {
        const response = await fetch(
          "/api/onboarding/status"
        );

        const onboarding =
          await response.json();

        if (
          onboarding.profileCompleted &&
          onboarding.organizationCount > 0 &&
          onboarding.whatsappCount > 0
        ) {
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        console.error(error);

        router.replace("/onboarding");
      }
    };

    checkOnboardingStatus();
  }, [status, router]);

  if (status === "loading") {
    return null;
  }
  return (<div className="min-h-screen grid lg:grid-cols-2 bg-background">
    {/* Left Panel */} <div className="flex flex-col p-8 md:p-12"> <Link href="/" className="flex items-center gap-3 mb-16"> <img
      src={BRAND.logo}
      alt={BRAND.name}
      className="h-20 w-auto"
    /> </Link>
      <div className="flex-1 grid place-items-center">
        <div className="w-full max-w-sm">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-gradient-brand mb-3">
            Welcome to {BRAND.name}
          </p>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Sign in to continue
          </h1>

          <p className="text-sm text-muted-foreground mt-3">
            Connect your business WhatsApp account, automate conversations,
            run campaigns, and manage customer messaging from one place.
          </p>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={() =>
                signIn("google", {
                  callbackUrl: "/login",
                })
              }
              className="w-full py-3.5 rounded-xl border border-border bg-background text-sm font-semibold flex items-center justify-center gap-3 hover:bg-muted transition"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />

              Continue with Google
            </button>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">
                First-time users can create a {BRAND.name} account instantly using
                their Google login.
              </p>
            </div>

            <div className="rounded-xl bg-brand-green/5 border border-brand-green/20 p-4">
              <div className="text-xs font-semibold text-brand-green mb-1">
                What's next?
              </div>

              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Create your {BRAND.name} workspace</li>
                <li>✓ Verify your phone number</li>
                <li>✓ Complete business profile</li>
                <li>✓ Connect WhatsApp via Meta Embedded Signup</li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By continuing, you agree to our Terms of Service and Privacy
            Policy.
          </p>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        © 2026 {BRAND.name}, Inc.
      </p>
    </div>

    {/* Right Panel */}
    <div className="relative hidden lg:block overflow-hidden">
      <div className="absolute inset-0 gradient-brand" />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative h-full flex flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur w-fit text-xs font-medium">
          <MessageCircle className="size-3.5" />
          Live with 2,400+ businesses
        </div>

        <div>
          <blockquote className="text-2xl md:text-3xl font-semibold leading-snug tracking-tight">
            "{BRAND.name} turned WhatsApp into our highest-converting channel.
            We shipped our first 6-figure campaign in under 30 minutes."
          </blockquote>

          <div className="mt-6 flex items-center gap-3">
            <div className="size-11 rounded-full bg-white/20 grid place-items-center font-bold">
              SR
            </div>

            <div>
              <div className="font-semibold text-sm">
                Sienna Reyes
              </div>

              <div className="text-xs text-white/70">
                VP Growth, Halcyon
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { l: "Messages / mo", v: "180M" },
            { l: "Avg read rate", v: "84%" },
            { l: "Uptime", v: "99.99%" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl bg-white/10 backdrop-blur p-4 border border-white/15"
            >
              <div className="text-xl font-bold tabular-nums">
                {s.v}
              </div>

              <div className="text-[11px] text-white/70 mt-0.5">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>

  );
}
