"use client";

import { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  Target,
  Brain,
  Compass,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import type { AnalysisResult, RoadmapPhase } from "@/lib/analysis.types";

interface Props {
  result: AnalysisResult;
  onReset: () => void;
}

export function Dashboard({ result, onReset }: Props) {
  const { profile, skillAnalysis, matches, interview, roadmap, recruiter } = result;
  const top = matches[0];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero header */}
      <section className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="min-w-0 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric/10 border border-electric/20 text-electric text-xs font-medium">
            <span className="size-2 rounded-full bg-electric animate-pulse" />
            Coordinator Agent: Analysis Complete
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight truncate">
            {profile.name || "Candidate"}{" "}
            <span className="text-muted text-base font-normal">— {profile.experienceLevel}</span>
          </h1>
          <p className="text-muted text-lg max-w-2xl">{profile.headline}</p>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-white transition-colors"
          >
            <RotateCcw className="size-3.5" />
            Analyze another resume
          </button>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted">Profile Score</span>
            <span className="text-sm font-mono text-teal">{profile.profileScore}%</span>
          </div>
          <div className="h-2 w-full bg-navy-soft rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-electric to-teal transition-all duration-1000"
              style={{ width: `${Math.min(100, Math.max(0, profile.profileScore))}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.topSkills.slice(0, 6).map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded bg-navy-soft text-[10px] font-mono text-slate-300 uppercase"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Agent status strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AgentChip icon={<Brain className="size-4" />} title="Skill Agent" desc={`${skillAnalysis.weakSkills.length} gaps mapped`} tint="teal" />
        <AgentChip icon={<Target className="size-4" />} title="Matching Agent" desc={`${matches.length} matches found`} tint="electric" />
        <AgentChip icon={<Compass className="size-4" />} title="Roadmap Agent" desc="90-day plan generated" tint="teal" highlight />
        <AgentChip icon={<ClipboardList className="size-4" />} title="Recruiter Agent" desc={recruiter.hireRecommendation} tint="electric" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Internships + Skills */}
        <div className="lg:col-span-8 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Recommended Internships</h2>
              <span className="text-xs text-muted font-mono">
                TOP {matches.length} OF 8 DOMAINS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m, i) => {
                const accent = i % 2 === 0 ? "teal" : "electric";
                return (
                  <div
                    key={m.role + i}
                    className={`p-5 rounded-2xl glass-panel hover:border-${accent}/50 transition-all group`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-xs font-mono text-${accent}`}>
                        {m.matchPercent}% MATCH
                      </span>
                      <span className="text-[10px] text-muted uppercase tracking-wider">
                        {m.domain}
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold text-white mb-2 group-hover:text-${accent} transition-colors`}>
                      {m.role}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed mb-4">{m.reason}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded bg-navy-soft text-[10px] text-slate-300 uppercase"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-4 h-1 w-full bg-navy-soft rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${accent} transition-all duration-1000`}
                        style={{ width: `${m.matchPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Skill Gap */}
          <section className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-glass-border flex flex-wrap justify-between items-center gap-3">
              <h2 className="text-xl font-bold text-white">Skill Gap Intelligence</h2>
              <div className="flex gap-4 text-xs font-medium text-muted">
                <Legend color="teal" label="Mastery" />
                <Legend color="electric" label="Priority" />
                <Legend color="slate" label="Missing" />
              </div>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
              <SkillColumn
                title="Strong Skills"
                accent="teal"
                items={skillAnalysis.strongSkills}
                tag="Mastery"
              />
              <SkillColumn
                title="Learning Priorities"
                accent="electric"
                items={skillAnalysis.learningPriorities}
                tag="Growth"
              />
              <SkillColumn
                title="Missing for Market"
                accent="slate"
                items={skillAnalysis.missingIndustrySkills}
                tag="Critical Gap"
              />
            </div>
          </section>

          {/* Interview */}
          <section className="glass-panel rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Interview Preparation</h2>
              <span className="text-xs font-mono text-electric">
                {interview.technical.length + interview.hr.length} QUESTIONS
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuestionList
                label="Technical"
                accent="teal"
                items={interview.technical}
              />
              <QuestionList label="HR / Behavioral" accent="electric" items={interview.hr} />
            </div>
            {interview.improvementTips.length > 0 && (
              <div className="p-4 rounded-xl bg-teal/5 border border-teal/20 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-teal">
                  Improvement Tips
                </p>
                <ul className="space-y-1.5">
                  {interview.improvementTips.map((t, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-teal mt-0.5">›</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        {/* Right: Roadmap + Recruiter highlight */}
        <div className="lg:col-span-4 space-y-6">
          <RoadmapCard roadmap={roadmap} />

          {top && (
            <section className="glass-panel rounded-2xl p-5 space-y-3 border-electric/30">
              <p className="text-[10px] font-mono uppercase tracking-widest text-electric">
                Top Pick
              </p>
              <h3 className="text-lg font-bold text-white">{top.role}</h3>
              <div className="text-xs text-muted">{top.domain}</div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-electric to-teal">
                {top.matchPercent}%
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{top.reason}</p>
            </section>
          )}
        </div>
      </div>

      {/* Recruiter summary */}
      <section className="rounded-3xl p-6 md:p-8 border border-white/5 bg-gradient-to-r from-electric/10 via-navy-soft/40 to-teal/10 grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)_auto] gap-6 items-center">
        <div className="size-20 md:size-24 rounded-3xl bg-gradient-to-br from-electric to-teal grid place-items-center shrink-0 glow-electric">
          <Sparkles className="size-10 text-white" />
        </div>
        <div className="space-y-3 min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-teal">
            Recruiter Summary Agent
          </p>
          <h2 className="text-2xl font-bold text-white">Recruiter Cheat Sheet</h2>
          <p className="text-muted text-sm leading-relaxed">{recruiter.summary}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge accent="teal">REC: {recruiter.hireRecommendation.toUpperCase()}</Badge>
            <Badge accent="electric">RISK: {recruiter.riskLevel.toUpperCase()}</Badge>
            {recruiter.recommendedRoles.slice(0, 3).map((r) => (
              <Badge key={r} accent="muted">
                {r}
              </Badge>
            ))}
          </div>
          {(recruiter.strengths.length > 0 || recruiter.risks.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
              {recruiter.strengths.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-teal mb-1.5">
                    Strengths
                  </p>
                  <ul className="space-y-1">
                    {recruiter.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-slate-300 flex gap-2">
                        <span className="text-teal">+</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {recruiter.risks.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-electric mb-1.5">
                    Risks
                  </p>
                  <ul className="space-y-1">
                    {recruiter.risks.map((s, i) => (
                      <li key={i} className="text-xs text-slate-300 flex gap-2">
                        <span className="text-electric">!</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Projects */}
      {profile.projects.length > 0 && (
        <section className="glass-panel rounded-2xl p-5 space-y-4">
          <h2 className="text-xl font-bold text-white">Project Signal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.projects.map((p, i) => (
              <div key={i} className="rounded-xl bg-navy-soft/60 border border-glass-border p-4">
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-muted mt-1.5 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AgentChip({
  icon,
  title,
  desc,
  tint,
  highlight,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tint: "teal" | "electric";
  highlight?: boolean;
}) {
  return (
    <div
      className={`glass-panel rounded-xl p-3 flex items-center gap-3 ${
        highlight ? "border-electric/30 glow-electric" : ""
      }`}
    >
      <div
        className={`size-9 rounded-lg flex items-center justify-center ${
          tint === "teal"
            ? "bg-teal/10 border border-teal/20 text-teal"
            : "bg-electric/10 border border-electric/20 text-electric"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted">{title}</p>
        <p className="text-sm font-semibold text-white truncate">{desc}</p>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: "teal" | "electric" | "slate"; label: string }) {
  const cls = color === "teal" ? "bg-teal" : color === "electric" ? "bg-electric" : "bg-slate-600";
  return (
    <span className="flex items-center gap-2">
      <span className={`size-2 rounded-full ${cls}`} />
      {label}
    </span>
  );
}

function SkillColumn({
  title,
  accent,
  items,
  tag,
}: {
  title: string;
  accent: "teal" | "electric" | "slate";
  items: string[];
  tag: string;
}) {
  const border =
    accent === "teal" ? "border-teal" : accent === "electric" ? "border-electric" : "border-slate-600";
  const bg =
    accent === "teal" ? "bg-teal/5" : accent === "electric" ? "bg-electric/5" : "bg-slate-800/40";
  const text =
    accent === "teal" ? "text-teal" : accent === "electric" ? "text-electric" : "text-slate-400";
  return (
    <div>
      <p className="text-xs text-muted mb-2.5">{title}</p>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-xs text-muted/60">—</p>}
        {items.map((s) => (
          <div key={s} className={`border-l-2 ${border} ${bg} p-2.5 rounded-r-md`}>
            <p className="text-sm font-semibold text-white">{s}</p>
            <p className={`text-[10px] ${text}`}>{tag}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestionList({
  label,
  accent,
  items,
}: {
  label: string;
  accent: "teal" | "electric";
  items: { question: string; focus: string }[];
}) {
  const accentText = accent === "teal" ? "text-teal" : "text-electric";
  return (
    <div className="space-y-2">
      <p className={`text-[10px] font-mono uppercase tracking-widest ${accentText}`}>{label}</p>
      <div className="space-y-2">
        {items.map((q, i) => (
          <details
            key={i}
            className="group rounded-lg border border-glass-border bg-navy-soft/40 p-3 hover:border-white/15 transition-colors"
          >
            <summary className="text-sm text-slate-200 cursor-pointer list-none flex items-start justify-between gap-2">
              <span className="leading-snug">{q.question}</span>
              <ChevronDown className="size-4 text-muted shrink-0 mt-0.5 group-open:rotate-180 transition-transform" />
            </summary>
            <p className="text-xs text-muted mt-2 leading-relaxed">{q.focus}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function RoadmapCard({ roadmap }: { roadmap: AnalysisResult["roadmap"] }) {
  const [active, setActive] = useState<"30" | "60" | "90">("30");
  const phases: Record<"30" | "60" | "90", { label: string; phase: RoadmapPhase; accent: string }> = {
    "30": { label: "30 Days", phase: roadmap.thirtyDay, accent: "teal" },
    "60": { label: "60 Days", phase: roadmap.sixtyDay, accent: "electric" },
    "90": { label: "90 Days", phase: roadmap.ninetyDay, accent: "slate" },
  };
  const current = phases[active];

  return (
    <section className="rounded-2xl p-5 bg-navy-soft border border-glass-border relative overflow-hidden">
      <div className="absolute top-3 right-3 opacity-10 pointer-events-none">
        <span className="text-6xl font-black text-white">{active}</span>
      </div>
      <h2 className="text-xl font-bold text-white mb-4">Mastery Roadmap</h2>

      <div className="flex gap-1 mb-5 p-1 rounded-lg bg-glass border border-glass-border w-fit">
        {(["30", "60", "90"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
              active === k
                ? "bg-electric text-white"
                : "text-muted hover:text-white"
            }`}
          >
            {k}D
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{current.phase.title}</h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">{current.phase.summary}</p>
        </div>

        <div className="space-y-3 pt-2">
          {current.phase.milestones.map((m, i) => (
            <div key={i} className="relative pl-6 border-l border-glass-border pb-3 last:pb-0">
              <div
                className={`absolute top-0 -left-[5px] size-2.5 rounded-full ${
                  current.accent === "teal"
                    ? "bg-teal glow-teal"
                    : current.accent === "electric"
                    ? "bg-electric glow-electric"
                    : "bg-slate-600"
                }`}
              />
              <p className="text-[10px] font-mono uppercase text-muted">Week {m.week}</p>
              <h4 className="text-sm font-semibold text-white mt-0.5">{m.title}</h4>
              <ul className="mt-1.5 space-y-1">
                {m.tasks.map((t, j) => (
                  <li key={j} className="text-xs text-muted flex gap-1.5 leading-relaxed">
                    <span className="text-electric">›</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Badge({
  accent,
  children,
}: {
  accent: "teal" | "electric" | "muted";
  children: React.ReactNode;
}) {
  const cls =
    accent === "teal"
      ? "border-teal/30 bg-teal/5 text-teal"
      : accent === "electric"
      ? "border-electric/30 bg-electric/5 text-electric"
      : "border-white/10 bg-white/5 text-slate-300";
  return (
    <span className={`px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide ${cls}`}>
      {children}
    </span>
  );
}
