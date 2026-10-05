import WhatsAppBillingPanel from "@/components/whatsapp/WhatsAppBillingPanel";

export default function WhatsAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      {children}
      <WhatsAppBillingPanel />
    </div>
  );
}
