#!/bin/bash

set -e

echo "━━━ TaskEcho Health Check ━━━"
echo ""

BACKEND_URL="http://localhost:8080/tasks"
FRONTEND_URL="http://localhost:3000"

# Backend health check
echo "Checking backend (localhost:8080)..."
if curl -s "$BACKEND_URL" > /dev/null 2>&1; then
  echo "✓ Backend is healthy"
  TASKS=$(curl -s "$BACKEND_URL" | wc -l)
  echo "  Tasks in store: $TASKS lines"
else
  echo "✗ Backend is not responding"
  echo "  Try: cd backend && mvn spring-boot:run"
  exit 1
fi

echo ""

# Frontend health check
echo "Checking frontend (localhost:3000)..."
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
  echo "✓ Frontend is healthy"
else
  echo "✗ Frontend is not responding"
  echo "  Try: cd frontend && npm run dev"
  exit 1
fi

echo ""
echo "━━━ All systems operational ━━━"
