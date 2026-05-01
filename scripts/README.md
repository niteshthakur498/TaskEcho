# TaskEcho Scripts

Utility scripts for development, deployment, and monitoring.

## Available Scripts

### `health-check.sh`

Comprehensive health check of both backend and frontend.

```bash
bash scripts/health-check.sh
```

**Output:**
- ✓/✗ status for each service
- Number of tasks in the store
- Helpful error messages with remediation steps

**Use case:** Verify both services are running and responding correctly.

---

### `liveness.sh`

Simple liveness probe — exits with 0 if healthy, 1 if unhealthy.

```bash
bash scripts/liveness.sh
if [ $? -eq 0 ]; then echo "healthy"; else echo "unhealthy"; fi
```

**Use case:** Docker health checks, systemd watchdog, Kubernetes probes, CI/CD pipelines.

---

### `start.sh`

Starts both backend and frontend in the background.

```bash
bash scripts/start.sh
```

**What it does:**
- Starts backend (`mvn spring-boot:run`)
- Installs frontend deps and starts dev server
- Logs output to `.logs/` directory
- Prints PIDs for manual inspection

**Use case:** One-command local development startup.

---

### `stop.sh`

Stops services running on ports 8080 and 3000.

```bash
bash scripts/stop.sh
```

**How it works:**
- Uses `lsof` (macOS/Linux) to find processes
- Sends `SIGTERM` to cleanup gracefully
- Fallback message if `lsof` unavailable

**Use case:** Clean shutdown of dev services.

---

### `api-test.sh`

Runs integration tests against the backend API.

```bash
bash scripts/api-test.sh
```

**Tests:**
1. Backend is responsive
2. Create a task via POST
3. List tasks via GET
4. Verify created task appears in list

**Use case:** Smoke testing after deployment or during development.

---

## Usage Examples

**Complete workflow:**
```bash
# Start both services
bash scripts/start.sh

# In another terminal, verify they're healthy
bash scripts/health-check.sh

# Test the API
bash scripts/api-test.sh

# When done, stop everything
bash scripts/stop.sh
```

**CI/CD health check:**
```bash
bash scripts/health-check.sh || exit 1
bash scripts/api-test.sh || exit 1
```

**Kubernetes liveness probe:**
```yaml
livenessProbe:
  exec:
    command:
      - bash
      - scripts/liveness.sh
  initialDelaySeconds: 10
  periodSeconds: 30
```

## Notes

- All scripts use `set -e` or equivalent to fail fast on errors
- Paths are relative to project root
- Requires `bash` (not `sh`) for compatibility
- Backend logs go to `.logs/backend.log` (created on demand)
- Frontend logs go to `.logs/frontend.log` (created on demand)
