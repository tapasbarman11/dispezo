'use client';

import { Shield, Check } from 'lucide-react';
import type { OnboardingStep } from '@/lib/types';
import { BRAND } from '@/config/branding';
import { ReactNode } from "react";

interface StepContent {
  stepLabel: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  illustration: React.ReactNode;
  title: string;
  description: ReactNode;
  checks: string[];
  footnote?: React.ReactNode;
}

function ProfileIllustration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
      <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
        <svg width="42" height="42" fill="none" viewBox="0 0 24 24">
          <path stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round"
            d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" cx="12" cy="7" r="4" />
        </svg>
      </div>
      <div className="flex gap-2">
        <div className="w-10 h-1.5 rounded-full bg-white/80" />
        <div className="w-7 h-1.5 rounded-full bg-white/30" />
        <div className="w-5 h-1.5 rounded-full bg-white/30" />
      </div>
      <div className="flex gap-1.5">
        {['#22c55e', '#3b82f6', '#6d28d9'].map((c) => (
          <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function BusinessIllustration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center flex-col gap-3">
      <div className="w-20 h-20 rounded-[18px] bg-white/10 border-2 border-white/20 flex items-center justify-center">
        <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
          <rect stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" x="2" y="7" width="20" height="14" rx="2" />
          <path stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round"
            d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center px-4">
        {['E-Commerce', 'Finance', 'Healthcare'].map((t) => (
          <div key={t}
            className="px-2.5 py-1 rounded-full text-[10px] font-medium"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }}>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

function WhatsAppIllustration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="w-[72px] h-[72px] rounded-full bg-[#25D366] flex items-center justify-center"
          style={{ boxShadow: '0 0 0 12px rgba(37,211,102,0.2)' }}>
          <svg width="40" height="40" fill="white" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </div>
        <div
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#1877f2] flex items-center justify-content-center border-[3px] border-[#064e3b]"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const STEP_CONTENT: Record<number, StepContent> = {
  1: {
    stepLabel: 'Step 1 of 3',
    gradientFrom: '#1e0a3c',
    gradientVia: '#1e3a7a',
    gradientTo: '#0e4d2e',
    illustration: <ProfileIllustration />,
    title: 'Your Personal Profile',
    description: (
      <>
        We need a few details to verify your identity and set up your{" "}
        <span className="font-semibold">{BRAND.name}</span> account securely.
      </>
    ),
    checks: ['Phone verified with OTP', 'Billing & shipping address', 'Secure & encrypted storage'],
    footnote: (
      <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
        <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span className="text-xs font-medium text-emerald-700">SSL encrypted · GDPR compliant</span>
      </div>
    ),
  },
  2: {
    stepLabel: 'Step 2 of 3',
    gradientFrom: '#0c2a4a',
    gradientVia: '#1a4f7a',
    gradientTo: '#0e3d1f',
    illustration: <BusinessIllustration />,
    title: 'Your Business Details',
    description: (
      <>
        We personalize your{" "}
        <span className="font-semibold">{BRAND.name}</span>{" "}
        experience based on your industry—from templates to automation flows.
      </>
    ),
    checks: ['Industry-specific templates', 'Personalized automation flows', 'Tailored onboarding dashboard'],
  },
  3: {
    stepLabel: 'Final Step',
    gradientFrom: '#064e3b',
    gradientVia: '#065f46',
    gradientTo: '#1e3a7a',
    illustration: <WhatsAppIllustration />,
    title: 'Connect WhatsApp Business',
    description: 'Link your official WhatsApp Business number and start sending at scale — all through Meta\'s secure platform.',
    checks: [
      'Official Meta Business Partner',
      'Connect in under 3 minutes',
      'No downtime on existing number',
      'End-to-end encrypted',
    ],
  },
};

interface Props {
  step: OnboardingStep;
}

export function ContextPanel({ step }: Props) {
  const num = step;
  const content = STEP_CONTENT[num];

  const gradientColor = num === 1 ? '#6d28d9' : num === 2 ? '#3b82f6' : '#22c55e';

  return (
    <div className="w-[300px] flex-shrink-0 sticky top-[80px]">
      {/* Step badge */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${gradientColor}, ${num === 1 ? '#3b82f6' : num === 2 ? '#22c55e' : '#16a34a'})` }}
        >
          {num}
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: gradientColor }}>
          {content.stepLabel}
        </span>
      </div>

      {/* Illustration card */}
      <div
        className="w-full rounded-[18px] overflow-hidden mb-6 relative"
        style={{ aspectRatio: '4/3', background: `linear-gradient(145deg, ${content.gradientFrom}, ${content.gradientVia}, ${content.gradientTo})` }}
      >
        {content.illustration}
      </div>

      {/* Title & description */}
      <h2 className="text-[22px] font-extrabold text-[#0f0d1a] leading-tight mb-2.5">
        {content.title}
      </h2>
      <p className="text-sm text-[#6b7280] leading-relaxed mb-6">
        {content.description}
      </p>

      {/* Checklist */}
      <div className="flex flex-col gap-2.5 mb-6">
        {content.checks.map((item) => (
          <div key={item} className="flex items-center gap-2.5 text-sm font-medium text-[#374151]">
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-emerald-600" strokeWidth={3} />
            </div>
            {item}
          </div>
        ))}
      </div>

      {/* Footnote */}
      {content.footnote}
    </div>
  );
}
