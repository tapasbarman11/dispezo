"use client";
import { PageHeader } from "@/components/ui/page-header";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const trend = [
  { d: "W1", sent: 3200, delivered: 3190, read: 2400 },
  { d: "W2", sent: 4100, delivered: 4080, read: 3100 },
  { d: "W3", sent: 5400, delivered: 5380, read: 4500 },
  { d: "W4", sent: 6800, delivered: 6770, read: 5800 },
  { d: "W5", sent: 7200, delivered: 7180, read: 6100 },
  { d: "W6", sent: 8400, delivered: 8380, read: 7100 },
];

const pie = [
  { name: "Read", value: 68, color: "oklch(0.58 0.22 265)" },
  { name: "Delivered", value: 22, color: "oklch(0.55 0.25 300)" },
  { name: "Failed", value: 4, color: "oklch(0.65 0.2 25)" },
  { name: "Pending", value: 6, color: "oklch(0.82 0.04 260)" },
];

const kpis = [
  { l: "Sent", v: "324k", t: "+18%" },
  { l: "Delivered", v: "99.2%", t: "+0.1%" },
  { l: "Read Rate", v: "76.4%", t: "+5%" },
  { l: "Failed", v: "0.8%", t: "-0.2%" },
  { l: "Engagement", v: "42.1%", t: "+8%" },
];

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Intelligence"
        title="Analytics"
        description="Performance, engagement and conversion across all campaigns."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.l} className="glass rounded-2xl p-5 shadow-[var(--shadow-card)]">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k.l}</div>
            <div className="text-2xl font-bold tracking-tight tabular-nums mt-1">{k.v}</div>
            <div className="text-[11px] font-semibold text-brand-green mt-1">{k.t}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 glass rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="font-semibold">Delivery & Read Trend</h3>
              <p className="text-xs text-muted-foreground">Last 6 weeks</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid stroke="oklch(0.92 0.012 260)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.5 0.03 260)" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis stroke="oklch(0.5 0.03 260)" tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.012 260)" }} />
                <Line type="monotone" dataKey="sent" stroke="oklch(0.58 0.22 265)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="delivered" stroke="oklch(0.55 0.25 300)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="read" stroke="oklch(0.72 0.18 150)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold mb-4">Engagement Mix</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pie} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {pie.map((p) => <Cell key={p.name} fill={p.color} />)}
                </Pie>
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-3 glass rounded-2xl p-6 shadow-[var(--shadow-card)]">
          <h3 className="font-semibold mb-4">Top Campaigns</h3>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Campaign</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sent</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Delivered</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Read</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { n: "Summer Special 20% Off", s: "12,402", d: "99.4%", r: "84%", c: "31%" },
                  { n: "Loyalty Reward — VIPs", s: "942", d: "99.9%", r: "92%", c: "47%" },
                  { n: "Appointment Reminders", s: "8,210", d: "99.8%", r: "88%", c: "12%" },
                  { n: "Feedback Request", s: "5,810", d: "98.2%", r: "61%", c: "18%" },
                ].map(r => (
                  <tr key={r.n} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm font-medium">{r.n}</td>
                    <td className="px-4 py-3 text-sm tabular-nums">{r.s}</td>
                    <td className="px-4 py-3 text-sm tabular-nums text-brand-green font-medium">{r.d}</td>
                    <td className="px-4 py-3 text-sm tabular-nums">{r.r}</td>
                    <td className="px-4 py-3 text-sm tabular-nums font-semibold">{r.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}