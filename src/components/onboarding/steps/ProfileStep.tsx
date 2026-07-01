'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { OtpInput } from '@/components/onboarding/OtpInput';
import { cn } from '@/lib/utils';
import { COUNTRY_CODES, COUNTRIES, type OnboardingData } from '@/lib/types';

interface Props {
  data: OnboardingData;
  onChange: (patch: Partial<OnboardingData>) => void;
  error?: string;
}

const inputCls = cn(
  'w-full h-[44px] border-[1.5px] border-[#e2e5ed] rounded-[10px] px-3.5',
  'text-sm text-[#1d1f2e] bg-[#fafbfc] outline-none',
  'hover:border-[#c4b5fd] focus:border-[#6d28d9] focus:bg-white',
  'focus:shadow-[0_0_0_3px_rgba(109,40,217,0.1)] transition-all duration-150'
);

const labelCls = 'block text-[12.5px] font-medium text-[#374151] mb-1.5';
const sectionTitleCls = 'text-[11.5px] font-semibold text-[#9ca3af] uppercase tracking-[0.07em] mb-3.5';

export function ProfileStep({ data, onChange, error }: Props) {
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const t = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCountdown]);

  // Auto-verify OTP when 6 digits entered
  useEffect(() => {
    if (data.otp.length === 6 && !data.otpVerified) {
      onChange({ otpVerified: true });
    } else if (data.otp.length < 6 && data.otpVerified) {
      onChange({ otpVerified: false });
    }
  }, [data.otp]);

  const handleSendOtp = async () => {
    if (!data.phoneNumber.trim() || sendingOtp) return;
    setSendingOtp(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSendingOtp(false);
    onChange({ otpSent: true, otp: '', otpVerified: false });
    setResendCountdown(45);
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    onChange({ otp: '', otpVerified: false });
    setSendingOtp(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSendingOtp(false);
    setResendCountdown(45);
  };

  return (
    <div className="px-9 py-7">
      {/* ── Contact Number ── */}
      <div className={sectionTitleCls}>Contact Number</div>

      <div className="flex gap-3 mb-4">
        {/* Country code */}
        <div className="w-[130px] flex-shrink-0">
          <label className={labelCls}>
            Code <span className="text-red-500">*</span>
          </label>
          <select
            value={data.countryCode}
            onChange={(e) => onChange({ countryCode: e.target.value })}
            className={cn(inputCls, 'pr-7 cursor-pointer appearance-none bg-no-repeat')}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 10px center',
              backgroundSize: '12px',
            }}
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label} {c.country}
              </option>
            ))}
          </select>
        </div>

        {/* Phone number + send OTP */}
        <div className="flex-1">
          <label className={labelCls}>
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="tel"
              value={data.phoneNumber}
              onChange={(e) => onChange({ phoneNumber: e.target.value })}
              placeholder="98765 43210"
              disabled={data.otpSent}
              className={cn(
                inputCls,
                'flex-1',
                data.otpSent && 'opacity-60 cursor-not-allowed'
              )}
            />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp || !data.phoneNumber.trim() || data.otpVerified}
              className={cn(
                'flex-shrink-0 h-[44px] px-4 rounded-[10px] text-sm font-semibold transition-all duration-150',
                'border-[1.5px] border-[#6d28d9] text-[#6d28d9]',
                'hover:bg-[#6d28d9] hover:text-white',
                (sendingOtp || !data.phoneNumber.trim() || data.otpVerified) &&
                  'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-[#6d28d9]',
                data.otpVerified && 'border-emerald-500 text-emerald-600 hover:text-emerald-600'
              )}
            >
              {sendingOtp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : data.otpVerified ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5" />
                  {data.otpSent ? 'Resend' : 'Send OTP'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* OTP boxes – appears after sending */}
      {data.otpSent && (
        <div className="mb-5 p-4 rounded-xl bg-[#faf7ff] border border-[#e9d5ff] animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <label className={cn(labelCls, 'mb-3')}>
            Verification Code <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <OtpInput value={data.otp} onChange={(v) => onChange({ otp: v })} />
            {data.otpVerified && (
              <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-semibold animate-in fade-in-0 duration-200">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </div>
            )}
          </div>
          <p className="text-xs text-[#6b7280] mt-2.5">
            OTP sent to {data.countryCode} {data.phoneNumber}
            {resendCountdown > 0 ? (
              <span className="ml-1.5">· Resend in {resendCountdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="ml-1.5 text-[#6d28d9] font-medium hover:underline"
              >
                · Resend now
              </button>
            )}
          </p>
        </div>
      )}

      {/* ── Address ── */}
      <div className={cn(sectionTitleCls, 'mt-6')}>Billing Address</div>

      <div className="space-y-3.5">
        <div>
          <label className={labelCls}>
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.addressLine1}
            onChange={(e) => onChange({ addressLine1: e.target.value })}
            placeholder="Street address or P.O. Box"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>
            Address Line 2{' '}
            <span className="text-[#9ca3af] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={data.addressLine2}
            onChange={(e) => onChange({ addressLine2: e.target.value })}
            placeholder="Apartment, suite, unit, floor"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="Mumbai"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.state}
              onChange={(e) => onChange({ state: e.target.value })}
              placeholder="Maharashtra"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.postalCode}
              onChange={(e) => onChange({ postalCode: e.target.value })}
              placeholder="400001"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={data.country}
              onChange={(e) => onChange({ country: e.target.value })}
              className={cn(inputCls, 'cursor-pointer appearance-none bg-no-repeat pr-7')}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 10px center',
                backgroundSize: '12px',
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
