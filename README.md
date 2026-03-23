# Testing Platform

A full-stack online testing platform built with Next.js 14, Prisma, PostgreSQL, and NextAuth. It supports two roles — **Admin/Faculty** and **Student/User** — with separate dashboards, test creation, timed attempts, auto-grading, and result viewing.

---

## Live Demo

[https://testingplatform-peach.vercel.app](https://testingplatform-peach.vercel.app)

**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | admin123 |
| Student | user@test.com | user123 |

---

## Features

- JWT-based authentication (NextAuth)
- Role-based access control (Admin / Student)
- Admin can create, edit, publish, and delete tests
- Tests support MCQ (objective) and subjective questions
- Timed test attempts with autosave
- Auto-grading for MCQ; keyword-based scoring for subjective
- Students can view detailed results after submission
- Admin can view all results per test or per student
- Fully deployed on Vercel with Neon PostgreSQL

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | NextAuth.js v4 |
| ORM | Prisma |
| Database | PostgreSQL (Neon) |
| Deployment | Vercel |

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- A PostgreSQL database (local or [Neon](https://neon.tech) free tier)

### Steps

**1. Clone the repository**

```bash
git clone https://github.com/Suhannii/testing_platform-.git
cd testing_platform-
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the root:

```env
DATABASE_URL="your_postgresql_connection_string"
DIRECT_URL="your_postgresql_connection_string"
NEXTAUTH_SECRET="any_random_secret_string"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_INVITE_CODE="HelloAdmin"
```

**4. Run database migrations**

```bash
npx prisma migrate dev --name init
```

**5. Seed the database**

```bash
npx prisma db seed
```

**6. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection string (for migrations) |
| `NEXTAUTH_SECRET` | Secret key for signing JWT tokens |
| `NEXTAUTH_URL` | Base URL of your app |
| `ADMIN_INVITE_CODE` | Secret code required to register as Admin |

---

## Project Structure

```
testing-platform/
├── app/                        # Next.js App Router pages and API routes
│   ├── admin/                  # Admin-only pages
│   │   ├── dashboard/          # Admin dashboard — lists all tests
│   │   ├── results/[attemptId] # View a single student attempt in detail
│   │   └── tests/
│   │       ├── new/            # Create a new test
│   │       └── [testId]/
│   │           ├── edit/       # Edit test and manage questions
│   │           └── results/    # View all results for a specific test
│   ├── api/                    # REST API routes
│   │   ├── admin/
│   │   │   ├── questions/[questionId]/  # Update or delete a question
│   │   │   └── tests/
│   │   │       ├── route.ts            # GET all tests / POST create test
│   │   │       └── [testId]/
│   │   │           ├── route.ts        # GET / PATCH / DELETE a test
│   │   │           ├── publish/        # Toggle publish status
│   │   │           ├── questions/      # Add questions to a test
│   │   │           └── results/        # Get all attempts for a test
│   │   ├── attempts/
│   │   │   ├── route.ts                # POST start a new attempt
│   │   │   └── [attemptId]/
│   │   │       ├── route.ts            # GET attempt data
│   │   │       ├── autosave/           # POST save answers mid-attempt
│   │   │       ├── submit/             # POST submit and grade attempt
│   │   │       └── results/            # GET graded results
│   │   ├── auth/
│   │   │   ├── register/       # POST register a new user
│   │   │   └── [...nextauth]/  # NextAuth handler
│   │   └── tests/
│   │       └── route.ts        # GET published tests for students
│   ├── dashboard/              # Student dashboard — lists available tests
│   ├── login/                  # Login page
│   ├── register/               # Registration page
│   ├── tests/[testId]/
│   │   ├── start/              # Test info and start button
│   │   ├── attempt/[attemptId] # Active test-taking page (timed)
│   │   └── results/[attemptId] # Student result view after submission
│   ├── layout.tsx              # Root layout with session provider
│   ├── page.tsx                # Home page (redirects based on auth)
│   ├── providers.tsx           # SessionProvider wrapper
│   └── globals.css             # Global styles
├── components/
│   ├── AdminSidebar.tsx        # Sidebar navigation for admin pages
│   └── UserNavbar.tsx          # Top navbar for student pages
├── lib/
│   ├── auth.ts                 # NextAuth configuration and callbacks
│   └── prisma.ts               # Prisma client singleton
├── middleware.ts               # Route protection and role-based redirects
├── prisma/
│   ├── schema.prisma           # Database schema (models and relations)
│   ├── seed.ts                 # Seed script with demo users and tests
│   └── migrations/             # Auto-generated migration history
├── types/
│   └── next-auth.d.ts          # TypeScript type extensions for NextAuth session
├── .env                        # Local environment variables (not committed)
├── .env.example                # Template for environment variables
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

---

## Database Schema

```
User
 ├── id, name, email, passwordHash, role (USER | ADMIN)
 ├── tests[]       → tests created by this admin
 └── attempts[]    → test attempts by this student

Test
 ├── id, title, description, subject, course
 ├── durationMinutes, isPublished
 ├── questions[]
 └── attempts[]

Question
 ├── id, type (OBJECTIVE | SUBJECTIVE), text, order, topicTag
 ├── options[]     → MCQ choices (one marked isCorrect)
 └── keywords[]    → keywords for subjective auto-scoring

Attempt
 ├── id, userId, testId, status (IN_PROGRESS | SUBMITTED)
 ├── startedAt, submittedAt, score
 └── answers[]

Answer
 └── selectedOptionId (MCQ) or textAnswer (subjective)
```

---

## npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

---

## How It Works

### Authentication Flow
1. User registers at `/register` — students register freely, admins need the `ADMIN_INVITE_CODE`
2. Passwords are hashed with bcrypt before storing
3. Login at `/login` creates a signed JWT via NextAuth
4. Middleware checks the JWT on every protected route and redirects based on role

### Admin Flow
1. Login → redirected to `/admin/dashboard`
2. Create a test with title, subject, duration
3. Add MCQ or subjective questions
4. Publish the test to make it visible to students
5. View all student attempts and scores from the results page

### Student Flow
1. Login → redirected to `/dashboard`
2. Browse published tests
3. Click a test → see details → click Start
4. Answer questions within the time limit (answers autosave every 30s)
5. Submit → system auto-grades MCQ and scores subjective by keyword matching
6. View detailed results with correct answers and score breakdown

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Set root directory to `testing-platform`
4. Add all environment variables in Vercel project settings
5. Vercel runs `prisma generate && next build` automatically on each push

---

## Roadmap

### Done
- [x] User registration and login
- [x] Role-based access (Admin / Student)
- [x] Test creation with MCQ and subjective questions
- [x] Timed test attempts with autosave
- [x] Auto-grading and keyword scoring
- [x] Result viewing for students and admins
- [x] PostgreSQL + Prisma ORM
- [x] Deployed on Vercel

### Planned
- [ ] Email verification on registration
- [ ] Password reset via email
- [ ] Question bank — reuse questions across tests
- [ ] Bulk question import via CSV
- [ ] Analytics dashboard for admins (score trends, topic-wise performance)
- [ ] Student leaderboard per test
- [ ] PDF export of results
- [ ] Dark mode toggle
- [ ] Mobile app (React Native)

---

## License

MIT License — see [LICENSE](./LICENSE) for details.
