# Testing Platform

A full-stack online assessment platform built with **Next.js 14**, **Prisma**, **PostgreSQL**, and **NextAuth.js**. It supports two roles — **Admin/Faculty** and **Student** — each with their own dedicated experience for creating, managing, and taking tests.

---

## Live Demo

🔗 [https://testingplatform-peach.vercel.app](https://testingplatform-peach.vercel.app)

| Role | Email | Password |
|------|-------|----------|
| Admin / Faculty | admin@test.com | admin123 |
| Student | user@test.com | user123 |

---

## What This Project Does

This platform allows educational institutions to conduct online assessments digitally. Here is the full picture:

- Admins create tests with a title, subject, course, and duration
- Each test can have two types of questions — MCQ (Multiple Choice) and Subjective (written answer)
- Admins publish tests to make them visible to students
- Students browse available tests, start a timed attempt, and answer questions
- Answers are auto-saved every 30 seconds so no progress is lost
- On submission, MCQ answers are auto-graded instantly
- Subjective answers are scored by keyword matching
- Both students and admins can view detailed results with correct answers highlighted

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Authentication | NextAuth.js v4 (JWT strategy) |
| ORM | Prisma |
| Database | PostgreSQL (Neon hosted) |
| Deployment | Vercel |
| Notifications | react-hot-toast |
| Password Hashing | bcryptjs |

---

## Local Setup Guide

Follow these steps exactly to run the project on your machine.

### Step 1 — Prerequisites

Make sure you have these installed:
- Node.js 18 or higher → [nodejs.org](https://nodejs.org)
- npm (comes with Node.js)
- A PostgreSQL database — use [Neon](https://neon.tech) free tier or a local PostgreSQL install

### Step 2 — Clone the Repository

```bash
git clone https://github.com/Suhannii/testing_platform-.git
cd testing_platform-
```

### Step 3 — Install Dependencies

```bash
npm install
```

### Step 4 — Create Environment File

Create a file named `.env` in the project root and add the following:

```env
DATABASE_URL="your_postgresql_connection_string"
DIRECT_URL="your_postgresql_connection_string"
NEXTAUTH_SECRET="any_long_random_string_here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_INVITE_CODE="HelloAdmin"
```

> For Neon, both `DATABASE_URL` and `DIRECT_URL` use the same connection string from your Neon dashboard.

### Step 5 — Run Database Migrations

```bash
npx prisma migrate dev --name init
```

This creates all the tables in your database.

### Step 6 — Seed the Database

```bash
npx prisma db seed
```

This creates two demo users and three sample tests so you can explore the platform immediately.

### Step 7 — Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables Explained

| Variable | What it does |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma at runtime (pooled connection for Neon) |
| `DIRECT_URL` | Direct (non-pooled) connection string used by Prisma for migrations |
| `NEXTAUTH_SECRET` | Secret key used to sign and verify JWT tokens — use any long random string |
| `NEXTAUTH_URL` | The base URL of your app — `http://localhost:3000` locally, your Vercel URL in production |
| `ADMIN_INVITE_CODE` | A secret code that must be entered when registering as Admin/Faculty |

---

## Project Structure

```
testing-platform/
│
├── app/                              # All pages and API routes (Next.js App Router)
│   │
│   ├── page.tsx                      # Home page — redirects logged-in users by role,
│   │                                 # shows Sign In / Register buttons for guests
│   │
│   ├── layout.tsx                    # Root layout — wraps all pages with SessionProvider
│   ├── providers.tsx                 # NextAuth SessionProvider client wrapper
│   ├── globals.css                   # Global Tailwind CSS styles
│   ├── not-found.tsx                 # Custom 404 page
│   │
│   ├── login/
│   │   └── page.tsx                  # Login form — email + password, shows error on failure
│   │
│   ├── register/
│   │   └── page.tsx                  # Registration form — choose Student or Admin role
│   │                                 # Admin role requires the ADMIN_INVITE_CODE
│   │
│   ├── dashboard/
│   │   ├── page.tsx                  # Student dashboard (server component) — fetches tests
│   │   │                             # and past attempts from the database
│   │   └── DashboardView.tsx         # Client component — handles filtering by subject/course,
│   │                                 # search, and tab switching between Tests and Attempts
│   │
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout — wraps all admin pages with AdminSidebar
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Admin dashboard — lists all tests with Edit, Publish,
│   │   │                             # Results, and Delete actions
│   │   │
│   │   ├── tests/
│   │   │   ├── new/
│   │   │   │   └── page.tsx          # Create new test form — title, description, subject,
│   │   │   │                         # course, duration
│   │   │   └── [testId]/
│   │   │       ├── edit/
│   │   │       │   └── page.tsx      # Edit test details and manage questions — add MCQ
│   │   │       │                     # or subjective questions, reorder, delete
│   │   │       └── results/
│   │   │           └── page.tsx      # View all student attempts for a specific test
│   │   │
│   │   └── results/
│   │       └── [attemptId]/
│   │           └── page.tsx          # Admin view of a single student attempt in detail
│   │
│   ├── tests/
│   │   └── [testId]/
│   │       ├── start/
│   │       │   ├── page.tsx          # Test info page — shows title, duration, question count
│   │       │   │                     # before the student starts
│   │       │   └── StartTestButton.tsx  # Client button that creates an attempt and redirects
│   │       │
│   │       ├── attempt/
│   │       │   └── [attemptId]/
│   │       │       └── page.tsx      # Active test-taking page — countdown timer, question
│   │       │                         # navigator sidebar, MCQ options, text area for subjective,
│   │       │                         # autosave every 30s, submit confirmation modal
│   │       │
│   │       └── results/
│   │           └── [attemptId]/
│   │               └── page.tsx      # Student result page — score, stats (total/attempted/
│   │                                 # correct/incorrect), per-question breakdown with
│   │                                 # correct answers highlighted
│   │
│   └── api/                          # REST API routes
│       │
│       ├── auth/
│       │   ├── register/
│       │   │   └── route.ts          # POST — register new user, hash password, assign role
│       │   └── [...nextauth]/
│       │       └── route.ts          # NextAuth handler (GET + POST)
│       │
│       ├── admin/
│       │   ├── tests/
│       │   │   ├── route.ts          # GET all tests (admin) / POST create test
│       │   │   └── [testId]/
│       │   │       ├── route.ts      # GET / PATCH / DELETE a specific test
│       │   │       ├── publish/
│       │   │       │   └── route.ts  # PATCH — toggle isPublished true/false
│       │   │       ├── questions/
│       │   │       │   └── route.ts  # POST — add a question to a test
│       │   │       └── results/
│       │   │           └── route.ts  # GET — all attempts for a test
│       │   └── questions/
│       │       └── [questionId]/
│       │           └── route.ts      # PATCH / DELETE a specific question
│       │
│       ├── tests/
│       │   └── route.ts              # GET — published tests only (for students)
│       │
│       └── attempts/
│           ├── route.ts              # POST — start a new attempt
│           └── [attemptId]/
│               ├── route.ts          # GET — attempt data with questions
│               ├── autosave/
│               │   └── route.ts      # POST — save answers mid-attempt
│               ├── submit/
│               │   └── route.ts      # POST — submit, grade, and store final score
│               └── results/
│                   └── route.ts      # GET — graded results for display
│
├── components/
│   ├── AdminSidebar.tsx              # Left sidebar for admin pages — navigation links
│   └── UserNavbar.tsx                # Top navbar for student pages — username + sign out
│
├── lib/
│   ├── auth.ts                       # NextAuth config — credentials provider, JWT callbacks,
│   │                                 # attaches user id and role to session
│   └── prisma.ts                     # Prisma client singleton (prevents multiple instances
│                                     # in development hot reload)
│
├── middleware.ts                     # Route protection — redirects unauthenticated users
│                                     # to /login, blocks non-admins from /admin routes
│
├── prisma/
│   ├── schema.prisma                 # Database schema — all models and relations
│   ├── seed.ts                       # Seed script — creates demo users and 3 sample tests
│   └── migrations/                   # Auto-generated SQL migration history
│
├── types/
│   └── next-auth.d.ts                # TypeScript type extensions — adds id and role
│                                     # to the NextAuth session and JWT types
│
├── .env                              # Local environment variables (not committed to git)
├── .env.example                      # Template showing required environment variables
├── next.config.mjs                   # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies and npm scripts
└── README.md                         # This file
```

---

## Database Schema

```
User
├── id           (unique identifier)
├── name
├── email        (unique)
├── passwordHash (bcrypt hashed)
├── role         USER | ADMIN
├── createdAt
├── tests[]      → tests created by this admin
└── attempts[]   → test attempts by this student

Test
├── id
├── title, description, subject, course
├── durationMinutes
├── isPublished  (false = draft, true = visible to students)
├── createdBy    → User (admin who created it)
├── questions[]
└── attempts[]

Question
├── id
├── type         OBJECTIVE (MCQ) | SUBJECTIVE (written)
├── text         (the question)
├── order        (display order)
├── topicTag     (optional topic label)
├── options[]    → MCQ answer choices
└── keywords[]   → keywords for subjective scoring

Option
├── id
├── text         (answer choice text)
├── isCorrect    (true for the correct answer)
└── answers[]    → student answers that selected this option

Keyword
└── word         (keyword used to score subjective answers)

Attempt
├── id
├── userId       → User (student)
├── testId       → Test
├── startedAt
├── submittedAt
├── score        (calculated on submission)
├── status       IN_PROGRESS | SUBMITTED
└── answers[]

Answer
├── selectedOptionId  → Option (for MCQ)
├── textAnswer        (for subjective)
├── isCorrect         (graded result)
└── keywordScore      (number of keywords matched for subjective)
```

---

## How the Application Works

### Authentication Flow

1. User visits `/` — if logged in, redirected to their dashboard by role
2. New users register at `/register` — students register freely, admins need the `ADMIN_INVITE_CODE`
3. Passwords are hashed with bcrypt (12 rounds) before storing
4. Login at `/login` validates credentials and creates a signed JWT via NextAuth
5. The JWT stores the user's `id` and `role`
6. Middleware checks the JWT on every request to protected routes and redirects accordingly

### Admin Flow

```
Login → /admin/dashboard
  → Create test (/admin/tests/new)
      → Fill title, subject, course, duration → Save
  → Edit test (/admin/tests/[testId]/edit)
      → Add MCQ questions with 4 options (mark correct one)
      → Add subjective questions with keywords for scoring
  → Publish test (toggle from dashboard)
  → View results (/admin/tests/[testId]/results)
      → See all student attempts with scores
      → Click any attempt for full detail view
```

### Student Flow

```
Login → /dashboard
  → Browse published tests (filter by subject/course/search)
  → Click "Start Test" → /tests/[testId]/start
      → See test info (duration, question count)
      → Click "Start" → creates attempt in DB
  → Take test (/tests/[testId]/attempt/[attemptId])
      → Countdown timer (server-synced)
      → Navigate questions via sidebar
      → Answer MCQ by clicking options
      → Answer subjective by typing in text area
      → Answers auto-save every 30 seconds
      → Submit manually or timer auto-submits
  → View results (/tests/[testId]/results/[attemptId])
      → See total score
      → See per-question breakdown
      → MCQ: correct answer highlighted, wrong answer marked
      → Subjective: keywords matched shown
```

### Grading Logic

- MCQ: each correct answer = 1 point
- Subjective: score = (number of keywords found in answer) / (total keywords) × 1 point
- Final score = sum of all question scores

---

## npm Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Start dev server | `npm run dev` | Runs Next.js in development mode |
| Build for production | `npm run build` | Generates Prisma client + builds Next.js |
| Start production | `npm run start` | Starts the production server |
| Lint | `npm run lint` | Runs ESLint |
| Run migrations | `npm run db:migrate` | Runs Prisma migrate dev |
| Seed database | `npm run db:seed` | Runs the seed script |
| Open DB GUI | `npm run db:studio` | Opens Prisma Studio at localhost:5555 |

---

## Deployment on Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set the root directory to the project folder
4. Add all environment variables in Vercel project Settings → Environment Variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Vercel app URL)
   - `ADMIN_INVITE_CODE`
5. Deploy — Vercel automatically runs `prisma generate && next build` on every push

---

## Roadmap

### Completed
- [x] User registration and login with JWT auth
- [x] Role-based access control (Admin / Student)
- [x] Test creation with MCQ and subjective questions
- [x] Timed test attempts with autosave every 30 seconds
- [x] Auto-grading for MCQ and keyword scoring for subjective
- [x] Detailed result view for students and admins
- [x] Subject and course filtering on student dashboard
- [x] PostgreSQL database with Prisma ORM
- [x] Deployed on Vercel with Neon PostgreSQL

### Planned
- [ ] Email verification on registration
- [ ] Password reset via email
- [ ] Question bank — reuse questions across multiple tests
- [ ] Bulk question import via CSV file
- [ ] Analytics dashboard — score trends and topic-wise performance charts
- [ ] Student leaderboard per test
- [ ] PDF export of results
- [ ] Negative marking option for MCQ
- [ ] Dark mode toggle
- [ ] Mobile responsive improvements

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
