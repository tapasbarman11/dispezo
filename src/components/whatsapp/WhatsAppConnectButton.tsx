'use client';

import { useEffect, useState } from 'react';
import { Loader2, Facebook } from 'lucide-react';

declare global {
  interface Window {
    FB?: { init: (options: any) => void; login: (callback: (response: any) => void, options: any) => void };
    fbAsyncInit?: () => void;
  }
}

export default function WhatsAppConnectButton({ onConnected, compact = false }: { onConnected?: () => void; compact?: boolean }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.FB) { window.FB.init({ appId: process.env.NEXT_PUBLIC_META_APP_ID!, cookie: true, xfbml: false, version: 'v23.0' }); return; }
    window.fbAsyncInit = () => window.FB?.init({ appId: process.env.NEXT_PUBLIC_META_APP_ID!, cookie: true, xfbml: false, version: 'v23.0' });
    if (!document.getElementById('facebook-jssdk')) { const script = document.createElement('script'); script.id = 'facebook-jssdk'; script.src = 'https://connect.facebook.net/en_US/sdk.js'; script.async = true; script.defer = true; script.crossOrigin = 'anonymous'; document.body.appendChild(script); }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.facebook.com') return;
      let data = event.data;
      if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return; } }
      if (!data || data.type !== 'WA_EMBEDDED_SIGNUP') return;
      const sessionData = data.data || {};
      (window as any).__DISPEZO_EMBED_DATA__ = { event: data.event, wabaId: sessionData.waba_id || '', phoneNumberId: sessionData.phone_number_id || '', businessId: sessionData.business_id || '' };
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const connect = () => {
    if (connecting) return;
    setError('');
    if (!window.FB) { setError('Meta is still loading. Please try again in a moment.'); return; }
    const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;
    if (!configId) { setError('Meta Embedded Signup configuration is missing.'); return; }
    setConnecting(true);
    window.FB.login((response: any) => {
      if (!response?.authResponse?.code) { setConnecting(false); setError('Meta Embedded Signup was cancelled or did not return an authorization code.'); return; }
      void (async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const embedData = (window as any).__DISPEZO_EMBED_DATA__ || {};
        try {
          const res = await fetch('/api/onboarding/embedded-signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: response.authResponse.code, event: embedData.event || 'FINISH', wabaId: embedData.wabaId || null, phoneNumberId: embedData.phoneNumberId || null, businessId: embedData.businessId || null }) });
          const result = await res.json();
          if (!res.ok || !result.success) throw new Error(result.error || result.message || 'Unable to complete WhatsApp onboarding.');
          onConnected?.();
        } catch (err: any) { setError(err?.message || 'Unable to complete WhatsApp onboarding.'); }
        finally { setConnecting(false); }
      })();
    }, { config_id: configId, response_type: 'code', override_default_response_type: true, extras: { featureType: 'whatsapp_business_app_onboarding', sessionInfoVersion: '3' } });
  };

  return <div><button type="button" onClick={connect} disabled={connecting} className={`${compact ? 'h-10 px-4 text-xs' : 'h-11 px-5 text-sm'} inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}>{connecting ? <Loader2 className="size-4 animate-spin" /> : <Facebook className="size-4" />}{connecting ? 'Connecting…' : 'Connect WhatsApp'}</button>{error && <p className="mt-2 max-w-sm text-xs text-red-600">{error}</p>}</div>;
}
