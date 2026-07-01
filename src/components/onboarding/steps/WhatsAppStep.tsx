'use client';

import { useState } from 'react';
import { Loader2, Check, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingData } from '@/lib/types';
import { useRouter } from "next/navigation";
const BENEFITS = [
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <path stroke="#fff" strokeWidth="2" strokeLinecap="round"
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.75-.75a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    iconBg: 'from-[#22c55e] to-[#16a34a]',
    label: 'Broadcasts',
    sub: 'Mass messaging',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <circle stroke="#fff" strokeWidth="2" cx="12" cy="12" r="3" />
        <path stroke="#fff" strokeWidth="2" strokeLinecap="round"
          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
    iconBg: 'from-[#3b82f6] to-[#2563eb]',
    label: 'Automation',
    sub: 'AI replies 24/7',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <path stroke="#fff" strokeWidth="2" strokeLinecap="round"
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    iconBg: 'from-[#6d28d9] to-[#7c3aed]',
    label: 'Inbox',
    sub: 'Team conversations',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <path stroke="#fff" strokeWidth="2" strokeLinecap="round"
          d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    iconBg: 'from-[#f59e0b] to-[#d97706]',
    label: 'Analytics',
    sub: 'Live reporting',
  },
] as const;

interface Props {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  error?: string;
}
function WhatsAppIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
    >
      <path d="M19.11 17.32c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.8-1.67-2.1-.17-.3-.02-.47.13-.62.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.05 1.02-1.05 2.47s1.07 2.85 1.22 3.05c.15.2 2.08 3.18 5.04 4.46.7.3 1.25.48 1.67.62.7.22 1.34.19 1.85.12.56-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.08-.12-.27-.2-.57-.35z" />
      <path d="M16 3C8.82 3 3 8.82 3 16c0 2.56.75 5.05 2.15 7.18L3 29l5.98-2.1A12.94 12.94 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.5c-2.07 0-4.1-.56-5.86-1.63l-.42-.25-3.55 1.25 1.2-3.46-.28-.44A10.46 10.46 0 015.5 16C5.5 10.2 10.2 5.5 16 5.5S26.5 10.2 26.5 16 21.8 26.5 16 26.5z" />
    </svg>
  );
}
export function WhatsAppStep({ data, onChange, error }: Props) {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [verifying, setVerifying] = useState(false);
  const handleConnect = async () => {
    if (connecting || data.whatsappConnected) return;
    setConnecting(true);
    setShowEmbed(true);
    await new Promise((r) => setTimeout(r, 2200));
    setConnecting(false);
    onChange({ whatsappConnected: true });
  };
  const verifyManualConnection = async () => {
    if (
      !accessToken.trim() ||
      !wabaId.trim()
    ) {
      alert('Please enter your Access Token and WABA ID.');
      return;
    }

    try {
      setVerifying(true);

      const res = await fetch('/api/onboarding/verify-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          wabaId
        }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(
          result.error ||
          result.message ||
          "Unable to verify WhatsApp."
        );
      }

      onChange({
        whatsappConnected: true,
      });
      setTimeout(() => {
        router.push("/whatsapp");
      }, 1000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="px-9 py-7">
      {/* Benefit chips */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {BENEFITS.map((b) => (
          <div
            key={b.label}
            className="flex flex-col p-3.5 rounded-xl border border-[#e5e8ef] bg-[#fafbfc]"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center mb-2',
                'bg-gradient-to-br',
                b.iconBg
              )}
            >
              {b.icon}
            </div>
            <div className="text-[12px] font-semibold text-[#1d1f2e]">{b.label}</div>
            <div className="text-[11px] text-[#9ca3af] mt-0.5">{b.sub}</div>
          </div>
        ))}
      </div>

      {/* Meta connect CTA */}
      {!data.whatsappConnected ? (
        <div className="border-2 border-dashed border-[#c4b5fd] rounded-2xl bg-gradient-to-br from-[#faf7ff] to-[#eff6ff] p-8 text-center mb-5">
          <div
            className="w-16 h-16 rounded-[18px] bg-[#1877f2] flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: '0 8px 24px rgba(24,119,242,0.3)' }}
          >
            <svg width="32" height="32" fill="white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>

          <h3 className="text-[17px] font-bold text-[#0f0d1a] mb-1.5">
            Connect via Meta Embedded Signup
          </h3>
          <p className="text-sm text-[#6b7280] leading-relaxed max-w-[700px] mx-auto mb-15">
            You'll be guided through Meta's official, secure verification flow to link your WhatsApp Business Account
          </p>

          {/* <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className={cn(
              'inline-flex items-center gap-2.5 h-12 px-8 rounded-xl',
              'bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] text-white',
              'text-[15px] font-semibold transition-opacity duration-150',
              'shadow-[0_6px_20px_rgba(109,40,217,0.35)]',
              connecting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
            )}
          >
            {connecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                Start Meta Verification
              </>
            )}
          </button> */}
          <button
            type="button"
            disabled
            className={cn(
              'inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl',
              'bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] text-white',
              'text-[15px] font-semibold',
              'shadow-[0_6px_20px_rgba(109,40,217,0.35)]',
              'opacity-60 cursor-not-allowed'
            )}
          >
            <svg width="20" height="20" fill="white" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>

            Coming Soon...
          </button>
          {/* Trust row */}
          <div className="flex items-center justify-center gap-5 mt-4">
            {[
              { Icon: Shield, text: 'SSL Secured' },
              { Icon: Check, text: 'Official Partner' },
              { Icon: Zap, text: '3 min setup' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[11.5px] text-[#9ca3af]">
                <Icon className="w-3 h-3" />
                {text}
              </div>
            ))}
          </div>

          {/* } <p className="mt-5 text-xs text-slate-500">
            Meta Embedded Signup will be enabled once Dispaz becomes an approved Meta Tech Provider.
          </p> */}

          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="px-4 text-sm text-slate-500 font-medium">
              OR
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left">

            <div className="flex items-center gap-3 mb-5">

              <div className="ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                <WhatsAppIcon className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-base">
                  Manual WhatsApp Connection
                </h3>

                <p className="text-sm text-slate-500">
                  Connect using your existing WhatsApp Cloud API Access Token.
                </p>
              </div>

            </div>

            <label className="block text-sm font-medium mb-2">
              WhatsApp Cloud API Access Token
            </label>

            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="EAAGxxxxxxxxxxxxxxxxxxxx"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <div className="mt-5">

              <label className="block text-sm font-medium mb-2">
                WhatsApp Business Account ID (WABA ID)
              </label>

              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="123456789012345"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                Available in Meta Business Portfolio → WhatsApp Accounts or under the WhatsApp API Setup page.
              </p>

            </div>
            <p className="mt-2 text-xs text-slate-500">
              Permanent System User Access Token is recommended. The token is securely encrypted before being stored.
            </p>

            <button
              type="button"
              onClick={verifyManualConnection}
              disabled={verifying}
              className="mt-5 w-full h-11 rounded-xl bg-[#25D366] text-white font-semibold hover:bg-[#22c55e] transition"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Verifying Connection...
                </>
              ) : (
                "Verify & Connect"
              )}
            </button>

          </div>

        </div>
      ) : (
        /* Connected state */
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-5 animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-emerald-800">WhatsApp Business Connected</div>
            <div className="text-xs text-emerald-600 mt-0.5">
              Your account is verified and ready to send messages
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Meta embed frame */}
      {showEmbed && !data.whatsappConnected && (
        <div className="rounded-xl border border-[#e2e5ed] overflow-hidden animate-in fade-in-0 duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#f3f4f6] border-b border-[#e2e5ed]">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-[#9ca3af]">Meta Business Verification — Embedded</span>
          </div>
          <div className="p-6 text-center bg-white">
            <div className="w-12 h-12 rounded-xl bg-[#1877f2] flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#1d1f2e] mb-1.5">Verifying with Meta…</p>
            <p className="text-xs text-[#9ca3af]">Please wait while we complete your WhatsApp Business verification</p>
            <div className="flex justify-center mt-4 gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#6d28d9] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
