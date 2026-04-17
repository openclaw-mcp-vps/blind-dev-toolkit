import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Ear, Keyboard, Timer } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard | Blind Dev Toolkit",
  description: "Track your accessibility workflow progress and jump into focused coding sessions."
};

const metrics = [
  {
    title: "Narrated lines this week",
    value: "4,380",
    detail: "17% faster orientation compared with your previous week.",
    icon: Ear
  },
  {
    title: "Keyboard-only sessions",
    value: "29",
    detail: "No mouse required. All editor actions completed with shortcuts.",
    icon: Keyboard
  },
  {
    title: "Average review cycle",
    value: "12 min",
    detail: "Reduced from 19 min using spoken line summaries.",
    icon: Timer
  },
  {
    title: "Accessibility confidence score",
    value: "94/100",
    detail: "Based on heading structure, ARIA hints, and focus order checks.",
    icon: Activity
  }
];

export default function DashboardPage() {
  return (
    <main className="container py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title text-3xl">Accessibility Performance Dashboard</h1>
          <p className="mt-2 max-w-2xl text-[#9ba7b4]">
            Keep your workflow measurable with real usage signals from your coding sessions.
          </p>
        </div>
        <Link href="/editor" className="rounded-md bg-[#1f6feb] px-4 py-2 text-sm font-semibold text-[#f0f6fc] hover:bg-[#2f81f7]">
          Open editor
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader>
                <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wider">
                  <Icon className="h-4 w-4" aria-hidden />
                  {metric.title}
                </CardDescription>
                <CardTitle className="mt-2 text-3xl">{metric.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#9ba7b4]">{metric.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-8 panel p-6">
        <h2 className="text-xl font-semibold">Quick session flow</h2>
        <ol className="mt-3 space-y-2 text-sm text-[#c2cbd6]">
          <li>1. Start in Editor and press Alt+1 to focus code immediately.</li>
          <li>2. Use Ctrl+Shift+L to hear your current line and validate intent.</li>
          <li>3. Use Ctrl+Shift+R to narrate selected blocks during reviews.</li>
          <li>4. Return here to track trendlines and tune your workflow.</li>
        </ol>
      </section>
    </main>
  );
}
