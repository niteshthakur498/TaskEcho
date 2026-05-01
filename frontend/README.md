# TaskEcho — Frontend

Minimal Next.js (App Router) frontend for TaskEcho.

## Stack

- [Next.js 14](https://nextjs.org/) — App Router
- React 18
- TypeScript
- No styling libraries — plain inline styles

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
cd frontend
npm install
```

### Run development server

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── layout.tsx   # Root layout (html/body shell)
│       ├── page.tsx     # Main page — task input + list
│       └── types.ts     # Task type definitions
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Notes

- Currently uses **mock data** — no backend calls yet.
- Task types mirror the Spring Boot backend model exactly (`id`, `title`, `status`, `createdAt`, `completedAt`, `completionNote`).
- Backend integration will replace `MOCK_TASKS` with `fetch('/api/tasks')` calls.
