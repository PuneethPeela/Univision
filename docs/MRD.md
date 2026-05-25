# UNIVISION — Market Requirements Document (MRD)

## 1. Executive Summary

**Product Name**: UNIVISION — AI-Powered College Intelligence Platform  
**Tagline**: *Stop searching. Start discovering.*  
**Version**: 1.0 MVP  
**Date**: May 2025  

UNIVISION is a college discovery and decision-making platform that transforms the chaotic college search process into a data-driven, AI-guided experience. Unlike existing platforms (Careers360, CollegeDunia, Niche), UNIVISION provides a **neural matching engine** that computes personalized compatibility scores and an AI advisor for real-time guidance.

---

## 2. Market Analysis

### 2.1 Problem Statement
- **3.9 million** US high school seniors face college decisions annually
- Average student applies to **10+ schools**, spending **200+ hours** researching
- Students with private counselors ($3K–$10K/year) have structured intelligence; everyone else guesses
- Existing platforms are **directory-style listings** with no personalized intelligence

### 2.2 Competitive Landscape

| Platform | Strengths | Weaknesses |
|----------|-----------|------------|
| Careers360 | Indian market leader, exam predictors | Cluttered UI, ad-heavy, no AI |
| CollegeDunia | Large DB, reviews, compare | Generic rankings, no personalization |
| Niche | US-focused, good reviews | No AI matching, limited compare |
| UNIVISION | AI matching, compare radar, predictor | New entrant, smaller DB |

### 2.3 Target Users
1. **High school juniors/seniors** (ages 16-18) researching colleges
2. **Parents** helping children with college decisions
3. **Transfer students** evaluating options
4. **International students** exploring US institutions

---

## 3. Product Requirements

### 3.1 Core Features (Must-Have — MVP)

| # | Feature | Priority | Description |
|---|---------|----------|-------------|
| F1 | College Listing + Search | P0 | Searchable, filterable college cards with infinite scroll |
| F2 | College Detail Page | P0 | Full detail view: overview, courses, placements, reviews |
| F3 | Compare Colleges | P0 | Side-by-side comparison with spider chart radar |
| F4 | Predictor Tool | P0 | Input exam/rank → get recommended colleges |
| F5 | Authentication + Saved | P1 | Login/signup, save colleges, save comparisons |
| F6 | Q&A Discussion | P1 | Ask/answer questions, browse discussions |

### 3.2 Enhancement Features

| # | Feature | Priority |
|---|---------|----------|
| E1 | AI Advisor Chat | P1 |
| E2 | Application Tracker (Kanban) | P2 |
| E3 | Infinite Carousel on Homepage | P0 |
| E4 | Dark Mode Design System | P0 |

### 3.3 Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| Page Load Time | < 2s (LCP) |
| Mobile Responsive | All breakpoints |
| Accessibility | WCAG 2.1 AA |
| Security | OWASP Top 10 covered |
| Uptime | 99.5% (Vercel) |
| Database | PostgreSQL (managed) |

---

## 4. Success Metrics

| Metric | Target |
|--------|--------|
| Feature Completion | ≥ 4 of 6 features fully functional |
| Build Success | Zero build errors |
| Responsive Design | Works on mobile, tablet, desktop |
| Auth Flow | Complete signup → login → save flow |
| Deployment | Live URL on Vercel |

---

## 5. Design References

- **Careers360.com**: College listing layout, predictor tool flow, exam-based filtering
- **CollegeDunia.com**: Compare feature layout, review system, detail page tabs
- **UNIVISION Reference HTML**: Lumina Academic design system — dark mode, glassmorphism, cyan/lavender palette, bento grid

---

## 6. Constraints & Assumptions

- Free-tier deployment (Vercel + Neon PostgreSQL)
- Seeded database with 30+ colleges (not live API data)
- AI features may use fallback responses if no API key provided
- MVP scope — no payment integration, no real-time notifications
