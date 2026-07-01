"use client";

import {
  User,
  Building2,
  MessageCircle,
  Check,
} from "lucide-react";

interface Props {
  currentStep: number;
}

export default function WizardStepper({
  currentStep,
}: Props) {
  const steps = [
    {
      id: 1,
      label: "PROFILE",
      icon: User,
    },
    {
      id: 2,
      label: "BUSINESS",
      icon: Building2,
    },
    {
      id: 3,
      label: "WHATSAPP",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-[32px] p-8 mb-8">

      <div className="flex items-center justify-between">

        {steps.map((step, index) => {
          const Icon = step.icon;

          const isActive =
            currentStep === step.id;

          const isCompleted =
            currentStep > step.id;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1"
            >
              <div className="flex flex-col items-center flex-1">

                <div
                  className={`
                    size-14 rounded-full
                    flex items-center justify-center
                    border-2 transition-all
                    ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                        ? "gradient-brand border-transparent text-white"
                        : "bg-background border-border text-muted-foreground"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="size-6" />
                  ) : (
                    <Icon className="size-6" />
                  )}
                </div>

                <div className="mt-3 text-center">

                  <div
                    className={`
                      text-xs font-bold tracking-wider
                      ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground"
                      }
                    `}
                  >
                    {step.label}
                  </div>

                  <div className="text-xs text-muted-foreground mt-1">
                    Step {step.id}
                  </div>
                </div>
              </div>

              {index <
                steps.length - 1 && (
                <div className="flex-1 h-[2px] bg-border mx-4 relative -top-8">

                  <div
                    className="absolute left-0 top-0 h-full bg-green-500 transition-all"
                    style={{
                      width:
                        currentStep >
                        step.id
                          ? "100%"
                          : "0%",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}