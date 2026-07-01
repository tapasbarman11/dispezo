'use client';

import { useRef, KeyboardEvent, ClipboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = 6 }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focus = (idx: number) => {
    refs.current[idx]?.focus();
    refs.current[idx]?.select();
  };

  const handleKey = (idx: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = value.slice(0, idx) + value.slice(idx + 1);
      onChange(next);
      if (idx > 0) focus(idx - 1);
      return;
    }
    if (e.key === 'ArrowLeft' && idx > 0) { focus(idx - 1); return; }
    if (e.key === 'ArrowRight' && idx < length - 1) { focus(idx + 1); return; }
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      const arr = digits.slice();
      arr[idx] = e.key;
      onChange(arr.join('').replace(/\s/g, '').slice(0, length));
      if (idx < length - 1) focus(idx + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const nextIdx = Math.min(pasted.length, length - 1);
    focus(nextIdx);
  };

  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] ?? ''}
          onChange={() => {}}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={cn(
            'w-12 h-13 border-[1.5px] rounded-xl text-center text-xl font-bold outline-none transition-all duration-150',
            'bg-[#fafbfc] text-[#1d1f2e]',
            digits[i]
              ? 'border-[#6d28d9] bg-[#f5f3ff] text-[#6d28d9]'
              : 'border-[#e2e5ed] focus:border-[#6d28d9] focus:bg-white focus:shadow-[0_0_0_3px_rgba(109,40,217,0.1)]'
          )}
          style={{ height: '52px', width: '48px' }}
        />
      ))}
      <span className="text-2xl text-[#d1d5db] font-light select-none">—</span>
      {Array.from({ length: 3 }).map((_, i) => {
        const idx = i + 3;
        return (
          <input
            key={idx}
            ref={(el) => { refs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[idx] ?? ''}
            onChange={() => {}}
            onKeyDown={(e) => handleKey(idx, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={cn(
              'w-12 h-13 border-[1.5px] rounded-xl text-center text-xl font-bold outline-none transition-all duration-150',
              'bg-[#fafbfc] text-[#1d1f2e]',
              digits[idx]
                ? 'border-[#6d28d9] bg-[#f5f3ff] text-[#6d28d9]'
                : 'border-[#e2e5ed] focus:border-[#6d28d9] focus:bg-white focus:shadow-[0_0_0_3px_rgba(109,40,217,0.1)]'
            )}
            style={{ height: '52px', width: '48px' }}
          />
        );
      })}
    </div>
  );
}
