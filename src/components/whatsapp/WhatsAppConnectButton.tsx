'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    FB?: { init: (options: any) => void; login: (callback: (response: any) => void, options: any) => void };
    fbAsyncInit?: () => void;
  }
}

function WhatsAppIcon({ className = 'size-4' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.86 11.86 0 0 0 12.05 0C5.5 0 .17 5.32.17 11.87c0 2.09.55 4.13 1.59 5.93L.07 24l6.34-1.66a11.86 11.86 0 0 0 5.64 1.43h.01c6.54 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.15-3.43-8.4Zm-8.44 18.25h-.01a9.84 9.84 0 0 1-5.02-1.38l-.36-.21-3.76.98 1-3.66-.23-.38a9.82 9.82 0 0 1-1.51-5.23C2.17 6.44 6.6 2 12.05 2a9.83 9.83 0 0 1 7 2.9 9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.43 9.86-9.88 9.86Zm5.41-7.39c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.23 1.35.2 1.86.12.57-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.17-1.43-.08-.12-.27-.2-.57-.35Z" /></svg>;
}

export default function WhatsAppConnectButton({ onConnected, compact = false, label = 'Connect WhatsApp' }: { onConnected?: () => void; compact?: boolean; label?: string }) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.FB) { window.FB.init({ appId: process.env.NEXT_PUBLIC_META_APP_ID!, cookie: true, xfbml: false, version: process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v25.0' }); return; }
    window.fbAsyncInit = () => window.FB?.init({ appId: process.env.NEXT_PUBLIC_META_APP_ID!, cookie: true, xfbml: false, version: process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v25.0' });
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

    const solutionId = process.env.NEXT_PUBLIC_META_SOLUTION_ID;
    const extras = solutionId ? { setup: { solutionID: solutionId } } : undefined;

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
    }, {
      config_id: configId,
      auth_type: 'rerequest',
      response_type: 'code',
      override_default_response_type: true,
      ...(extras ? { extras } : {}),
    });
  };

  return <div><button type="button" onClick={connect} disabled={connecting} className={`${compact ? 'h-9 px-3 text-xs' : 'h-11 px-5 text-sm'} inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#6d28d9] to-[#3b82f6] font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60`}>{connecting ? <Loader2 className="size-3.5 animate-spin" /> : <WhatsAppIcon className="size-3.5" />}{connecting ? 'Connecting…' : label}</button>{error && <p className="mt-2 max-w-sm text-xs text-red-600">{error}</p>}</div>;
}
