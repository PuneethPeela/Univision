# UNIVISION — AI-Powered College Discovery Platform

<div align="center">

**Stop Searching. Start Discovering.**

A production-grade college discovery and decision-making platform built with Next.js 16, Prisma 7, and a premium dark-mode UI.

</div>

---

## ✨ Features

### 1. 🎓 College Listing + Search
- Searchable database of 30+ US colleges with rich metadata
- Filter by type (Reach/Target/Safety), tags (STEM, Ivy League, Liberal Arts)
- Sort by match score, name, or rating
- Infinite scroll with cursor-based pagination

### 2. 📋 College Detail Pages
- Comprehensive college profiles with Overview, Courses, Placements, and Reviews tabs
- Spider/radar chart for 6-dimension compatibility analysis
- Match score ring visualization
- User review system with ratings

### 3. ⚖️ Compare Colleges
- Side-by-side comparison of any two colleges
- Overlaid radar charts for visual comparison
- Dimension comparison bars (Research, Campus, Social, Financial, Innovation, Diversity)
- Stat cards for key metrics

### 4. 🎯 College Predictor
- Input exam type (SAT/ACT/JEE/GRE), score, GPA, and preferred major
- Weighted distance scoring algorithm classifies colleges into tiers:
  - **Reach** — High stretch, low acceptance probability
  - **Target** — Good match based on your profile
  - **Safety** — Strong likelihood of admission
- Returns top 15 ranked results with reasoning

### 5. 💬 Q&A / Discussions
- Community discussion forum with search and sorting (Recent/Popular/Unanswered)
- Ask questions, post answers, upvote discussions
- Threaded discussion view with user avatars

### 6. 🔐 Authentication + Saved Items
- Email/password authentication with bcrypt hashing
- JWT session strategy via NextAuth
- Save colleges to a personal shortlist
- Protected routes with auth guards

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (Turbopack) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **ORM** | Prisma 7 with @prisma/adapter-pg |
| **Database** | PostgreSQL (Neon-compatible) |
| **Auth** | NextAuth.js v4 (JWT + Credentials) |
| **Validation** | Zod |
| **Design** | Lumina Academic (Glassmorphism, Neon Cyan) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted e.g. Neon, Supabase)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/univision.git
cd univision

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and NEXTAUTH_SECRET

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with 30+ colleges
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/univision?sslmode=require"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth + registration
│   │   ├── colleges/       # College list + detail
│   │   ├── compare/        # Side-by-side comparison
│   │   ├── discussions/    # Q&A forum CRUD
│   │   ├── predict/        # Predictor algorithm
│   │   ├── reviews/        # College reviews
│   │   └── saved/          # Saved colleges
│   ├── auth/               # Login/Signup page
│   ├── colleges/[slug]/    # College detail page
│   ├── compare/            # Compare page
│   ├── discussions/        # Discussion list + detail
│   ├── explore/            # College listing with search
│   ├── predict/            # Predictor tool
│   ├── saved/              # Saved colleges page
│   ├── globals.css         # Design system (Tailwind v4)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── CollegeCard.tsx     # Glassmorphism college card
│   ├── EmptyState.tsx      # Empty state placeholder
│   ├── FilterChips.tsx     # Interactive filter chips
│   ├── InfiniteCarousel.tsx # Auto-scrolling carousel
│   ├── Navbar.tsx          # Glass navbar with mobile menu
│   ├── Providers.tsx       # SessionProvider wrapper
│   ├── SearchBar.tsx       # Debounced search input
│   ├── SpiderChart.tsx     # Canvas radar/spider chart
│   ├── StatsCard.tsx       # Bento stat card
│   └── TabNav.tsx          # Tab navigation
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   └── db.ts               # Prisma client singleton
└── types/
    └── next-auth.d.ts      # NextAuth type augmentation
prisma/
├── schema.prisma           # Database schema
├── seed.ts                 # College seed data (30+ entries)
prisma.config.ts            # Prisma 7 configuration
```

---

## 🎨 Design System — Lumina Academic

| Token | Value | Usage |
|-------|-------|-------|
| `surface-900` | `#0a0b0f` | Page background |
| `surface-800` | `#111318` | Card background |
| `surface-700` | `#1a1b23` | Elevated surfaces |
| `cyan` | `#00f4fe` | Primary accent, CTAs |
| `lavender` | `#c5c4de` | Secondary accent |
| `onSurface` | `#e8e9ed` | Primary text |
| `muted` | `#9395a5` | Secondary text |

### Effects
- **Glassmorphism**: `backdrop-blur-xl bg-white/4 border border-white/8`
- **Neon Glow**: `text-shadow: 0 0 4px cyan, 0 0 8px cyan`
- **Animations**: fadeUp, slideIn, carouselSlide, pulse

---

## 📄 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/colleges` | List colleges with search/filter/sort/pagination |
| `GET` | `/api/colleges/:slug` | Get college by slug with reviews |
| `GET` | `/api/compare?ids=slug1,slug2` | Compare 2-3 colleges |
| `POST` | `/api/predict` | Get college predictions based on profile |
| `GET/POST` | `/api/reviews` | List/create reviews |
| `GET/POST` | `/api/discussions` | List/create discussions |
| `GET` | `/api/discussions/:id` | Get discussion with answers |
| `POST` | `/api/discussions/:id/answers` | Post an answer |
| `POST` | `/api/discussions/:id/upvote` | Upvote a discussion |
| `GET/POST` | `/api/saved` | List/save colleges |
| `DELETE` | `/api/saved/:id` | Remove saved college |
| `POST` | `/api/auth/register` | Register new user |
| `*` | `/api/auth/[...nextauth]` | NextAuth handlers |

---

## 🔒 Security

- Passwords hashed with **bcrypt** (12 rounds)
- JWT sessions with server-side validation
- Zod validation on all POST endpoints
- Auth guards on protected routes
- CSRF protection via NextAuth
- Input sanitization and SQL injection protection via Prisma

---

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📝 License

MIT © UNIVISION Team
