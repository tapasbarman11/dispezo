"use client";

import { BRAND } from "@/config/branding";
import {
  User,
  Building2,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

interface Props {
  currentStep: number;
  completionPercent: number;
}

export default function ProgressSidebar({
  currentStep,
  completionPercent,
}: Props) {
  const steps = [
    {
      id: 1,
      title: "Profile",
      subtitle: "Personal Information",
      icon: User,
    },
    {
      id: 2,
      title: "Business",
      subtitle: "Business Details",
      icon: Building2,
    },
    {
      id: 3,
      title: "WhatsApp",
      subtitle: "Connect Account",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="w-full lg:w-80 rounded-[32px] border border-border bg-card p-8 h-fit">

      <img
        src={BRAND.logo}
        alt={BRAND.name}
        className="h-12 mb-10"
      />

      <div className="mb-8">
        <h3 className="font-semibold text-lg">
          Setup Progress
        </h3>

        <p className="text-sm text-muted-foreground mt-1">
          Complete all steps to start
          sending WhatsApp campaigns.
        </p>
      </div>

      <div className="space-y-4">

        {steps.map((step) => {
          const Icon = step.icon;

          const isActive =
            currentStep === step.id;

          const isCompleted =
            currentStep > step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all
              ${
                isActive
                  ? "bg-primary/10 border border-primary/20"
                  : ""
              }`}
            >
              <div
                className={`size-11 rounded-xl flex items-center justify-center
                ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "gradient-brand text-white"
                    : "bg-muted"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>

              <div>
                <div className="font-medium">
                  {step.title}
                </div>

                <div className="text-xs text-muted-foreground">
                  {step.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 border border-border rounded-2xl p-5">

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">
            Completion
          </span>

          <span className="font-bold">
            {completionPercent}%
          </span>
        </div>

        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full gradient-brand"
            style={{
              width: `${completionPercent}%`,
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          You're almost ready 🚀
        </p>
      </div>
    </div>
  );
}