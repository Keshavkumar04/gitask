<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=30&duration=3500&pause=900&color=8B5CF6&center=true&vCenter=true&width=720&height=80&lines=GitAsk;Chat+with+any+GitHub+repository;AI-powered+codebase+Q%26A" alt="GitAsk" />

### 🧠 Understand any codebase by simply asking questions

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=for-the-badge&logo=trpc&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

<a href="https://gitask-rosy.vercel.app">
  <img src="https://img.shields.io/badge/Live_Demo-gitask--rosy.vercel.app-8B5CF6?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
</a>

</div>

---

## 🧭 Overview

**GitAsk** turns any GitHub repository into something you can have a conversation with. Connect a repo and GitAsk loads and indexes its source code, generating vector embeddings of every file. You can then ask natural-language questions — *"How does authentication work?"*, *"Where is the payment logic?"* — and get accurate answers backed by **citations to the exact files** involved.

It also keeps an AI-summarized log of recent commits, so you can catch up on what changed at a glance.

## ✨ Features

- 🔗 **Connect any GitHub repo** — public or private (via access token)
- 🧠 **AI codebase Q&A** — ask questions, get answers grounded in the real source
- 📑 **Code references** — every answer cites the files it was built from
- 📜 **Commit summaries** — recent commits explained in plain English
- 👥 **Team projects** — invite teammates into a shared project
- 💳 **Credit-based billing** — usage tracked and billed through Stripe
- 🔐 **Authentication** — secure sessions powered by better-auth
- ⚡ **Background indexing** — repo processing runs as Inngest jobs

## ⚙️ How It Works

1. You connect a GitHub repository.
2. **LangChain** loads the repo's files; an **Inngest** job splits and embeds them.
3. Embeddings are stored in **PostgreSQL** (`pgvector`) for semantic search.
4. When you ask a question, the most relevant files are retrieved.
5. **Google Gemini** generates an answer, streamed back with code references.

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| Framework | Next.js (App Router), React, TypeScript |
| API | tRPC, TanStack Query |
| Database | PostgreSQL + `pgvector`, Prisma ORM |
| AI | Google Gemini, Vercel AI SDK, LangChain |
| Jobs | Inngest |
| Auth | better-auth |
| Payments | Stripe |
| UI | Tailwind CSS, Radix UI, shadcn/ui, Lucide |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A PostgreSQL database with the `pgvector` extension
- API keys for: Google Gemini, GitHub, Stripe, Inngest

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Keshavkumar04/gitask.git
cd gitask

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env

# 4. Apply the database schema
npx prisma migrate dev

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file in the project root. The app expects credentials for the services below *(confirm exact key names against the source)*:

```env
DATABASE_URL="postgresql://..."

# Google Gemini
GEMINI_API_KEY=""

# GitHub access (for loading repositories)
GITHUB_TOKEN=""

# better-auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Inngest
INNGEST_EVENT_KEY=""
INNGEST_SIGNING_KEY=""
```

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |

## 📁 Project Structure

```
gitask/
├── app/              # Next.js routes (App Router)
│   ├── (protected)/  # Authenticated pages: dashboard, qa, billing, create
│   └── api/          # Route handlers: auth, trpc, inngest, stripe webhook
├── components/       # UI components (incl. shadcn/ui)
├── lib/              # Gemini, GitHub, Inngest, Stripe, Prisma helpers
├── server/           # tRPC routers
└── prisma/           # Database schema & migrations
```

<div align="center">

---

Built with 💜 by [**Keshav Kumar**](https://github.com/Keshavkumar04)

</div>
