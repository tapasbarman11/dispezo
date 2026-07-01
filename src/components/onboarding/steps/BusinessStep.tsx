"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  BUSINESS_TYPES,
  type OnboardingData,
} from "@/lib/types";

interface Props {
  data: OnboardingData;
  onChange: (
    patch: Partial<OnboardingData>
  ) => void;
  error?: string;
}

const inputCls = cn(
  "w-full h-[44px] border-[1.5px] border-[#e2e5ed] rounded-[10px] px-3.5",
  "text-sm text-[#1d1f2e] bg-[#fafbfc] outline-none",
  "hover:border-[#c4b5fd] focus:border-[#6d28d9] focus:bg-white",
  "focus:shadow-[0_0_0_3px_rgba(109,40,217,0.1)] transition-all duration-150"
);

const labelCls =
  "block text-[12px] font-medium text-[#374151] mb-1";

const sectionTitleCls =
  "text-[11px] font-semibold text-[#9ca3af] uppercase tracking-[0.05em] mb-2";

export function BusinessStep({
  data,
  onChange,
  error,
}: Props) {
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        const response = await fetch(
          "/api/organizations/default"
        );

        if (!response.ok) return;

        const business =
          await response.json();

        onChange({
          businessName:
            business.name || "",
          businessType:
            business.business_type ||
            "",
          website:
            business.website || "",
        });
      } catch (err) {
        console.error(err);
      }
    };

    if (!data.businessName) {
      loadBusiness();
    }
  }, []);

  return (
    <div className="px-7 py-4">

      <div className={sectionTitleCls}>
        Company
      </div>

      <div className="mb-4">
        <label className={labelCls}>
          Business Name{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <input
          type="text"
          value={data.businessName}
          onChange={(e) =>
            onChange({
              businessName:
                e.target.value,
            })
          }
          placeholder="Nails Aura"
          className={inputCls}
        />
      </div>

      <div className={sectionTitleCls}>
        Industry
      </div>

      <div className="mb-4">
        <label className={labelCls}>
          Business Type{" "}
          <span className="text-red-500">
            *
          </span>
        </label>

        <div className="grid grid-cols-6 gap-2 mt-1.5">

          {BUSINESS_TYPES.map(
            (type) => {
              const selected =
                data.businessType ===
                type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      businessType: type.id,
                    })
                  }
                  className={cn(
                    "flex items-center justify-center py-2 px-2 rounded-xl border transition-all duration-150 cursor-pointer",
                    selected
                      ? "border-[#6d28d9] bg-[#f5f3ff]"
                      : "border-[#e2e5ed] bg-[#fafbfc] hover:border-[#c4b5fd] hover:bg-[#faf7ff]"
                  )}
                >
                  <div className="flex items-center gap-2 justify-center w-full">
                    <span className="text-base flex-shrink-0">
                      {type.icon}
                    </span>

                    <span
                      className={cn(
                        "text-[11px] font-medium text-left leading-tight",
                        selected
                          ? "text-[#6d28d9]"
                          : "text-[#1d1f2e]"
                      )}
                    >
                      {type.label}
                    </span>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      <div className={sectionTitleCls}>
        Online Presence
      </div>

      <div>
        <label className={labelCls}>
          Business Website{" "}
          <span className="text-[#9ca3af] font-normal">
            (optional)
          </span>
        </label>

        <div className="flex">

          <div
            className={cn(
              "flex-shrink-0 h-[44px] px-3.5 flex items-center",
              "bg-[#f3f4f6] border-[1.5px] border-[#e2e5ed] border-r-0",
              "rounded-l-[10px] text-sm font-medium text-[#6b7280]"
            )}
          >
            https://
          </div>

          <input
            type="text"
            value={data.website}
            onChange={(e) =>
              onChange({
                website:
                  e.target.value,
              })
            }
            placeholder="nailsaura.in"
            className={cn(
              inputCls,
              "rounded-l-none flex-1"
            )}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}