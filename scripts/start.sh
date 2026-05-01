#!/bin/bash

echo "Starting TaskEcho services..."
echo ""

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Create logs directory
mkdir -p "$PROJECT_ROOT/.logs"

# Start backend
echo "Starting backend on port 8080..."
cd "$PROJECT_ROOT/backend"
if [ -f "mvnw" ]; then
  ./mvnw spring-boot:run > "$PROJECT_ROOT/.logs/backend.log" 2>&1 &
else
  mvn spring-boot:run > "$PROJECT_ROOT/.logs/backend.log" 2>&1 &
fi
echo "✓ Backend started"

echo ""

# Start frontend
echo "Starting frontend on port 3000..."
cd "$PROJECT_ROOT/frontend"
npm run dev > "$PROJECT_ROOT/.logs/frontend.log" 2>&1 &
echo "✓ Frontend started"

echo ""
echo "━━━ Services Starting ━━━"
echo "Backend:  http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "Logs:"
echo "  backend:  $PROJECT_ROOT/.logs/backend.log"
echo "  frontend: $PROJECT_ROOT/.logs/frontend.log"
echo ""
echo "To stop: bash scripts/stop.sh"
