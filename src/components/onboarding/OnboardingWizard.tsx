'use client';
import { BRAND } from "@/config/branding";
import { useState, useEffect } from "react";
import { ReactNode } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';

import { PillStepper } from './PillStepper';
import { ContextPanel } from './ContextPanel';
import { ProfileStep } from './steps/ProfileStep';
import { BusinessStep } from './steps/BusinessStep';
import { WhatsAppStep } from './steps/WhatsAppStep';

import {
  INITIAL_DATA,
  type OnboardingData,
  type OnboardingStep,
} from '@/lib/types';

import { cn } from '@/lib/utils';

function validateStep(
  step: OnboardingStep,
  data: OnboardingData
): string | null {
  if (step === 1) {
    if (!data.phoneNumber?.trim())
      return 'Please enter your phone number';

    if (!data.otpVerified)
      return 'Please verify your phone number';

    if (!data.addressLine1?.trim())
      return 'Address Line 1 is required';

    if (!data.city?.trim())
      return 'City is required';

    if (!data.state?.trim())
      return 'State is required';

    if (!data.postalCode?.trim())
      return 'Postal code is required';
  }

  if (step === 2) {
    if (!data.businessName?.trim())
      return 'Business name is required';

    if (!data.businessType)
      return 'Please select a business type';
  }

  if (step === 3) {
    if (!data.whatsappConnected)
      return 'Please connect WhatsApp';
  }

  return null;
}

const FORM_HEADERS: Record<
  number,
  {
    title: string;
    subtitle: ReactNode;
  }
> = {
  1: {
    title: 'Tell us about yourself',
    subtitle:
      'Enter your contact number and address details',
  },
  2: {
    title: 'Your Business',
    subtitle: (
      <>
        Help us tailor <strong>{BRAND.name}</strong> to your industry
      </>
    ),
  },
  3: {
    title: 'Connect WhatsApp',
    subtitle:
      'Link your WhatsApp Business Account',
  },
};

