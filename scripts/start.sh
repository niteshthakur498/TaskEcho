#!/bin/bash

set -e

echo "Starting TaskEcho services..."
echo ""

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Start backend
echo "Starting backend..."
cd "$PROJECT_ROOT/backend"
if [ -f "mvnw" ]; then
  ./mvnw spring-boot:run > "$PROJECT_ROOT/.logs/backend.log" 2>&1 &
else
  mvn spring-boot:run > "$PROJECT_ROOT/.logs/backend.log" 2>&1 &
fi
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"

echo ""

# Start frontend
echo "Starting frontend..."
cd "$PROJECT_ROOT/frontend"
npm install > /dev/null 2>&1
npm run dev > "$PROJECT_ROOT/.logs/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "━━━ Services Starting ━━━"
echo "Backend:  http://localhost:8080 (PID: $BACKEND_PID)"
echo "Frontend: http://localhost:3000 (PID: $FRONTEND_PID)"
echo ""
echo "Logs:"
echo "  backend:  .logs/backend.log"
echo "  frontend: .logs/frontend.log"
echo ""
echo "To stop: bash scripts/stop.sh"
