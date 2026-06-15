"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileText, Loader2, Sparkles, X } from "lucide-react";

interface Props {
  onAnalyze: (resumeText: string, manualSkills: string[]) => void;
  loading: boolean;
  error: string | null;
}

export function ResumeIntake({ onAnalyze, loading, error }: Props) {
  const [text, setText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsingPdf, setParsingPdf] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addSkill = () => {
    const s = skillsInput.trim();
    if (!s) return;
    if (!skills.includes(s)) setSkills([...skills, s]);
    setSkillsInput("");
  };

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setParsingPdf(true);
      try {
        const pdfjs = await import("pdfjs-dist");
        // Use bundled worker
        const workerSrc = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
        const buf = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        let out = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          out += content.items.map((it) => ("str" in it ? it.str : "")).join(" ") + "\n";
        }
        setText(out.trim());
      } catch (e) {
        console.error(e);
        alert("Could not parse this PDF. Try pasting the text directly.");
      } finally {
        setParsingPdf(false);
      }
    } else {
      const t = await file.text();
      setText(t);
    }
  }, []);

  const canSubmit = text.trim().length >= 20 && !loading && !parsingPdf;

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Hero */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric/10 border border-electric/20 text-electric text-xs font-medium">
          <span className="size-2 rounded-full bg-electric animate-pulse" />
          Coordinator Agent online
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Your Career{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric to-teal">
            Operating System
          </span>
        </h1>
        <p className="text-muted text-lg">
          Drop your resume — a multi-agent AI workforce analyzes your skills, matches you to internships,
          and architects a 90-day mastery roadmap.
        </p>
      </div>

      {/* Upload Drop Zone */}
      <div
        className="glass-panel rounded-2xl p-8 relative overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
      >
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: File upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-glass-border hover:border-electric/50 hover:bg-electric/5 transition-all p-8 min-h-48 cursor-pointer"
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.md"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {parsingPdf ? (
              <Loader2 className="size-10 text-electric animate-spin" />
            ) : (
              <div className="size-12 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="size-5 text-electric" />
              </div>
            )}
            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                {fileName ?? "Drop PDF or click to upload"}
              </p>
              <p className="text-xs text-muted mt-1">
                {parsingPdf ? "Parsing document…" : "PDF, TXT — max 5MB"}
              </p>
            </div>
          </button>

          {/* Right: Paste text */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono uppercase tracking-widest text-muted">
              Or paste resume text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your resume content here…"
              className="flex-1 min-h-48 resize-none bg-navy-soft/60 border border-glass-border rounded-xl p-4 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-electric/50 focus:ring-1 focus:ring-electric/30 transition-all"
            />
            <p className="text-[10px] text-muted">{text.length} chars</p>
          </div>
        </div>

        {/* Manual skills */}
        <div className="mt-6 space-y-3">
          <label className="text-xs font-mono uppercase tracking-widest text-muted">
            Manual skill entry (optional)
          </label>
          <div className="flex gap-2 flex-wrap">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-medium"
              >
                {s}
                <button
                  onClick={() => setSkills(skills.filter((k) => k !== s))}
                  className="hover:text-white"
                  aria-label={`Remove ${s}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="Type a skill and hit Enter (e.g. Python, React)"
              className="flex-1 bg-navy-soft/60 border border-glass-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/60 focus:outline-none focus:border-electric/50 transition-all"
            />
            <button
              onClick={addSkill}
              className="px-4 py-2 rounded-lg bg-glass border border-glass-border text-sm font-medium text-white hover:bg-white/5 transition-all"
            >
              Add
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={() => onAnalyze(text.trim(), skills)}
          disabled={!canSubmit}
          className="mt-6 w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-electric to-teal text-white font-semibold text-sm shadow-lg shadow-electric/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Agents analyzing…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Deploy Multi-Agent Analysis
            </>
          )}
        </button>
      </div>

      {/* Agent strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Resume Agent", desc: "Profile extraction" },
          { label: "Skill Agent", desc: "Gap analysis" },
          { label: "Matching Agent", desc: "Internship fit" },
          { label: "Roadmap Agent", desc: "90-day plan" },
        ].map((a) => (
          <div
            key={a.label}
            className="glass-panel rounded-xl p-3 flex items-center gap-3"
          >
            <div className="size-8 rounded-lg bg-electric/10 border border-electric/20 flex items-center justify-center">
              <FileText className="size-4 text-electric" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{a.label}</p>
              <p className="text-[10px] text-muted truncate">{a.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
