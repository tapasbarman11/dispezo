'use client';

import { useEffect, useState } from 'react';
import { Loader2, Check, Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingData } from '@/lib/types';
import { useRouter } from 'next/navigation';

const BENEFITS = [
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <path
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.75-.75a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 1 2.81.7A2 2 0 0 1 22 16.92z"
        />
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
        <path
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        />
      </svg>
    ),
    iconBg: 'from-[#3b82f6] to-[#2563eb]',
    label: 'Automation',
    sub: 'AI replies 24/7',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <path
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        />
      </svg>
    ),
    iconBg: 'from-[#6d28d9] to-[#7c3aed]',
    label: 'Inbox',
    sub: 'Team conversations',
  },
  {
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
        <path
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          d="M18 20V10M12 20V4M6 20v-6"
        />
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

declare global {
  interface Window {
    FB?: {
      init: (options: {
        appId: string;
        cookie?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: any) => void,
        options: any
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

function WhatsAppIcon({ className = 'w-8 h-8' }: { className?: string }) {
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

export function WhatsAppStep({
  data,
  onChange,
  error,
}: Props) {
  const router = useRouter();

  const [connecting, setConnecting] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [embedError, setEmbedError] = useState('');

  /*
   * Load the Meta JavaScript SDK once.
   */
  useEffect(() => {
    if (window.FB) {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID!,
        cookie: true,
        xfbml: false,
        version: 'v23.0',
      });

      return;
    }

    window.fbAsyncInit = function () {
      window.FB?.init({
        appId: process.env.NEXT_PUBLIC_META_APP_ID!,
        cookie: true,
        xfbml: false,
        version: 'v23.0',
      });
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');

      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';

      document.body.appendChild(script);
    }
  }, []);

  /*
   * Receive Embedded Signup session information from Meta.
   */
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com') {
        return;
      }

      let data = event.data;

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }

      if (!data || data.type !== 'WA_EMBEDDED_SIGNUP') {
        return;
      }

      console.log('Meta Embedded Signup event:', data);

      if (
        data.event !== 'FINISH' &&
        data.event !== 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
      ) {
        return;
      }

      const sessionData = data.data || {};

      const wabaIdFromMeta = sessionData.waba_id || '';
      const phoneNumberIdFromMeta =
        sessionData.phone_number_id || '';
      const businessIdFromMeta =
        sessionData.business_id || '';

      /*
       * The actual OAuth code is received separately
       * from FB.login(). Store it temporarily so that
       * the login callback can send it to our backend.
       */
      (window as any).__DISPEZO_EMBED_DATA__ = {
        event: data.event,
        wabaId: wabaIdFromMeta,
        phoneNumberId: phoneNumberIdFromMeta,
        businessId: businessIdFromMeta,
        version: data.version,
      };
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleEmbeddedSignup = () => {
    if (connecting || data.whatsappConnected) {
      return;
    }

    setConnecting(true);
    setEmbedError('');

    if (!window.FB) {
      setConnecting(false);
      setEmbedError(
        'Meta SDK is still loading. Please wait a moment and try again.'
      );
      return;
    }

    const configId =
      process.env.NEXT_PUBLIC_META_CONFIG_ID;

    if (!configId) {
      setConnecting(false);
      setEmbedError(
        'Meta Embedded Signup configuration is missing.'
      );
      return;
    }

    window.FB.login(
      async (response: any) => {
        console.log('FB.login response:', response);

        if (!response?.authResponse?.code) {
          setConnecting(false);
          setEmbedError(
            'Meta Embedded Signup was cancelled or did not return an authorization code.'
          );
          return;
        }

        /*
         * Meta's postMessage event can arrive immediately before
         * or immediately after the FB.login callback. Give it a
         * short moment to arrive.
         */
        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        );

        const embedData =
          (window as any).__DISPEZO_EMBED_DATA__ || {};

        try {
          const res = await fetch(
            '/api/onboarding/embedded-signup',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code: response.authResponse.code,

                event: embedData.event || 'FINISH',

                wabaId: embedData.wabaId || null,

                phoneNumberId:
                  embedData.phoneNumberId || null,

                businessId:
                  embedData.businessId || null,
              }),
            }
          );

          const result = await res.json();

          if (!res.ok || !result.success) {
            throw new Error(
              result.error ||
                result.message ||
                'Unable to complete WhatsApp onboarding.'
            );
          }

          onChange({
            whatsappConnected: true,
          });

          setConnecting(false);

          setTimeout(() => {
            router.push('/whatsapp');
          }, 1000);
        } catch (err: any) {
          console.error(
            'Embedded Signup backend error:',
            err
          );

          setConnecting(false);
          setEmbedError(
            err?.message ||
              'Unable to complete WhatsApp onboarding.'
          );
        }
      },
      {
        config_id: configId,

        /*
         * Required for WhatsApp Business App Coexistence.
         */
        extras: {
          featureType:
            'whatsapp_business_app_onboarding',
          sessionInfoVersion: '3',
        },
      }
    );
  };

  const verifyManualConnection = async () => {
    if (
      !accessToken.trim() ||
      !wabaId.trim()
    ) {
      alert(
        'Please enter your Access Token and WABA ID.'
      );
      return;
    }

    try {
      setVerifying(true);

      const res = await fetch(
        '/api/onboarding/verify-whatsapp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken,
            wabaId,
          }),
        }
      );

      const result = await res.json();

      if (!result.success) {
        throw new Error(
          result.error ||
            result.message ||
            'Unable to verify WhatsApp.'
        );
      }

      onChange({
        whatsappConnected: true,
      });

      setTimeout(() => {
        router.push('/whatsapp');
      }, 1000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="px-9 py-7">
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

            <div className="text-[12px] font-semibold text-[#1d1f2e]">
              {b.label}
            </div>

            <div className="text-[11px] text-[#9ca3af] mt-0.5">
              {b.sub}
            </div>
          </div>
        ))}
      </div>

      {!data.whatsappConnected ? (
        <>
          <div className="border-2 border-dashed border-[#c4b5fd] rounded-2xl bg-gradient-to-br from-[#faf7ff] to-[#eff6ff] p-8 text-center mb-5">
            <div
              className="w-16 h-16 rounded-[18px] bg-[#1877f2] flex items-center justify-center mx-auto mb-4"
              style={{
                boxShadow:
                  '0 8px 24px rgba(24,119,242,0.3)',
              }}
            >
              <svg
                width="32"
                height="32"
                fill="white"
                viewBox="0 0 24 24"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>

            <h3 className="text-[17px] font-bold text-[#0f0d1a] mb-1.5">
              Connect via Meta Embedded Signup
            </h3>

            <p className="text-sm text-[#6b7280] leading-relaxed max-w-[700px] mx-auto mb-6">
              Connect your WhatsApp Business Account securely
              through Meta. You can also connect an existing
              WhatsApp Business App number.
            </p>

            <button
              type="button"
              onClick={handleEmbeddedSignup}
              disabled={connecting}
              className={cn(
                'inline-flex items-center justify-center gap-2.5 h-12 px-8 rounded-xl',
                'bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] text-white',
                'text-[15px] font-semibold transition-opacity duration-150',
                'shadow-[0_6px_20px_rgba(109,40,217,0.35)]',
                connecting
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:opacity-90'
              )}
            >
              {connecting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting to Meta…
                </>
              ) : (
                <>
                  <span className="text-lg">f</span>
                  Connect with Meta
                </>
              )}
            </button>

            {embedError && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {embedError}
              </div>
            )}

            <div className="flex items-center justify-center gap-5 mt-4">
              {[
                {
                  Icon: Shield,
                  text: 'SSL Secured',
                },
                {
                  Icon: Check,
                  text: 'Official Partner',
                },
                {
                  Icon: Zap,
                  text: '3 min setup',
                },
              ].map(({ Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-[11.5px] text-[#9ca3af]"
                >
                  <Icon className="w-3 h-3" />
                  {text}
                </div>
              ))}
            </div>

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
                    Connect using your existing WhatsApp
                    Cloud API Access Token.
                  </p>
                </div>
              </div>

              <label className="block text-sm font-medium mb-2">
                WhatsApp Cloud API Access Token
              </label>

              <input
                type="password"
                value={accessToken}
                onChange={(e) =>
                  setAccessToken(e.target.value)
                }
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
                  onChange={(e) =>
                    setWabaId(e.target.value)
                  }
                  placeholder="123456789012345"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />

                <p className="mt-2 text-xs text-slate-500">
                  Available in Meta Business Portfolio →
                  WhatsApp Accounts or under the WhatsApp
                  API Setup page.
                </p>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Permanent System User Access Token is
                recommended. The token is securely encrypted
                before being stored.
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
                  'Verify & Connect'
                )}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <Check
              className="w-7 h-7 text-white"
              strokeWidth={3}
            />
          </div>

          <div className="flex-1">
            <div className="text-sm font-bold text-emerald-800">
              WhatsApp Business Connected
            </div>

            <div className="text-xs text-emerald-600 mt-0.5">
              Your account is verified and ready to send
              messages
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <Check
              className="w-4 h-4 text-white"
              strokeWidth={3}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}