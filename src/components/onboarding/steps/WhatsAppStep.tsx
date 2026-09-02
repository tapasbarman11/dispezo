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

export function WhatsAppStep({
  data,
  onChange,
  error,
}: Props) {
  const router = useRouter();

  const [connecting, setConnecting] = useState(false);
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

        response_type: 'code',
        override_default_response_type: true,

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