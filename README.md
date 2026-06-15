# NayePankh AI — Talent Discovery & Internship OS

NayePankh AI is a powerful, multi-agent AI system designed to streamline the talent discovery and internship matching process. It scans resumes, matches candidates to suitable internships, identifies skill gaps, assists in interview preparation, and provides a comprehensive 90-day career roadmap.

## Features

- **Resume Analysis**: Intelligent scanning and parsing of resumes using AI.
- **Internship Matching**: Matches candidates to the most relevant internship opportunities.
- **Skill Gap Mapping**: Identifies areas for improvement and suggests learning paths.
- **Interview Preparation**: Helps candidates prepare for interviews with targeted insights.
- **Career Roadmap**: Generates a 90-day roadmap for career success.
- **Admin Dashboard**: Comprehensive management interface for administrators.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React + TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **AI Integration**: [Gemini Multi-Agent](https://ai.google.dev/) (via AI SDK)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State Management**: [TanStack Query](https://tanstack.com/query)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or [Node.js](https://nodejs.org/)
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Debrajdutta-Developer/wingman-ai.git
   cd wingman-ai
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Supabase and AI API keys:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   bun dev
   # or
   npm run dev
   ```

## Project Structure

- `src/components`: UI components and shared layouts.
- `src/routes`: Application routes and pages.
- `src/lib`: Utility functions, AI logic, and Supabase integration.
- `src/integrations`: External service integrations.
- `supabase/migrations`: Database schema migrations.

## License

[MIT](LICENSE)
