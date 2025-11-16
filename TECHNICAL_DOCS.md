# LeetCourt Technical Documentation

## Architecture Overview

LeetCourt is a single-page React application that simulates courtroom arguments using AI voice agents. The application uses a client-side architecture with localStorage for data persistence and integrates with external AI services for voice interaction and analysis.

### Tech Stack

- **Frontend Framework**: React 18.3.1 with functional components and hooks
- **Build Tool**: Vite 5.4.21
- **Routing**: React Router DOM 6.27.0
- **Styling**: TailwindCSS 3.4.14 with custom theme
- **UI Components**: Shadcn UI (radix-ui primitives)
- **State Management**: React hooks (useState, useEffect, useRef)
- **Data Fetching**: TanStack React Query 5.59.20
- **Animations**: Framer Motion 11.11.7
- **Voice AI**: ElevenLabs Conversational AI
- **AI Services**: OpenRouter API (Claude 3.5 Sonnet, GPT-5.1)
- **PDF Processing**: pdfjs-dist 5.4.394
- **Deployment**: Vercel

---

## Core Components

### 1. BattleArena.jsx
**Location**: `src/pages/BattleArena.jsx`

Main courtroom interface where users interact with the AI judge.

**Key Features**:
- Voice conversation with two ElevenLabs Agents -> AI Judge and AI Lawyer
- Automatic phase progression through trial stages
- Real-time performance analysis
- Dynamic variable injection for AI context
- Objection detection and handling
- Score tracking and updates

**State Management**:
```javascript
const [currentCase, setCurrentCase] = useState(null);          // Selected case
const [currentBattle, setCurrentBattle] = useState(null);      // Active trial
const [transcript, setTranscript] = useState([]);              // Conversation history
const [userTurnCount, setUserTurnCount] = useState(0);         // Track turns for phase progression
const [canAdvanceStage, setCanAdvanceStage] = useState(false); // Phase advancement flag
```

**Trial Phases**:
1. **Opening Statements**
2. **Direct Examination** 
3. **Cross Examination** 
4. **Closing Arguments** 

**ElevenLabs Integration**:
- Agent ID: <YOUR_AGENT_ID>
- Embedded via `<elevenlabs-convai>` custom element
- Dynamic variables passed as JSON:
  ```javascript
  {
    _judge_name_: "The Honorable Margaret Chen",
    _case_title_: currentCase.title,
    _legal_issues_: currentCase.issue,
    _case_facts_: currentCase.facts,
    _applicable_statutes_: currentCase.statutes,
    _burden_of_proof_: currentCase.burden_of_proof,
    _user_role_: "Defense Attorney",
    _case_type_: currentCase.case_type,
    _judge_temperament_: "balanced",
    _verdict_ready_: "false"
  }
  ```

**Performance Analysis**:
- Runs every 3 seconds via `setInterval`
- Analyzes last 5 conversation messages
- Calls `analyzeUserPerformance()` from `performanceAnalyzer.js`
- Updates scores: logic, persuasiveness, precedent_use, clarity
- Detects objections and finish phase signals

---

### 2. CaseLibrary.jsx
**Location**: `src/pages/CaseLibrary.jsx`

Browse, filter, upload, and manage legal cases.

**Features**:
- Filter by case type and difficulty
- Real-time search filtering
- PDF case upload with AI extraction
- Delete cases with confirmation
- Navigate to BattleArena with selected case

**Data Flow**:
1. User uploads PDF → `CaseUploader.jsx`
2. PDF extracted → `pdfExtractor.js`
3. AI generates case data → OpenRouter API
4. Case saved → `apiClient.jsx` (localStorage)
5. Query invalidated → TanStack Query refreshes list

**Filter Logic**:
```javascript
const filteredCases = cases.filter(c => {
  const matchesType = !caseType || c.case_type === caseType;
  const matchesDifficulty = !difficulty || c.difficulty === difficulty;
  return matchesType && matchesDifficulty;
});
```

---

### 3. ToolsPanel.jsx
**Location**: `src/components/battle/ToolsPanel.jsx`

Displays case information during trial (notes, evidence, precedents).

**Tab Structure**:
- **Notes**: Strategic insights and key points
- **Evidence**: Physical/documentary evidence with type badges
- **Precedents**: Relevant legal cases with citations

