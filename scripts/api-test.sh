#!/bin/bash

set -e

API="http://localhost:8080/tasks"

echo "━━━ TaskEcho API Test ━━━"
echo ""

# Check backend is running
echo "Checking backend..."
if ! curl -s -f "$API" > /dev/null; then
  echo "✗ Backend is not running"
  echo "  Start it: cd backend && mvn spring-boot:run"
  exit 1
fi
echo "✓ Backend is responsive"
echo ""

# Test 1: Create task
echo "Test 1: Create task..."
RESPONSE=$(curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task from API script"}')

TASK_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
if [ -z "$TASK_ID" ]; then
  echo "✗ Failed to create task"
  echo "Response: $RESPONSE"
  exit 1
fi
echo "✓ Created task (ID: $TASK_ID)"
echo ""

# Test 2: List tasks
echo "Test 2: List tasks..."
COUNT=$(curl -s "$API" | grep -o '"id"' | wc -l)
echo "✓ Found $COUNT task(s)"
echo ""

# Test 3: Verify created task is in list
echo "Test 3: Verify task in list..."
if curl -s "$API" | grep -q "$TASK_ID"; then
  echo "✓ Created task appears in list"
else
  echo "✗ Created task not found in list"
  exit 1
fi

echo ""
echo "━━━ All API tests passed ━━━"
