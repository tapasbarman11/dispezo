"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import {
  Search,
  MessageCircle,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
} from "lucide-react";

export default function InboxPage() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <PageHeader
        eyebrow="WhatsApp"
        title="Inbox"
        description="Manage incoming WhatsApp conversations from your connected business number."
      />

      <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] h-[calc(100vh-220px)] min-h-[560px] glass rounded-2xl shadow-[var(--shadow-card)] overflow-hidden">
        <aside className="border-r border-border bg-white/70 flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-brand-purple/10 text-brand-purple">
                <MessageCircle className="size-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold">
                No conversations yet
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Incoming WhatsApp conversations will appear here once your
                webhook receives customer messages.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex flex-col bg-[#f8fafc]">
          <div className="h-16 border-b border-border bg-white/80 flex items-center justify-between px-5">
            <div>
              <div className="text-sm font-semibold">
                Select a conversation
              </div>
              <div className="text-[11px] text-muted-foreground">
                Your WhatsApp inbox
              </div>
            </div>
            <MoreVertical className="size-4 text-muted-foreground" />
          </div>

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-sm text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-purple/10 text-brand-purple">
                <MessageCircle className="size-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold">
                Start a conversation
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-6">
                Choose a customer from the conversation list to view messages
                and reply from Dispezo.
              </p>
            </div>
          </div>

          <div className="border-t border-border bg-white/80 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 opacity-60">
              <Paperclip className="size-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">
                Select a conversation to reply
              </span>
              <Smile className="size-4 text-muted-foreground" />
              <button
                disabled
                className="grid size-8 place-items-center rounded-lg gradient-brand text-white"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
