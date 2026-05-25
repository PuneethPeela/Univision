# UNIVISION — Technical Requirements Document (TRD)

## 1. High-Level Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                           │
│  Next.js 14 App Router (React 18 + TypeScript + TailwindCSS)  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Home /   │ │ Explore  │ │ Compare  │ │ Predict  │        │
│  │ Dashboard │ │ Listing  │ │ Colleges │ │  Tool    │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  Detail   │ │   Q&A    │ │  Auth /  │                     │
│  │  Page     │ │Discussion│ │  Saved   │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
├───────────────────────────────────────────────────────────────┤
│                      API LAYER (Next.js API Routes)           │
│  /api/colleges  /api/auth  /api/predict  /api/discussions     │
│  /api/compare   /api/saved /api/reviews  /api/ai              │
├───────────────────────────────────────────────────────────────┤
│                      ORM LAYER (Prisma)                       │
│  Schema → Migrations → Type-safe queries → Relations          │
├───────────────────────────────────────────────────────────────┤
│                    DATABASE (PostgreSQL / Neon)                │
│  colleges | users | saved_colleges | discussions | answers    │
│  reviews  | saved_comparisons | accounts | sessions           │
└───────────────────────────────────────────────────────────────┘
```

## 2. Low-Level Architecture

### 2.1 Frontend Component Tree

```
App (layout.tsx)
├── Navbar
│   ├── Logo
│   ├── NavLinks (Home, Explore, Compare, Predict, Discuss)
│   ├── AIBadge
│   └── UserMenu (Avatar → Dropdown: Profile, Saved, Sign Out)
│
├── HomePage (page.tsx)
│   ├── HeroSection (animated tagline + CTA)
│   ├── InfiniteCarousel (featured colleges auto-scroll)
│   ├── StatsGrid (bento cards: GPA, SAT, Interest, Matches)
│   ├── TopMatchesGrid (6 college cards)
│   └── AIInsightCard
│
├── ExplorePage (explore/page.tsx)
│   ├── SearchBar (debounced input)
│   ├── FilterChips (type + tag filters)
│   ├── CollegeGrid (infinite scroll)
│   │   └── CollegeCard (name, match%, location, stats)
│   └── LoadMoreTrigger (IntersectionObserver)
│
├── CollegeDetailPage (colleges/[slug]/page.tsx)
│   ├── CollegeHeader (name, location, match ring, save btn)
│   ├── TabNav (Overview | Courses | Placements | Reviews)
│   ├── OverviewTab (description, stats grid, spider chart)
│   ├── CoursesTab (program list with fees)
│   ├── PlacementsTab (placement stats, charts)
│   └── ReviewsTab (review list + write review form)
│
├── ComparePage (compare/page.tsx)
│   ├── CollegeSelectors (2-3 dropdowns)
│   ├── SpiderChart (Canvas API radar overlay)
│   ├── ComparisonBars (dimension-by-dimension)
│   └── SideBySideCards (stat comparison)
│
├── PredictorPage (predict/page.tsx)
│   ├── PredictorForm (exam, score, GPA, major)
│   ├── CalculatingAnimation (loading state)
│   └── ResultsList (ranked colleges with tiers)
│
├── DiscussionsPage (discussions/page.tsx)
│   ├── DiscussionList (question cards)
│   ├── AskQuestionModal (title, body, tags)
│   └── DiscussionThread (discussions/[id]/page.tsx)
│       ├── QuestionCard (title, body, upvote, author)
│       ├── AnswersList (answer cards with upvote)
│       └── PostAnswerForm
│
├── AuthPage (auth/page.tsx)
│   ├── LoginForm (email, password)
│   ├── SignupForm (name, email, password)
│   └── SocialButtons (GitHub, Google)
│
└── SavedPage (saved/page.tsx)
    ├── SavedCollegesGrid
    └── SavedComparisonsList
```

### 2.2 Database Schema (ERD)

```
┌──────────────────┐     ┌──────────────────┐
│     colleges     │     │      users       │
├──────────────────┤     ├──────────────────┤
│ id (PK)          │     │ id (PK)          │
│ name             │     │ name             │
│ slug (UNIQUE)    │     │ email (UNIQUE)   │
│ location         │     │ passwordHash     │
│ state            │     │ image            │
│ type             │     │ createdAt        │
│ description      │     │ updatedAt        │
│ overview (TEXT)   │     └────────┬─────────┘
│ fees             │              │
│ rating           │              │ 1:N
│ acceptanceRate   │              │
│ avgAid           │     ┌────────┴─────────┐
│ sat              │     │ saved_colleges   │
│ gpa              │     ├──────────────────┤
│ matchScore       │     │ id (PK)          │
│ research         │     │ userId (FK)      │
│ campus           │     │ collegeId (FK)   │
│ social           │     │ createdAt        │
│ financial        │     └──────────────────┘
│ innovation       │
│ diversity        │     ┌──────────────────┐
│ courses (JSON)   │     │  discussions     │
│ placements (JSON)│     ├──────────────────┤
│ reviews (JSON)   │     │ id (PK)          │
│ majors (TEXT[])  │     │ title            │
│ tags (TEXT[])    │     │ body (TEXT)       │
│ imageUrl         │     │ userId (FK)      │
│ createdAt        │     │ collegeId (FK?)  │
│ updatedAt        │     │ tags (TEXT[])    │
└──────────────────┘     │ upvotes          │
                         │ createdAt        │
                         └────────┬─────────┘
                                  │ 1:N
                         ┌────────┴─────────┐
                         │    answers       │
                         ├──────────────────┤
                         │ id (PK)          │
                         │ body (TEXT)       │
                         │ discussionId (FK)│
                         │ userId (FK)      │
                         │ upvotes          │
                         │ isAccepted       │
                         │ createdAt        │
                         └──────────────────┘
