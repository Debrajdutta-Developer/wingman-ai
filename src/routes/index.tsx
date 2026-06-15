import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ResumeIntake } from "@/components/ResumeIntake";
import { Dashboard } from "@/components/Dashboard";
import { analyzeCandidate } from "@/lib/analysis.functions";
import type { AnalysisResult } from "@/lib/analysis.types";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NayePankh AI — Talent Discovery & Internship OS" },
      {
        name: "description",
        content:
          "Multi-agent AI that scans your resume, matches you to internships, maps skill gaps, prepares interviews, and ships a 90-day career roadmap.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const analyze = useServerFn(analyzeCandidate);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (resumeText: string, manualSkills: string[]) => {
    setError(null);
    setLoading(true);
    try {
      const res = await analyze({ data: { resumeText, manualSkills } });
      setResult(res);
      // Persist analysis (best-effort)
      try {
        const { data: u } = await supabase.auth.getUser();
        const top = res.matches?.[0];
        await supabase.from("analyses").insert({
          user_id: u.user?.id ?? null,
          candidate_name: res.profile?.name ?? null,
          experience_level: res.profile?.experienceLevel ?? null,
          profile_score: res.profile?.profileScore ?? null,
          top_match_role: top?.role ?? null,
          top_match_percent: top?.matchPercent ?? null,
          hire_recommendation: res.recruiter?.hireRecommendation ?? null,
          result: res as never,
        });
      } catch (e) {
        console.warn("save analysis failed", e);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {result ? (
          <Dashboard result={result} onReset={() => setResult(null)} />
        ) : (
          <ResumeIntake onAnalyze={handleAnalyze} loading={loading} error={error} />
        )}
      </main>
      <footer className="py-10 border-t border-glass-border text-center mt-12">
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted/60">
          NayePankh OS v1.0 // Powered by Lovable AI · Gemini Multi-Agent
        </p>
      </footer>
    </div>
  );
}

function Nav() {
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-glass-border bg-navy/70 backdrop-blur-xl px-4 md:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="size-9 bg-gradient-to-br from-electric to-teal rounded-lg flex items-center justify-center shadow-lg shadow-electric/30">
          <span className="text-white font-bold">N</span>
        </div>
        <div className="leading-tight">
          <span className="text-lg font-bold tracking-tight text-white">
            Pankh<span className="text-teal">.ai</span>
          </span>
          <p className="text-[10px] font-mono text-muted tracking-widest uppercase">
            Talent Discovery OS
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="hidden md:inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-teal animate-pulse" />
          <span className="font-mono text-muted uppercase tracking-widest">System Active</span>
        </span>
        {email ? (
          <Link
            to="/admin"
            className="rounded-lg bg-electric/10 hover:bg-electric/20 text-electric border border-electric/20 px-3 py-1.5 text-xs font-medium"
          >
            Admin
          </Link>
        ) : (
          <Link
            to="/auth"
            className="rounded-lg bg-white/5 hover:bg-white/10 text-white border border-glass-border px-3 py-1.5 text-xs font-medium"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
