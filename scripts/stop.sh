#!/bin/bash

echo "Stopping TaskEcho services..."
echo ""

# Function to kill process on a specific port (cross-platform)
kill_port() {
  local port=$1
  local service=$2

  echo "Stopping $service (port $port)..."

  # Try using lsof (macOS/Linux)
  if command -v lsof &> /dev/null; then
    local pid=$(lsof -ti ":$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
      kill -9 "$pid" 2>/dev/null || true
      sleep 1
      echo "✓ $service stopped"
      return 0
    fi
  fi

  # Try using fuser (Linux)
  if command -v fuser &> /dev/null; then
    fuser -k "$port/tcp" 2>/dev/null || true
    sleep 1
    echo "✓ $service stopped"
    return 0
  fi

  # Try using netstat + taskkill (Windows/Git Bash)
  local pid=$(netstat -ano 2>/dev/null | grep -i "LISTENING" | grep ":$port " | awk '{print $NF}' | head -1)
  if [ -n "$pid" ] && [ "$pid" != "0" ] && [ "$pid" != "PID" ]; then
    echo "  Found process: PID $pid"

    # Try taskkill (escape forward slashes for Git Bash)
    taskkill //F //PID "$pid" 2>/dev/null || taskkill /F /PID "$pid" 2>/dev/null || kill -9 "$pid" 2>/dev/null
    sleep 2

    # Verify it's actually dead
    if netstat -ano 2>/dev/null | grep -i "LISTENING" | grep ":$port " &> /dev/null; then
      echo "⚠ Process still running, retrying..."
      taskkill //F //PID "$pid" 2>/dev/null || true
      sleep 2
    fi

    echo "✓ $service stopped"
    return 0
  fi

  echo "⚠ No process found on port $port (may already be stopped)"
}

# Stop both services
kill_port 8080 "Backend"
kill_port 3000 "Frontend"

echo ""
echo "✓ Cleanup complete"
