"use client";
import { loadFacebookSDK } from "@/lib/meta";
import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  Building2,
  Link2,
} from "lucide-react";

export default function WhatsAppPage() {
  const isConnected = false;
  const [loading, setLoading] = useState(false);
  const launchEmbeddedSignup = async () => {
    setLoading(true);

    await loadFacebookSDK();

    window.FB.login(
      function (response: any) {
        console.log("Meta Response", response);

        if (response.authResponse) {
          alert(
            "Signup successful. Next step: exchange code on backend."
          );
        }
      },
      {
        config_id: "831588596697139",
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          feature: "whatsapp_embedded_signup",
        },
      }
    );

    setLoading(false);
  };
  return (<div> <PageHeader
    eyebrow="Integration"
    title="WhatsApp Business"
    description="Connect your WhatsApp Business account using Meta Embedded Signup with Coexistence support."
  />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Connection Status */}
      <div className="lg:col-span-2 glass rounded-2xl p-8 shadow-[var(--shadow-card)]">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold">
              WhatsApp Connection
            </h3>

            <p className="text-sm text-muted-foreground mt-1">
              Connect an existing WhatsApp Business number without losing access
              to the mobile app.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
            NOT CONNECTED
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Phone className="size-4" />
              <span className="font-semibold">
                Phone Number
              </span>
            </div>

            <div className="text-muted-foreground">
              Not Connected
            </div>
          </div>

          <div className="border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="size-4" />
              <span className="font-semibold">
                Business Name
              </span>
            </div>

            <div className="text-muted-foreground">
              Not Available
            </div>
          </div>

          <div className="border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="size-4" />
              <span className="font-semibold">
                WABA ID
              </span>
            </div>

            <div className="text-muted-foreground">
              --
            </div>
          </div>

          <div className="border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="size-4" />
              <span className="font-semibold">
                Verification
              </span>
            </div>

            <div className="text-muted-foreground">
              Pending
            </div>
          </div>

        </div>

        <button
          onClick={launchEmbeddedSignup}
          className="mt-8 w-full py-4 rounded-xl gradient-brand text-white font-semibold"
        >
          {loading ? "Opening Meta..." : "Connect with Meta"}
        </button>

      </div>

      {/* Embedded Signup */}
      <div className="glass rounded-2xl p-8 shadow-[var(--shadow-card)]">

        <div className="text-[11px] font-bold uppercase tracking-widest text-gradient-brand mb-3">
          Embedded Signup
        </div>

        <h3 className="font-bold text-lg mb-6">
          How it works
        </h3>

        <ol className="space-y-4 text-sm">

          <li className="flex gap-3">
            <span className="size-6 rounded-full gradient-brand text-white grid place-items-center text-xs font-bold">
              1
            </span>
            <span>
              Login with Facebook
            </span>
          </li>

          <li className="flex gap-3">
            <span className="size-6 rounded-full gradient-brand text-white grid place-items-center text-xs font-bold">
              2
            </span>
            <span>
              Select Business Manager
            </span>
          </li>

          <li className="flex gap-3">
            <span className="size-6 rounded-full gradient-brand text-white grid place-items-center text-xs font-bold">
              3
            </span>
            <span>
              Choose existing WhatsApp number
            </span>
          </li>

          <li className="flex gap-3">
            <span className="size-6 rounded-full gradient-brand text-white grid place-items-center text-xs font-bold">
              4
            </span>
            <span>
              Enable Coexistence automatically
            </span>
          </li>

          <li className="flex gap-3">
            <span className="size-6 rounded-full gradient-brand text-white grid place-items-center text-xs font-bold">
              5
            </span>
            <span>
              MessagiQ receives access and configures webhooks
            </span>
          </li>

        </ol>

      </div>

    </div>

    {/* Coexistence Information */}

    <div className="glass rounded-2xl p-8 shadow-[var(--shadow-card)] mt-6">

      <div className="text-[11px] font-bold uppercase tracking-widest text-gradient-brand mb-3">
        Coexistence Mode
      </div>

      <h3 className="font-bold text-lg mb-4">
        WhatsApp Business App + MessagiQ
      </h3>

      <div className="grid md:grid-cols-2 gap-6">

        <div className="border rounded-xl p-5">
          <h4 className="font-semibold mb-4">
            Continue Using Mobile App
          </h4>

          <ul className="space-y-2 text-sm">
            <li>✓ Reply to customers</li>
            <li>✓ Receive messages</li>
            <li>✓ Access chat history</li>
            <li>✓ Use WhatsApp Business normally</li>
          </ul>
        </div>

        <div className="border rounded-xl p-5">
          <h4 className="font-semibold mb-4">
            Powered by MessagiQ
          </h4>

          <ul className="space-y-2 text-sm">
            <li>✓ Broadcast campaigns</li>
            <li>✓ Automation workflows</li>
            <li>✓ Template management</li>
            <li>✓ Analytics & reporting</li>
          </ul>
        </div>

      </div>

    </div>
  </div>

  );
}