```

### 2.3 API Contracts

#### Colleges API
```
GET  /api/colleges
  Query: ?q=string&type=reach|target|safety&tag=string&sort=match|name|rating&cursor=number&limit=number
  Response: { colleges: College[], nextCursor: number | null }

GET  /api/colleges/:slug
  Response: { college: CollegeDetail }
```

#### Compare API
```
GET  /api/compare?ids=1,2,3
  Response: { colleges: College[] }
```

#### Predict API
```
POST /api/predict
  Body: { exam: string, score: number, gpa: number, major?: string }
  Response: { predictions: { college: College, tier: "reach"|"target"|"safety", reason: string }[] }
```

#### Discussions API
```
GET  /api/discussions?page=1&sort=recent|popular&college=slug
  Response: { discussions: Discussion[], total: number }

POST /api/discussions  [AUTH]
  Body: { title: string, body: string, tags: string[], collegeId?: string }
  Response: { discussion: Discussion }

GET  /api/discussions/:id
  Response: { discussion: DiscussionWithAnswers }

POST /api/discussions/:id/answers  [AUTH]
  Body: { body: string }
  Response: { answer: Answer }
```

#### Saved API
```
GET    /api/saved/colleges  [AUTH]
POST   /api/saved/colleges  [AUTH]  Body: { collegeId: string }
DELETE /api/saved/colleges/:id  [AUTH]
```

#### Auth API
```
POST /api/auth/register
  Body: { name: string, email: string, password: string }
  Response: { user: User }

NextAuth handles: /api/auth/[...nextauth]
  Providers: Credentials, GitHub, Google
```

## 3. Security Architecture

### 3.1 Authentication Security
- Passwords hashed with **bcrypt** (12 salt rounds)
- **NextAuth.js** JWT sessions (stateless, no server session store)
- CSRF protection via NextAuth built-in tokens
- HTTP-only secure cookies for session tokens

### 3.2 API Security
- **Input validation** with Zod schemas on all endpoints
- **SQL injection prevention** via Prisma parameterized queries
- **Rate limiting** via middleware (100 req/min per IP)
- **CORS** configured to allow only production domain
- **XSS prevention**: React's built-in escaping + CSP headers

### 3.3 Data Security
- Database connection via **SSL** (Neon enforces TLS)
- API keys stored in **environment variables** (never client-side)
- User data minimal — no PII beyond email/name
- Passwords never logged or exposed in API responses

### 3.4 Edge Cases Handled
- Duplicate email registration → 409 Conflict
- Invalid college slug → 404 Not Found
- Unauthorized save/discuss → 401 Unauthorized
- Malformed predict input → 400 Bad Request with validation errors
- Database connection failure → 503 Service Unavailable
- Empty search results → Graceful empty state UI

## 4. Performance Architecture

### 4.1 Frontend Performance
- **Next.js Static Generation** for college detail pages (ISR)
- **Dynamic imports** for heavy components (SpiderChart, Kanban)
- **Image optimization** via Next.js `<Image>` component
- **Debounced search** (300ms) to reduce API calls
- **Infinite scroll** with IntersectionObserver (not pagination buttons)
- **CSS animations** via GPU-accelerated transforms (no layout thrashing)

### 4.2 Backend Performance
- **Database indexes** on: slug, type, matchScore, userId
- **Cursor-based pagination** (not offset — O(1) vs O(n))
- **Prisma query optimization**: select only needed fields
- **Connection pooling** via Prisma + Neon serverless driver

## 5. Deployment Architecture

```
GitHub Repository
    │
    ▼
Vercel (Auto-deploy on push)
    ├── Frontend (Next.js SSR/SSG)
    ├── API Routes (Serverless Functions)
    └── Environment Variables
         ├── DATABASE_URL (Neon PostgreSQL)
         ├── NEXTAUTH_SECRET
         ├── NEXTAUTH_URL
         └── AI_API_KEY (optional)
```

## 6. Agent Orchestration Plan

| Agent | Role | Files Owned |
|-------|------|-------------|
| **Main (Orchestrator)** | Scaffold, review, deploy | package.json, next.config, .env, deployment |
| **Agent A: Schema** | Database + seed + API routes | prisma/*, src/app/api/*, src/lib/db.ts |
| **Agent B: Design** | UI components + layout + animations | src/components/*, globals.css, tailwind.config |
| **Agent C: Pages** | All page components + features | src/app/(pages)/* |
| **Agent D: Auth+Social** | Auth, discussions, saved | src/app/auth/*, discussions/*, saved/* |

### Handoff Protocol
1. Main scaffolds project → signals Agents A+B to start
2. Agent A completes schema → signals Agent C (pages depend on types)
3. Agent B completes UI → signals Agents C+D (pages depend on components)
4. Agents C+D complete pages → Main runs build check + proofreading
5. Main deploys to Vercel + pushes to GitHub
