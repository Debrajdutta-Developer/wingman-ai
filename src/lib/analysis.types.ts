export interface CandidateProfile {
  name: string;
  headline: string;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  profileScore: number; // 0-100
  topSkills: string[];
  projects: { name: string; description: string }[];
}

export interface SkillAnalysis {
  strongSkills: string[];
  weakSkills: string[];
  missingIndustrySkills: string[];
  learningPriorities: string[];
}

export type InternshipDomain =
  | "AI Development"
  | "AI Agent Development"
  | "Python Development"
  | "Data Analytics"
  | "Frontend Development"
  | "Web Development"
  | "Backend Development"
  | "Full Stack Development";

export interface InternshipMatch {
  role: string;
  domain: InternshipDomain;
  matchPercent: number; // 0-100
  reason: string;
  tags: string[];
}

export interface InterviewPrep {
  technical: { question: string; focus: string }[];
  hr: { question: string; focus: string }[];
  improvementTips: string[];
}

export interface RoadmapMilestone {
  week: number;
  title: string;
  tasks: string[];
}

export interface RoadmapPhase {
  title: string;
  summary: string;
  milestones: RoadmapMilestone[];
}

export interface Roadmap {
  thirtyDay: RoadmapPhase;
  sixtyDay: RoadmapPhase;
  ninetyDay: RoadmapPhase;
}

export interface RecruiterSummary {
  summary: string;
  strengths: string[];
  risks: string[];
  recommendedRoles: string[];
  hireRecommendation: "Strong Hire" | "Hire" | "Hold" | "Pass";
  riskLevel: "Low" | "Medium" | "High";
}

export interface AnalysisResult {
  profile: CandidateProfile;
  skillAnalysis: SkillAnalysis;
  matches: InternshipMatch[];
  interview: InterviewPrep;
  roadmap: Roadmap;
  recruiter: RecruiterSummary;
}
