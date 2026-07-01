import { AppLayout } from "@/components/AppLayout";
import InactivityLogout from "@/components/InactivityLogout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <InactivityLogout />
      {children}
    </AppLayout>
  );
}