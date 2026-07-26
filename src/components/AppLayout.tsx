"use client";
import { BRAND } from "@/config/branding";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  FileText,
  Send,
  BarChart3,
  Settings,
} from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/broadcasts", label: "Broadcasts", icon: Send },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const publicRoutes = ["/", "/login"];

  if (publicRoutes.includes(path)) {
    return <>{children}</>;
  }
  const { data: session } = useSession();
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside
        className="
    fixed
    inset-y-0
    left-0
    z-40
    w-72
    flex
    flex-col
    bg-gradient-to-b
   from-brand-purple/15
via-brand-blue/5
to-white
    border-r
    border-slate-200
    overflow-hidden
  "
      >
        <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-brand-purple/25 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 -left-20 h-72 w-72 rounded-full bg-brand-green/15 blur-[120px]" />

        {/* LOGO */}
        <div className="relative flex justify-center px-6 pt-8 pb-6">
          <img
            src={BRAND.logo}
            alt={BRAND.name}
            className="
      w-44
      object-contain
      transition-transform
      duration-300
      hover:scale-105"
          />
        </div>
        <nav className="relative flex-1 px-4 py-3 space-y-2">
          {nav.map((n) => {
            const Icon = n.icon;

            const active = path === n.to || path.startsWith(n.to + "/");

            return (
              <Link
                key={n.to}
                href={n.to}
                className={`
    group
    flex
    items-center
    hover:translate-x-1
    gap-3
    px-4
    py-3
    rounded-2xl
    text-[15px]
    font-medium
    transition-all
    duration-300

    ${active
                    ? `
          bg-white
          text-brand-purple
          shadow-lg
          border
          border-white
        `
                    : `text-slate-700 hover:bg-brand-purple/10 hover:text-brand-purple hover:shadow-md hover:border hover:border-brand-purple/30`
                  }
  `}
              >
                {n.label}

                {active && (
                  <span className="ml-auto size-1.5 rounded-full gradient-brand" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="relative p-4 border-t border-white/10">
          <button
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
            className="
    w-full
    flex
    items-center
    gap-3
    px-4
    py-3
    rounded-2xl
    bg-white/80
    border
    border-slate-200
    text-slate-700
    shadow-sm
    hover:bg-red-50
    hover:text-red-600
    transition-all
    duration-300
  "
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
        <div className="relative p-4">
          <div
            className="
    rounded-2xl
    bg-white/80
    backdrop-blur-xl
    border
    border-slate-200
    p-4
    shadow-lg
  "
          >
            <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">
              Status
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-60 animate-ping" />

                <span className="relative inline-flex rounded-full size-2 bg-brand-green" />
              </span>

              <span className="text-xs font-medium text-slate-700">
                WhatsApp API Live
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-72 min-w-0">
        <header className="sticky top-0 z-30 h-20 px-8 flex items-center justify-between border-b border-slate-200/70 bg-white/80 backdrop-blur-2xl">
          <div className="flex items-center"></div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-semibold text-sm">{session?.user?.name}</div>

              <div className="text-xs text-muted-foreground">
                {session?.user?.email}
              </div>
            </div>

            <div className="h-10 w-10 rounded-full gradient-brand flex items-center justify-center text-white font-semibold">
              {session?.user?.name?.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-8 w-full">{children}</main>
      </div>
    </div>
  );
}
