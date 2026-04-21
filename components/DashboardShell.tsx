"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogOut, PlusCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const unlockSchema = z.object({
  email: z.string().email("Enter the email used during checkout.")
});

type UnlockValues = z.infer<typeof unlockSchema>;

type ProjectSummary = {
  id: string;
  name: string;
  language: string;
  updatedAt: string;
};

type DashboardShellProps = {
  hasAccess: boolean;
  email?: string;
  locked?: boolean;
};

const starterCode = `type BuildHealth = {
  latencyMs: number;
  errorRate: number;
};

export function describeHealth(metrics: BuildHealth) {
  if (metrics.errorRate > 0.01) {
    return "Alert: investigate recent deploy failures";
  }

  if (metrics.latencyMs > 150) {
    return "Warning: performance budget is drifting";
  }

  return "Healthy: deployment pipeline meets accessibility quality gates";
}
`;

export function DashboardShell({ hasAccess, email, locked }: DashboardShellProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const form = useForm<UnlockValues>({
    resolver: zodResolver(unlockSchema),
    defaultValues: {
      email: ""
    }
  });

  useEffect(() => {
    if (!hasAccess) {
      return;
    }

    let mounted = true;

    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await fetch("/api/projects", { method: "GET" });
        const payload = (await response.json()) as { projects?: ProjectSummary[] };
        if (mounted) {
          setProjects(payload.projects ?? []);
        }
      } catch {
        if (mounted) {
          setError("Unable to load projects right now.");
        }
      } finally {
        if (mounted) {
          setLoadingProjects(false);
        }
      }
    };

    void loadProjects();

    return () => {
      mounted = false;
    };
  }, [hasAccess]);

  const accessBadge = useMemo(() => {
    if (hasAccess) {
      return "Access Granted";
    }
    return "Paywall Locked";
  }, [hasAccess]);

  const unlockAccess = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? "Unable to verify purchase.");
        return;
      }

      setSuccess("Purchase verified. Redirecting to your editor workspace.");
      router.push("/editor");
      router.refresh();
    } catch {
      setError("Network issue while checking your purchase. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  });

  const createProject = async () => {
    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "Accessible Deployment Health Check",
          content: starterCode,
          language: "typescript"
        })
      });

      const payload = (await response.json()) as {
        error?: string;
        project?: { id: string };
      };

      if (!response.ok || !payload.project?.id) {
        setError(payload.error ?? "Failed to create project.");
        return;
      }

      router.push(`/editor?project=${encodeURIComponent(payload.project.id)}`);
    } catch {
      setError("Network issue while creating a new project.");
    } finally {
      setIsCreating(false);
    }
  };

  const signOut = async () => {
    setIsSigningOut(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-5">
        <div>
          <h1 className="text-2xl font-semibold">Blind Dev Toolkit Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">
            Manage project workspaces, collaboration sessions, and screen reader optimized coding flows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{accessBadge}</Badge>
          {hasAccess ? (
            <Button variant="outline" onClick={signOut} disabled={isSigningOut}>
              {isSigningOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              Sign Out
            </Button>
          ) : null}
        </div>
      </header>

      {!hasAccess ? (
        <Card>
          <CardHeader>
            <CardTitle>Unlock Your Workspace</CardTitle>
            <CardDescription>
              Enter the same email used during Stripe checkout to enable the editor and collaboration features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {locked ? (
              <p className="rounded-md border border-[#764f30] bg-[#2f1d11] p-3 text-sm text-[#ffcf9e]">
                You need an active subscription to open the editor.
              </p>
            ) : null}

            <form className="space-y-3" onSubmit={unlockAccess}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Purchase Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-sm text-[var(--danger)]">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                Verify Purchase
              </Button>
            </form>

            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
              Need a subscription first?
              <a
                className="ml-2 font-semibold text-[var(--accent)] underline underline-offset-4"
                href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK}
                target="_blank"
                rel="noreferrer"
              >
                Open Stripe Checkout
              </a>
            </div>

            {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
            {success ? <p className="text-sm text-[var(--accent)]">{success}</p> : null}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex items-start justify-between gap-3 sm:flex-row">
            <div>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>
                Signed in as {email}. Launch an existing workspace or create a new accessible coding session.
              </CardDescription>
            </div>
            <Button onClick={createProject} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              New Project
            </Button>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <p className="text-sm text-[var(--muted)]">Loading projects...</p>
            ) : projects.length === 0 ? (
              <p className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm text-[var(--muted)]">
                No projects yet. Create one to start coding with the accessible editor profile.
              </p>
            ) : (
              <ul className="space-y-3">
                {projects.map((project) => (
                  <li
                    key={project.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{project.name}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {project.language} · Updated {new Date(project.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/editor?project=${encodeURIComponent(project.id)}`)}
                    >
                      Open Editor
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
