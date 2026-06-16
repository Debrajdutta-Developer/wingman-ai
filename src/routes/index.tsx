import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ResumeIntake } from "@/components/ResumeIntake";
import { Dashboard } from "@/components/Dashboard";
import { analyzeCandidate } from "@/lib/analysis.functions";
import type { AnalysisResult } from "@/lib/analysis.types";

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
      // Scroll to top of dashboard
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
        <Link
          to="/admin"
          className="px-3 py-1.5 rounded-md border border-glass-border text-muted hover:text-white hover:border-electric/50 transition font-mono uppercase tracking-widest"
        >
          Admin
        </Link>
        <span className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-teal animate-pulse" />
          <span className="font-mono text-muted uppercase tracking-widest hidden sm:inline">
            System Active
          </span>
        </span>
      </div>
    </nav>
  );
}
