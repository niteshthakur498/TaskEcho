#!/bin/bash

echo "━━━ TaskEcho Health Check ━━━"
echo ""

BACKEND_URL="http://localhost:8080/tasks"
FRONTEND_URL="http://localhost:3000"

HEALTHY=true

# Backend health check
echo "Checking backend (localhost:8080)..."
if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
  echo "✓ Backend is healthy"
  TASKS=$(curl -s "$BACKEND_URL" | wc -l)
  echo "  Tasks in store: $TASKS lines"
else
  echo "✗ Backend is not responding"
  echo "  Try: cd backend && mvn spring-boot:run"
  HEALTHY=false
fi

echo ""

# Frontend health check
echo "Checking frontend (localhost:3000)..."
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
  echo "✓ Frontend is healthy"
else
  echo "✗ Frontend is not responding"
  echo "  Try: cd frontend && npm run dev"
  HEALTHY=false
fi

echo ""

if [ "$HEALTHY" = true ]; then
  echo "━━━ All systems operational ━━━"
  exit 0
else
  echo "━━━ Some services are down ━━━"
  exit 1
fi