export default function OnboardingWizard() {
  const [step, setStep] =
    useState<OnboardingStep>(1);

  const [data, setData] =
    useState<OnboardingData>({
      ...INITIAL_DATA,
    });

  useEffect(() => {
    const loadData = async () => {
      try {
        let profileCompleted = false;
        let businessCompleted = false;
        let whatsappConnected = false;

        // ===========================
        // PROFILE
        // ===========================

        const userResponse = await fetch("/api/users/me");

        if (userResponse.ok) {
          const user = await userResponse.json();

          profileCompleted = !!(
            user.phone &&
            user.address_line_1 &&
            user.city &&
            user.state &&
            user.postal_code
          );

          setData((prev) => ({
            ...prev,
            phoneNumber: user.phone || "",
            countryCode: user.country_code || "+91",
            country: user.country || "India",
            addressLine1: user.address_line_1 || "",
            addressLine2: user.address_line_2 || "",
            city: user.city || "",
            state: user.state || "",
            postalCode: user.postal_code || "",
            otpVerified: !!user.phone,
            otpSent: !!user.phone,
          }));
        }

        // ===========================
        // BUSINESS
        // ===========================

        const businessResponse = await fetch(
          "/api/organizations/default"
        );

        if (businessResponse.ok) {
          const business = await businessResponse.json();

          businessCompleted = !!(
            business.name &&
            business.business_type
          );

          setData((prev) => ({
            ...prev,
            businessName: business.name || "",
            businessType: business.business_type || "",
            website: business.website || "",
          }));
        }

        // ===========================
        // WHATSAPP
        // ===========================

        const whatsappResponse = await fetch(
          "/api/onboarding/status"
        );

        if (whatsappResponse.ok) {
          const whatsapp = await whatsappResponse.json();

          whatsappConnected =
             whatsapp.whatsappCount > 0;

          setData((prev) => ({
            ...prev,
            whatsappConnected,
          }));
        }

        // ===========================
        // AUTO RESUME
        // ===========================

        if (
          profileCompleted &&
          businessCompleted &&
          whatsappConnected
        ) {
          window.location.replace("/whatsapp");
          return;
        }

        if (
          profileCompleted &&
          businessCompleted &&
          !whatsappConnected
        ) {
          setStep(3);
        } else if (
          profileCompleted &&
          !businessCompleted
        ) {
          setStep(2);
        } else {
          setStep(1);
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "ONBOARDING LOAD ERROR:",
          error
        );
      }
    };

    loadData();
  }, []);

  const [error, setError] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const patch = (
    updates: Partial<OnboardingData>
  ) => {
    setData((prev) => ({
      ...prev,
      ...updates,
    }));

    setError(null);
  };

  const handleBack = () => {
    if (step === 1) return;

    setStep(
      (prev) =>
        ((prev - 1) as OnboardingStep)
    );

    setError(null);
  };
  const handleSkip = () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      window.location.href = "/dashboard";
      return;
    }
  };
  const handleContinue = async () => {
    const validationError =
      validateStep(step, data);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // PROFILE

      if (step === 1) {
        const response = await fetch(
          "/api/users/create",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              phone: data.phoneNumber,
              countryCode:
                data.countryCode,
              country: data.country,
              addressLine1:
                data.addressLine1,
              addressLine2:
                data.addressLine2,
              city: data.city,
              state: data.state,
              postalCode:
                data.postalCode,
            }),
          }
        );

        const result =
          await response.json();

        if (!result.success) {
          throw new Error(
            result.error
          );
        }

        setStep(2);
        return;
      }

      // BUSINESS

      if (step === 2) {
        const response = await fetch(
          "/api/organizations/create",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              businessName:
                data.businessName,
              businessType:
                data.businessType,
              website:
                data.website,
            }),
          }
        );

        const result =
          await response.json();

        if (!result.success) {
          throw new Error(
            result.error
          );
        }

        setStep(3);
        return;
      }

      // WHATSAPP

      if (step === 3) {
        window.location.href =
          "/dashboard";
      }
    } catch (error: any) {
      setError(
        error.message ||
        "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f4f6fb]">
        <div className="flex flex-col items-center">

          {/* Logo */}
          <div className="relative flex items-center justify-center">

            <div className="absolute h-28 w-28 rounded-full bg-violet-500/15 animate-ping" />

            <div className="absolute h-24 w-24 rounded-full bg-violet-500/10 animate-pulse" />

            <Image
              src={BRAND.logo}
              alt={BRAND.name}
              width={170}
              height={60}
              priority
              className="relative h-20 w-auto object-contain"
            />
          </div>

          {/* Subtitle */}
          <p className="mt-2 text-sm text-slate-500">
            Preparing your workspace...
          </p>

          {/* Progress Bar */}
          <div className="mt-8 h-2 w-72 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-green-500" />
          </div>

        </div>
      </div >
    );
  }
  const header = FORM_HEADERS[step];

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <nav className="sticky top-0 z-50 h-25 bg-white/100 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8">

        <div className="flex items-center shrink-0">
          <Image
            src={BRAND.logo}
            alt={BRAND.name}
            width={180}
            height={70}
            className="h-14 w-auto object-contain"
            priority
          />
        </div>

        <PillStepper current={step} />

        <div className="text-sm text-[#6b7280]">
          Setup Wizard
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex gap-8 h-full">

          <ContextPanel step={step} />

          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#e5e7eb] flex flex-col">

            <div className="px-8 py-6 border-b border-[#f1f5f9]">
              <h2 className="text-2xl font-bold">
                {header.title}
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                {header.subtitle}
              </p>
            </div>

            <div className="flex-1 p-0">

              {step === 1 && (
                <ProfileStep
                  data={data}
                  onChange={patch}
                  error={
                    error || undefined
                  }
                />
              )}

              {step === 2 && (
                <BusinessStep
                  data={data}
                  onChange={patch}
                  error={
                    error || undefined
                  }
                />
              )}

              {step === 3 && (
                <WhatsAppStep
                  data={data}
                  onChange={patch}
                  error={
                    error || undefined
                  }
                />
              )}
            </div>

            <div className="flex items-center justify-between px-8 py-5 border-t border-[#f1f5f9] flex-shrink-0">

              <div>
                {step !== 1 && (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg border"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
              </div>

              {step !== 3 && (
                <div className="flex items-center gap-3">

                  <button
                    onClick={handleSkip}
                    className="px-5 py-2 rounded-lg border border-[#d1d5db] text-sm font-medium"
                  >
                    Skip
                  </button>

                  <button
                    onClick={handleContinue}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-violet-600 text-white"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                </div>
              )}

              {step === 3 && (
                <button
                  onClick={handleSkip}
                  className="px-5 py-2 rounded-lg border border-[#d1d5db] text-sm font-medium"
                >
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}