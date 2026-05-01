# TaskEcho

A monorepo containing the backend and frontend for the TaskEcho application.

- **Backend** — Spring Boot (Java 21), in-memory storage, REST API on port `8080`
- **Frontend** — Next.js 14 (App Router, TypeScript), runs on port `3000`

## Project Structure

```
TaskEcho/
├── backend/     # Spring Boot REST API
├── frontend/    # Next.js App Router UI
└── README.md
```

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | 3.9+ (or use the `mvnw` wrapper) |
| Node.js | 20+ |
| npm | 10+ |

Verify your versions:

```bash
java -version
mvn -version       # or ./backend/mvnw -version
node -version
npm -version
```

## Running the Backend

```bash
cd backend

# Using Maven wrapper (no local Maven required)
./mvnw spring-boot:run

# Or with a locally installed Maven
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

**First-run note:** Maven will download dependencies on the first run — this may take a minute.

### Verify it's running

```bash
curl http://localhost:8080/tasks
# Expected: []
```

## Running the Frontend

Open a **new terminal** (keep the backend running):

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm run dev
```

The UI opens at `http://localhost:3000`.

## Running Both Together

```
Terminal 1                        Terminal 2
─────────────────────────────     ─────────────────────────────
cd backend                        cd frontend
./mvnw spring-boot:run            npm install && npm run dev
→ http://localhost:8080           → http://localhost:3000
```

Once both are running, open `http://localhost:3000` in your browser. Tasks you add in the UI are sent to the backend and persist for the lifetime of the backend process.

## API Reference

### Create a task

```bash
curl -s -X POST http://localhost:8080/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task"}' | jq
```

```json
{
  "id": "a1b2c3...",
  "title": "My first task",
  "status": "PENDING",
  "createdAt": "2026-05-01T10:00:00Z",
  "completedAt": null,
  "completionNote": null
}
```

### List all tasks

```bash
curl -s http://localhost:8080/tasks | jq
```

## Troubleshooting

**Port already in use (8080)**
```bash
# Find and kill the process occupying 8080
# macOS / Linux
lsof -ti :8080 | xargs kill

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process
```

**Port already in use (3000)**
```bash
# Next.js will automatically try 3001, 3002, etc.
# Or specify a port explicitly:
npm run dev -- -p 3001
```

**CORS errors in browser**
Ensure the backend is running before opening the frontend. The backend allows requests from `http://localhost:3000` only.

**`mvnw: Permission denied` (macOS / Linux)**
```bash
chmod +x backend/mvnw
```

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request