**Props**:
```javascript
{ caseData } // Current case object from BattleArena
```

**Data Rendering**:
- Notes: Plain text display with empty state
- Evidence: Mapped array with type badges (document, video, testimony, physical)
- Precedents: Mapped array with Scale icons and case citations

---

### 4. CaseUploader.jsx
**Location**: `src/components/CaseUploader.jsx`

Drag-and-drop PDF uploader with AI extraction.

**Upload Flow**:
1. User drops PDF file
2. Validate file type and size
3. Call `extractAndProcessPDF()` from `pdfExtractor.js`
4. Show real-time status updates
5. Save extracted case to localStorage
6. Notify parent component via `onCaseAdded` callback

**Status States**:
- `idle`: Ready for upload
- `extracting`: Reading PDF text
- `analyzing`: AI processing
- `complete`: Successfully uploaded
- `error`: Upload failed

---

## Utility Modules

### 1. pdfExtractor.js
**Location**: `src/utils/pdfExtractor.js`

Extracts text from PDFs and generates structured case data using AI.

**Key Functions**:

#### `extractTextFromPDF(file)`
- Uses `pdfjs-dist` to parse PDF
- Extracts text from all pages
- Returns concatenated text string
- Error handling for corrupt PDFs

#### `calculateMaxTokens(pdfText)`
- Dynamically calculates token limit based on PDF length
- Formula: `Math.min(3500, Math.max(1000, Math.floor(textLength / 3)))`
- Prevents token limit errors with large documents

#### `generateCaseFromText(pdfText, retryCount = 0)`
- Calls OpenRouter API (GPT-5.1)
- Extracts structured case data:
  ```json
  {
    "title": "Case name",
    "case_type": "Criminal|Civil|Constitutional",
    "difficulty": "Easy|Medium|Hard|Expert",
    "issue": "Legal question",
    "description": "Summary",
    "facts": "Case facts",
    "statutes": "Applicable laws",
    "burden_of_proof": "Standard",
    "user_argument": "Defense position",
    "defense_thesis": "Key argument",
    "notes": "Strategic notes",
    "evidence": [{"type": "", "description": ""}],
    "precedents": [{"case": "", "citation": "", "relevance": ""}]
  }
  ```
- Retry logic: 2 attempts with 30% token reduction on failure
- JSON parsing with error recovery

#### `extractAndProcessPDF(file, statusCallback)`
- Main entry point for PDF processing
- Calls `extractTextFromPDF()` → `generateCaseFromText()`
- Provides real-time status updates via callback
- Returns complete case object or null on error

**API Configuration**:
```javascript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'openai/gpt-5.1',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens
  })
});
```

---

### 2. performanceAnalyzer.js
**Location**: `src/utils/performanceAnalyzer.js`

Real-time analysis of user arguments using GPT-5.

**Key Functions**:

#### `analyzeUserPerformance(conversationHistory, caseContext)`
- Analyzes last 5 conversation messages
- Returns structured performance metrics:
  ```json
  {
    "logic": 0-100,
    "persuasiveness": 0-100,
    "precedent_use": 0-100,
    "clarity": 0-100,
    "objection_detected": "hearsay|relevance|leading|none",
    "finish_phase": true|false,
    "suggestions": ["tip1", "tip2"]
  }
  ```
- Runs every 3 seconds during active trial
- Used for real-time score updates

**Prompt Structure**:
```javascript
const prompt = `Analyze this courtroom argument exchange:

Case Context: ${JSON.stringify(caseContext, null, 2)}

Recent conversation:
${conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}

Evaluate:
1. Logic and reasoning (0-100)
2. Persuasiveness (0-100)
3. Use of legal precedent (0-100)
4. Clarity of expression (0-100)
5. Detect any objections in user's speech
6. Determine if user wants to finish this phase

Return JSON only.`;
```

**API Configuration**:
- Model: `anthropic/claude-3.5-sonnet`
- Max tokens: 500
- Temperature: 0.3 (more deterministic)
- Error handling with fallback values

---

### 3. apiClient.jsx
**Location**: `src/api/apiClient.jsx`

localStorage-based data persistence layer with CRUD operations.

**Storage Keys**:
- `leetcourt_cases` - All case data
- `leetcourt_battles` - Trial sessions
- `leetcourt_user_profiles` - User information

