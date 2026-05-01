#!/bin/bash

# Liveness check — exit 0 if healthy, 1 if unhealthy
# Used for Docker health checks, systemd watchdog, etc.

BACKEND_HEALTHY=false
FRONTEND_HEALTHY=false

# Backend
if curl -s -f http://localhost:8080/tasks > /dev/null 2>&1; then
  BACKEND_HEALTHY=true
fi

# Frontend
if curl -s -f http://localhost:3000 > /dev/null 2>&1; then
  FRONTEND_HEALTHY=true
fi

# Both must be healthy
if [ "$BACKEND_HEALTHY" = true ] && [ "$FRONTEND_HEALTHY" = true ]; then
  exit 0
else
  [ "$BACKEND_HEALTHY" = false ] && echo "Backend down"
  [ "$FRONTEND_HEALTHY" = false ] && echo "Frontend down"
  exit 1
fi
