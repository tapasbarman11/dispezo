"use client";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage your workspace, team, billing and API access."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { t: "Business Profile", d: "Name, logo, default sender, branding." },
          { t: "Team Members", d: "Invite teammates and manage roles." },
          { t: "Billing", d: "Plan, usage, invoices and payment method." },
          { t: "API & Webhooks", d: "Programmatic access and event delivery." },
          { t: "Notifications", d: "How and when we alert you." },
          { t: "Security", d: "2FA, sessions and audit logs." },
        ].map(s => (
          <div key={s.t} className="glass rounded-2xl p-6 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition cursor-pointer">
            <div className="font-semibold">{s.t}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}