**Entity Managers**:

#### Case Manager
```javascript
{
  list(): Case[],
  get(id): Case,
  create(data): Case,
  update(id, data): Case,
  delete(id): boolean
}
```

#### Battle Manager
```javascript
{
  list(): Battle[],
  get(id): Battle,
  create(data): Battle,
  update(id, data): Battle,
  delete(id): boolean
}
```

#### UserProfile Manager
```javascript
{
  list(): UserProfile[],
  get(id): UserProfile,
  create(data): UserProfile,
  update(id, data): UserProfile
}
```

**Data Migration**:
- Automatically adds missing fields to existing cases
- Runs on app initialization
- Checks for `notes` field and adds from defaults if missing

**Default Cases**:
1. **People v. Carter** (Criminal, Medium)
   - Issue: Warrantless vehicle search
   - Focus: 4th Amendment rights
   
2. **Smith v. MegaCorp Industries** (Civil, Hard)
   - Issue: Workplace discrimination
   - Focus: Civil Rights Act violations
   
3. **Johnson v. City Hospital** (Civil, Medium)
   - Issue: Medical malpractice
   - Focus: Standard of care breach

---

## Data Models

### Case
```typescript
interface Case {
  id: string;                    // UUID
  title: string;                 // "People v. Carter"
  case_type: 'Criminal' | 'Civil' | 'Constitutional';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  issue: string;                 // Legal question
  description: string;           // Case summary
  facts: string;                 // Detailed facts
  statutes: string;              // Applicable laws
  burden_of_proof: string;       // Standard of proof
  user_argument: string;         // Defense position
  defense_thesis: string;        // Key defense argument
  notes: string;                 // Strategic notes
  evidence: Evidence[];          // Evidence items
  precedents: Precedent[];       // Legal precedents
}
```

### Battle
```typescript
interface Battle {
  id: string;                    // UUID
  case_id: string;               // Reference to Case
  stage: 'opening' | 'direct' | 'cross' | 'closing';
  status: 'active' | 'completed';
  objections_raised: number;
  objections_sustained: number;
  logic_score: number;           // 0-100
  persuasiveness_score: number;  // 0-100
  precedent_score: number;       // 0-100
  clarity_score: number;         // 0-100
  total_score: number;           // Sum of above
  created_at: string;            // ISO timestamp
}
```

### Evidence
```typescript
interface Evidence {
  type: 'document' | 'video' | 'testimony' | 'physical';
  description: string;
}
```

### Precedent
```typescript
interface Precedent {
  case: string;                  // "Terry v. Ohio"
  citation: string;              // "392 U.S. 1 (1968)"
  relevance: string;             // Why it matters
}
```

---

## State Management

### React Query Configuration
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false
    }
  }
});
```

### Query Keys
- `["cases"]` - Case list
- `["battles"]` - Battle list
- `["userProfile"]` - User profile

### Cache Invalidation
```javascript
// After creating/updating/deleting
queryClient.invalidateQueries({ queryKey: ["cases"] });
```

---

## Automatic Phase Progression Logic

**Implementation** (BattleArena.jsx, line ~520):

```javascript
const handleUserSpeech = (userText) => {
  // ... (add to transcript)
  
  const newUserTurnCount = userTurnCount + 1;
  setUserTurnCount(newUserTurnCount);

  const currentStage = currentBattle.stage;
  
  // Opening: After 3 user turns, move to Direct
  if (currentStage === 'opening' && newUserTurnCount >= 3) {
    setTimeout(() => {
      handleAdvanceStage();
      setUserTurnCount(0);
    }, 3000);
  }
  
  // Direct: After 7 user turns, move to Cross
  if (currentStage === 'direct' && newUserTurnCount >= 7) {
    setTimeout(() => {
      handleAdvanceStage();
      setUserTurnCount(0);
    }, 3000);
  }
  
  // Cross: After 7 user turns, move to Closing
  if (currentStage === 'cross' && newUserTurnCount >= 7) {
    setTimeout(() => {
      handleAdvanceStage();
      setUserTurnCount(0);
    }, 3000);
  }

  // Closing: After 2 user turns, complete case
  if (currentStage === 'closing' && newUserTurnCount >= 2) {
    setTimeout(() => {
      handleAdvanceStage();
      setUserTurnCount(0);
    }, 3000);
  }
};
```

**Phase Requirements**:
| Phase | Turns Required | Duration (approx) | Next Phase |
|-------|----------------|-------------------|------------|
| Opening | 3 | 1-2 minutes | Direct |
| Direct | 7 | 3-4 minutes | Cross |
| Cross | 7 | 3-4 minutes | Closing |
| Closing | 2 | 1 minute | Complete |

**Total Trial Time**: ~8-11 minutes

---

## API Integration

### OpenRouter API

**Base URL**: `https://openrouter.ai/api/v1/chat/completions`

