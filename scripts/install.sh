#!/bin/bash

set -e

echo "━━━ TaskEcho Install Script ━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Helper functions
check_command() {
  if command -v "$1" &> /dev/null; then
    echo -e "${GREEN}✓${NC} $1 is installed"
    "$1" --version 2>&1 | head -1
    return 0
  else
    echo -e "${RED}✗${NC} $1 is NOT installed"
    return 1
  fi
}

echo "Checking prerequisites..."
echo ""

# Check Java
echo "Java:"
if ! check_command java; then
  echo -e "${YELLOW}  Install from: https://adoptium.net/ (Java 21+)${NC}"
  exit 1
fi
echo ""

# Check Node.js
echo "Node.js:"
if ! check_command node; then
  echo -e "${YELLOW}  Install from: https://nodejs.org/ (Node 20+)${NC}"
  exit 1
fi
echo ""

# Check npm
echo "npm:"
if ! check_command npm; then
  echo -e "${YELLOW}  npm comes with Node.js${NC}"
  exit 1
fi
echo ""

# Check Maven or mvnw
echo "Maven:"
if [ -f "$PROJECT_ROOT/backend/mvnw" ]; then
  echo -e "${GREEN}✓${NC} Maven wrapper (mvnw) found"
  "$PROJECT_ROOT/backend/mvnw" --version 2>&1 | head -2
  MVN_CMD="$PROJECT_ROOT/backend/mvnw"
elif command -v mvn &> /dev/null; then
  echo -e "${GREEN}✓${NC} Maven is installed"
  mvn --version 2>&1 | head -2
  MVN_CMD="mvn"
else
  echo -e "${RED}✗${NC} Maven is NOT installed and mvnw not found"
  echo -e "${YELLOW}  Install from: https://maven.apache.org/install.html (Maven 3.9+)${NC}"
  exit 1
fi
echo ""

echo "━━━ Installing dependencies ━━━"
echo ""

# Backend dependencies
echo "Backend (Maven)..."
cd "$PROJECT_ROOT/backend"
$MVN_CMD clean install -q -DskipTests
echo -e "${GREEN}✓${NC} Backend dependencies installed"
echo ""

# Frontend dependencies
echo "Frontend (npm)..."
cd "$PROJECT_ROOT/frontend"
npm install
echo -e "${GREEN}✓${NC} Frontend dependencies installed"
echo ""

echo "━━━ Installation Complete ━━━"
echo ""
echo "Next steps:"
echo "  1. Start backend: cd backend && mvn spring-boot:run"
echo "  2. Start frontend: cd frontend && npm run dev"
echo ""
echo "Or use the convenience script:"
echo "  bash scripts/start.sh"
