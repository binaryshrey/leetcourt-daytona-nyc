# LeetCourt 

Master the Art of Argument - An interactive courtroom simulation powered by AI voice agents.

🌐 **Live Demo:** [leetcourt.tech](https://leetcourt-ayushs2k1s-projects.vercel.app)

## Features

- 🎙️ **Voice AI Integration**: Practice arguments with ElevenLabs Conversational AI Judge
- 🔄 **Automatic Phase Progression**: Seamlessly move through Opening → Direct → Cross → Closing
- 🤖 **AI-Powered Battle Insights**: GPT-4o analyzes your conversation and generates dynamic notes, evidence, and precedents
- 📄 **PDF Case Upload**: Extract case information from PDFs using Openrouter (GPT-5)
- ⚖️ **Real-time Performance Analysis**: Get AI-powered feedback on your arguments
- 📚 **Case Library**: Browse and filter cases by type and difficulty
- 🎯 **Dynamic Context**: Case details automatically loaded into AI agents
- 📝 **Smart Tools Panel**: View AI-generated battle insights alongside case defaults

## Tech Stack

- React 18.3 + Vite 5.4
- TailwindCSS + Shadcn UI
- ElevenLabs Conversational AI
- OpenRouter API (Claude 3.5 Sonnet, GPT-5.1)
- PDF.js for document parsing
- LocalStorage for data persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key ([Get one here](https://openrouter.ai/))
- ElevenLabs account (agents pre-configured)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd leetcourt
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:

4. Add your OpenRouter API key to `.env`:
```
VITE_OPENROUTER_API_KEY=your-actual-key-here
```

5. Start development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app!

## Deployment

Deployed on **Vercel** at [leetcourt.tech](https://leetcourt-ayushs2k1s-projects.vercel.app)

### Deploy Your Own Instance

```bash
npm install -g vercel
vercel --prod
```

Configure environment variables in Vercel Dashboard:
- `VITE_OPENROUTER_API_KEY` - Your OpenRouter API key

## Project Structure

```
leetcourt/
├── src/
│   ├── components/
│   │   ├── battle/              # Courtroom UI components
│   │   │   ├── ToolsPanel.jsx   # Notes, Evidence, Precedents viewer
│   │   │   ├── ScoreTracker.jsx # Performance score display
│   │   │   ├── CaseTimeline.jsx # Trial phase timeline
│   │   │   └── JudgeReaction.jsx # Objection modal
│   │   ├── CaseUploader.jsx     # PDF drag-and-drop uploader
│   │   └── ui/                  # Shadcn UI components
│   ├── pages/
│   │   ├── BattleArena.jsx      # Main courtroom interface
│   │   ├── CaseLibrary.jsx      # Case browsing & management
│   │   ├── Leaderboard.jsx      # User rankings
│   │   └── Profile.jsx          # User profile
│   ├── api/
│   │   └── apiClient.jsx        # LocalStorage-based API client
│   ├── utils/
│   │   ├── battleAnalyzer.js    # GPT-4o battle insights generation
│   │   ├── pdfExtractor.js      # PDF → AI case extraction
│   │   └── performanceAnalyzer.js # Real-time argument analysis
│   └── lib/                     # UI utilities
├── public/
├── index.html                   # ElevenLabs script embed
└── vercel.json                  # SPA routing config
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI features | Yes |

## Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Features in Detail

### Case Library
- **Filter System**: Case type (Criminal, Civil, Constitutional) and difficulty (Easy, Medium, Hard, Expert)
- **PDF Upload**: Drag-and-drop PDF documents to create new cases using AI extraction
- **Case Management**: Delete cases with confirmation dialog
- **Real-time Search**: Filter cases instantly as you type

### Battle Arena (Trial Interface)
- **Voice Conversation**: Interact with ElevenLabs AI Judge using natural speech
- **Automatic Phase Progression**: 
  - Opening Statements (3 turns) → Direct Examination (7 turns)
  - Direct Examination → Cross Examination (7 turns)
  - Cross Examination → Closing Arguments (7 turns)
  - Closing Arguments → Case Complete (2 turns)
- **AI Battle Insights**: GPT-4o automatically analyzes conversations every 10 messages
  - Dynamic strategic notes based on your arguments
  - AI-identified evidence references with relevance scores
  - Contextual legal precedents specific to your conversation
  - Purple badges indicate AI-generated content
- **Real-time Performance Analysis**: AI evaluates your arguments every 3 seconds
- **Smart Tools Panel**: View AI-generated battle insights prioritized over case defaults
- **Performance Scoring**: Track logic, persuasiveness, precedent use, and clarity scores
- **Phase Timeline**: Visual indicator of current trial phase

### AI Integration
- **Judge Agent** (ElevenLabs): Evaluates arguments and presides over trial
  - Agent ID: agent_5001ka5q6f5sfbkt7v2ffdw17pkk
  - Dynamic variables: case details, judge temperament, verdict status
- **Battle Insights Generator** (GPT-4o): Analyzes conversation transcripts for tactical insights
- **Performance Analyzer** (GPT-5.1): Real-time argument analysis
- **PDF Extractor** (GPT-5.1): Extracts structured case data from uploaded documents
- **Dynamic Context**: 20+ case-specific variables injected into AI conversations

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

---

Built with ⚖️ by your legal tech team