**Authentication**: Bearer token in `VITE_OPENROUTER_API_KEY`

**Models Used**:
1. **GPT-5.1** (`openai/gpt-5.1`)
   - Purpose: PDF case extraction and performance analysis
   - Max tokens: Dynamic
   - Temperature: 0.7


**Request Format**:
```javascript
{
  model: 'openai/gpt-5.1',
  messages: [
    {
      role: 'user',
      content: 'Your prompt here'
    }
  ],
  max_tokens: 2000,
  temperature: 0.7
}
```

**Response Format**:
```javascript
{
  choices: [
    {
      message: {
        content: 'AI response text'
      }
    }
  ]
}
```

**Error Handling**:
- Retry logic for token limit errors (30% reduction)
- Fallback responses for API failures
- User-friendly error messages

---

### ElevenLabs Conversational AI

**Integration Method**: Web Component

**HTML Embed** (index.html):
```html
<script 
  src="https://unpkg.com/@elevenlabs/convai-widget-embed" 
  async 
  type="text/javascript">
</script>
```

**Component Usage** (BattleArena.jsx):
```jsx
<elevenlabs-convai 
  agent-id="<YOUR_AGENT_ID"
  dynamic-variables={JSON.stringify({
    _judge_name_: "The Honorable Margaret Chen",
    _case_title_: currentCase.title,
    // ... more variables
  })}
/>
```

**Event Listeners**:
```javascript
// Listen for user speech
window.addEventListener('elevenlabs-user-message', handleEvent);

// Listen for AI responses
window.addEventListener('elevenlabs-agent-message', handleEvent);
```

**Dynamic Variables**:
- Updated in real-time as case/battle state changes
- Passed as JSON string to widget
- Agent uses variables in conversation context

---

## Styling System

### TailwindCSS Configuration
**File**: `tailwind.config.js`

**Custom Theme**:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#d4af37',      // Gold
      background: '#0a0e1a',   // Dark blue
      card: '#1a1f3a',         // Card background
    }
  }
}
```

**Key Color Palette**:
- **Gold** (`#d4af37`): Accents, borders, active states
- **Dark Blue** (`#0a0e1a`): Main background
- **Card Blue** (`#1a1f3a`): Component backgrounds
- **Muted Gold** (`#d4af37/20`): Subtle borders

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layouts adapt to screen size
- Voice AI widget scales responsively

---

## Performance Optimization

### Code Splitting
- React.lazy() for route-based splitting
- Dynamic imports for heavy components
- Vite handles automatic chunking

### Bundle Size
- Main JS: ~404 KB (127 KB gzipped)
- CSS: ~31 KB (6 KB gzipped)
- PDF worker: ~1.9 MB (separate chunk)

### Optimization Techniques
1. **Debouncing**: Analysis runs every 3 seconds (not on every message)
2. **Memoization**: React.memo on expensive components
3. **Lazy Loading**: PDF.js loaded on-demand
4. **LocalStorage**: Fast client-side data access
5. **React Query**: Automatic caching and deduplication

---

## Error Handling

### Global Error Boundaries
- Catches React component errors
- Displays user-friendly error messages
- Logs errors for debugging

### API Error Handling
```javascript
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'API Error');
  }
  return await response.json();
} catch (error) {
  console.error('API call failed:', error);
  return fallbackValue;
}
```

### User Feedback
- Toast notifications for errors
- Loading states during async operations
- Retry buttons for failed actions

---

## Security Considerations

### API Key Management
- Environment variables for sensitive keys
- `.env` file in `.gitignore`
- Never expose keys in client code
- Vercel environment variables for production

