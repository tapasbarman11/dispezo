'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OnboardingStep } from '@/lib/types';

const STEPS = [
  { id: 1, label: 'Profile' },
  { id: 2, label: 'Business' },
  { id: 3, label: 'WhatsApp' },
] as const;

interface Props {
  current: OnboardingStep;
}

export function PillStepper({ current }: Props) {
  const currentNum = current;
  return (
    <div className="flex items-center gap-1.5 bg-[#f0f2f7] rounded-full px-1.5 py-1.5">
      {STEPS.map((step) => {
        const isDone = currentNum > step.id;
        const isActive = currentNum === step.id;

        return (
          <div
            key={step.id}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
              isActive && 'bg-white text-[#0f0d1a] font-semibold shadow-sm',
              isDone && 'text-[#6b7280]',
              !isActive && !isDone && 'text-[#9ca3af]'
            )}
          >
            <div
              className={cn(
                'w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-all duration-200',
                isActive && 'bg-gradient-to-br from-[#6d28d9] to-[#3b82f6] text-white',
                isDone && 'bg-[#22c55e] text-white',
                !isActive && !isDone && 'bg-[#e5e8ef] text-[#9ca3af]'
              )}
            >
              {isDone ? <Check className="w-3 h-3" strokeWidth={3} /> : step.id}
            </div>
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
