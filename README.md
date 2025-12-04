# LeetCourt

Master the Art of Argument – An interactive courtroom simulation powered by AI voice agents.

🌐 **Live Demo:** [LeetCourt](https://luminous-fox-3d91e8.netlify.app)

![Leetcourt](https://raw.githubusercontent.com/binaryshrey/leetcourt-daytona-nyc/refs/heads/main/leetcourt.png)

---

## Inspiration

Legal argumentation is a skill that traditionally requires in-person training, expert feedback, and structured courtroom environments—none of which are easily accessible to most students or professionals. Despite AI tools for writing and research, there is no platform that allows users to practice real-time courtroom reasoning, face objections, or learn procedural flow in a fun and engaging way.

We wanted to build something like **LeetCode for legal reasoning**: a place where anyone can practice arguments, improve rhetorical clarity, and simulate real trial pressure with an AI judge that behaves like the real thing.

---

## What it does

LeetCourt is an AI-driven, voice-interactive courtroom simulator that allows users to:

- Conduct realistic Opening, Direct, Cross, and Closing phases.
- Face live objections such as Relevance, Hearsay, Speculation, and Leading.
- Upload any PDF case file and have an AI extract facts, evidence, and precedents.
- Receive performance analysis at the end of the game.
- Track clarity, logic, persuasiveness, and precedent usage.
- Interact with a fully voice-enabled multi-agent AI judge, Lawyer, and Orchestrator built using **ElevenLabs Conversational AI**.
- Access an integrated tools panel with evidence, notes, and case summaries.
- Create secure, isolated development sandboxes for AI-powered legal case analysis using **Daytona.io**.
- Receive automated code reviews and logic checks for scoring engine and agent scripts via **CodeRabbit**.

---

## Features

- 🎙️ **Voice AI Integration**: Practice arguments with ElevenLabs Conversational AI Judge
- 🔄 **Automatic Phase Progression**: Seamlessly move through Opening → Direct → Cross → Closing
- 🤖 **AI-Powered Battle Insights**: GPT-4o analyzes conversations and generates dynamic notes, evidence, and precedents
- 📄 **PDF Case Upload**: Extract case information from PDFs using OpenRouter (GPT-5.1)
- ⚖️ **Real-time Performance Analysis**: Get AI-powered feedback on your arguments every few seconds
- 📚 **Case Library**: Browse and filter cases by type and difficulty
- 🎯 **Dynamic Context**: Case details automatically loaded into AI agents
- 📝 **Smart Tools Panel**: View AI-generated battle insights alongside case defaults

---

## Tech Stack

- **Frontend**: React 18.3 + Vite 5.4
- **UI**: TailwindCSS + Shadcn UI
- **Voice AI**: ElevenLabs Conversational AI
- **LLM & AI**: OpenRouter API (Claude 3.5 Sonnet, GPT-5.1, GPT-4o)
- **PDF Processing**: PDF.js
- **Storage**: LocalStorage & Tigris Storage
- **Development Tools**: Daytona.io (sandbox), CodeRabbit (code review)

---

## How we built it

### Frontend & UI

- React 18.3 + Vite for fast rendering
- TailwindCSS + Shadcn UI for consistent, modern design

### AI Systems

- **ElevenLabs Conversational AI** – judge, lawyer, orchestrator, and user voice interaction
- **OpenRouter (GPT-5.1)** – PDF case extraction, performance feedback, reasoning logic
- **Daytona.io** – isolated AI development sandboxes
- **CodeRabbit** – automated code review, scoring logic validation
- **Tigris Storage** – storing legal case documents

### Data Processing

- pdf.js for unstructured text extraction
- JSON-normalized case structure for AI agents

### Architecture

- Deterministic **Finite State Machine** manages trial phases
- Reactive scoring engine evaluates arguments at fixed intervals
- Voice pipeline manages streaming input/output from judge

---

## Challenges we ran into

- **Latency management:** syncing real-time speech with LLM responses
- **Maintaining judge consistency:** procedural, strict, and predictable AI behavior
- **Handling messy PDFs:** irregular documents required preprocessing
- **Conversation drift:** FSM essential for structured trial flow
- **Integrating multiple models:** careful orchestration to avoid context conflicts

---

## Accomplishments

- Fully voice-interactive courtroom simulator with realistic objections
- Dynamic PDF-to-case extraction pipeline
- Real-time scoring engine analyzing arguments every 3 seconds
- Clean, intuitive UI mirroring professional trial environments
- Flexible case library with search, filtering, uploading, and deletion
- Scalable architecture supporting new agents, case types, and multiplayer
- Leveraged Daytona.io for secure AI case analysis sandboxes
- CodeRabbit automated code review and logic checks
- Tigris Storage for real-time courtroom practice

---

## What we learned

- Real-time voice interactions require buffering, flow control, and architectural discipline
- Legal reasoning benefits from structured FSM trial management
- Narrow-function LLMs (judge, analyzer, extractor) perform best
- UX matters: pacing, clarity, and visual anchors improve realism
- High-quality prompts aren’t enough—environment design is critical

---

## What's next

- Multiplayer Mode: human vs AI or human vs human with AI judge
- Mobile App for on-the-go practice
- Community Case Marketplace
- Institutional versions for law schools, debate clubs, training programs
- Advanced scoring models that learn from user patterns
- Analytics dashboard for improvement tracking
- Scenario-based learning tracks: Criminal Law, Torts, Contracts, Evidence, Constitutional Law

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- ElevenLabs account (agents pre-configured)

### Installation

```bash
git clone <https://github.com/binaryshrey/leetcourt-daytona-nyc>
cd leetcourt
npm install
```

Create `.env` and add your OpenRouter API key:

```
VITE_OPENROUTER_API_KEY=your-actual-key-here
```

Start development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Deployment

```bash
npm install -g vercel
vercel --prod
```

Configure environment variables in Vercel Dashboard:

- `VITE_OPENROUTER_API_KEY` – OpenRouter API key

---

## Project Structure

```
leetcourt/
├── src/
│   ├── components/
│   │   ├── battle/
│   │   │   ├── ToolsPanel.jsx
│   │   │   ├── ScoreTracker.jsx
│   │   │   ├── CaseTimeline.jsx
│   │   │   └── JudgeReaction.jsx
│   │   ├── CaseUploader.jsx
│   │   └── ui/
│   ├── pages/
│   │   ├── BattleArena.jsx
│   │   ├── CaseLibrary.jsx
│   │   ├── Leaderboard.jsx
│   │   └── Profile.jsx
│   ├── api/
│   │   └── apiClient.jsx
│   ├── utils/
│   │   ├── battleAnalyzer.js
│   │   ├── pdfExtractor.js
│   │   └── performanceAnalyzer.js
│   └── lib/
├── public/
├── index.html
└── vercel.json
```

---