### Data Validation
- Input sanitization for user-generated content
- File type validation (PDF only)
- File size limits (prevent memory issues)

### XSS Prevention
- React's automatic escaping
- No `dangerouslySetInnerHTML` usage
- Content Security Policy headers

---

## Testing Strategy

### Unit Tests (Recommended)
```bash
npm install --save-dev vitest @testing-library/react
```

**Test Cases**:
- `pdfExtractor.js`: PDF parsing, token calculation
- `performanceAnalyzer.js`: Score calculation
- `apiClient.jsx`: CRUD operations
- Components: Rendering, user interactions

### Integration Tests
- Case upload flow
- Battle progression
- Score updates

### E2E Tests (Playwright/Cypress)
- Full trial simulation
- Phase progression
- PDF upload → Battle flow

---

## Deployment

### Vercel Configuration
**File**: `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Purpose**: SPA routing support (all routes → index.html)

### Environment Variables
Set in Vercel Dashboard:
- `VITE_OPENROUTER_API_KEY` - Required for AI features

### Build Command
```bash
npm run build
```

### Output Directory
```
dist/
```

### Domain Configuration
- Custom domain: <YOUR_DOMAIN>
- SSL: Automatic via Vercel
- DNS: A record to `76.76.21.21`, CNAME to `cname.vercel-dns.com`

---

## Development Workflow

### Local Development
1. Clone repository
2. `npm install`
3. Create `.env` with API key
4. `npm run dev`
5. Visit `http://localhost:5173`

### Making Changes
1. Create feature branch
2. Make changes
3. Test locally
4. Build: `npm run build`
5. Commit and push
6. Deploy: `vercel --prod`

### Debugging
- React DevTools for component inspection
- Console logs for event tracking (removed in production)
- Network tab for API calls
- LocalStorage inspector for data

---

## Future Enhancements

### Potential Features
1. **User Authentication**: Firebase/Auth0 integration
2. **Database**: Migrate from localStorage to PostgreSQL/MongoDB
3. **Multiplayer**: Real-time trials with human opponents
4. **Video Integration**: Record and playback arguments
5. **Advanced Analytics**: Detailed performance breakdowns
6. **AI Judge Customization**: Different judge personalities
7. **Case Templates**: Pre-built case structures
8. **Mobile App**: React Native version
9. **Speech-to-Text**: Offline speech recognition
10. **Gamification**: Badges, achievements, rankings

### Technical Debt
- Add comprehensive test coverage
- Implement proper error boundaries
- Migrate to TypeScript
- Add API rate limiting
- Implement retry logic for failed requests
- Optimize bundle size further

---

## Troubleshooting

### Common Issues

#### PDF Upload Fails
**Cause**: Token limit exceeded, corrupt PDF
**Solution**: Check PDF size, verify API key, review error logs

#### Voice AI Not Working
**Cause**: ElevenLabs script not loaded, agent ID incorrect
**Solution**: Check network tab, verify agent ID, refresh page

#### Performance Analysis Not Updating
**Cause**: API rate limits, invalid conversation history
**Solution**: Check API quota, verify conversation structure

#### Case Not Saving
**Cause**: localStorage quota exceeded, JSON parsing error
**Solution**: Clear localStorage, check browser limits

#### Phase Not Progressing
**Cause**: User turn count not incrementing, condition not met
**Solution**: Check `userTurnCount` state, verify turn thresholds

---

## API Rate Limits

### OpenRouter
- **Free Tier**: Limited requests/month
- **Paid Tier**: Higher limits based on plan
- **Recommendation**: Monitor usage, implement caching

### ElevenLabs
- **Free Tier**: Limited voice generation minutes
- **Paid Tier**: More minutes based on plan
- **Recommendation**: Optimize conversation length

---

## Browser Compatibility

### Supported Browsers
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅

### Required Features
- ES6+ JavaScript
- LocalStorage API
- Fetch API
- Web Components (for ElevenLabs)
- Audio API (for voice interaction)

---

## Contributing Guidelines

### Code Style
- Use functional components with hooks
- Follow Airbnb JavaScript style guide
- Use Prettier for formatting
- Write descriptive commit messages

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Submit PR with description
5. Pass code review
6. Merge to main

---

## License

MIT License - See LICENSE file for details


---