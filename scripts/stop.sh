#!/bin/bash

echo "Stopping TaskEcho services..."
echo ""

# Kill processes listening on ports 8080 and 3000
for port in 8080 3000; do
  echo "Checking port $port..."

  if command -v lsof > /dev/null 2>&1; then
    # macOS / Linux with lsof
    PID=$(lsof -ti ":$port" 2>/dev/null || true)
    if [ -n "$PID" ]; then
      echo "  Killing PID $PID"
      kill "$PID" 2>/dev/null || true
    else
      echo "  Port $port is free"
    fi
  elif command -v netstat > /dev/null 2>&1; then
    # Fallback for systems with netstat
    echo "  Could not determine process (netstat fallback)"
  else
    echo "  Warning: lsof not found, cannot determine process"
  fi
done

echo ""
echo "✓ Cleanup complete"
