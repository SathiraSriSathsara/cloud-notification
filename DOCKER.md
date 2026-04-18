# Docker & Deployment Guide

## Building and Running with Docker

### Prerequisites
- Docker and Docker Compose installed
- `firebase-key.json` file in your project root (not committed to git)
- `.env` file configured with your credentials

### Local Development

1. **Create environment file:**
```bash
cp .env.docker .env
```

2. **Add your credentials to `.env`:**
```env
REDIS_PASSWORD=your-secure-password
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email@iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

3. **Start services:**
```bash
docker-compose up -d
```

4. **View logs:**
```bash
docker-compose logs -f app
```

5. **Stop services:**
```bash
docker-compose down
```

### Using Firebase Key File (Optional)

If you prefer to use `firebase-key.json` instead of environment variables:

1. **Place `firebase-key.json` in project root** (it's in .gitignore)

2. **Uncomment the volume mount** in `docker-compose.yml`:
```yaml
volumes:
  - ./firebase-key.json:/app/firebase-key.json:ro
```

3. **Update your Firebase config** to read from file path

### Manual Docker Build

```bash
# Build the image
docker build -t cloud-notification:latest .

# Run with environment file
docker run -p 4000:4000 --env-file .env cloud-notification:latest

# Run with Redis
docker network create notification-net
docker run -d --name redis --network notification-net redis:7-alpine
docker run -p 4000:4000 --env-file .env --network notification-net -e REDIS_HOST=redis cloud-notification:latest
```

### GitHub Actions CI/CD

The workflow (`.github/workflows/docker-build.yml`) automatically:

- ✅ Builds Docker image on push to `main` or `develop`
- ✅ Publishes to GitHub Container Registry (GHCR)
- ✅ Scans for vulnerabilities with Trivy
- ✅ Creates semantic version tags

**Note:** Ensure `.env` and `firebase-key.json` are in `.gitignore` (already configured)

### Production Deployment

#### Option 1: Docker Compose (Simple Servers)
```bash
git clone <your-repo>
cd cloud-notification
cp .env.docker .env
# Edit .env with production credentials
docker-compose -f docker-compose.yml up -d
```

#### Option 2: Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: firebase-credentials
type: Opaque
stringData:
  firebase-key.json: |
    {
      "type": "service_account",
      ...
    }
```

#### Option 3: GitHub Secrets + Docker Registry

1. **Add GitHub repository secrets:**
   - `REDIS_PASSWORD`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

2. **Update workflow to pass secrets:**
```yaml
env:
  REDIS_PASSWORD: ${{ secrets.REDIS_PASSWORD }}
  FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
  FIREBASE_CLIENT_EMAIL: ${{ secrets.FIREBASE_CLIENT_EMAIL }}
  FIREBASE_PRIVATE_KEY: ${{ secrets.FIREBASE_PRIVATE_KEY }}
```

### Pulling Images from GHCR

```bash
# Login to GitHub Container Registry
docker login ghcr.io -u <username>

# Pull image
docker pull ghcr.io/sathirasrisathsara/cloud-notification:latest

# Run
docker run -p 4000:4000 --env-file .env ghcr.io/sathirasrisathsara/cloud-notification:latest
```

### Health Checks

The container includes a health check endpoint:
```bash
curl http://localhost:4000/notifications
```

Monitor health in Docker:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Troubleshooting

**Build fails: "firebase-key.json not found"**
- ✅ Fixed in the latest Dockerfile
- Remove COPY firebase-key.json from build
- Mount at runtime via docker-compose volume

**Redis connection refused**
- Check Redis is running: `docker ps`
- Verify `REDIS_HOST=redis` (for docker-compose) or correct IP
- Ensure password matches in `.env`

**Container exits immediately**
- Check logs: `docker logs cloud-notification-app`
- Verify all environment variables are set
- Ensure `node_modules` are properly installed

### Useful Commands

```bash
# View all containers
docker-compose ps

# Execute command in running container
docker-compose exec app npm list

# Rebuild without cache
docker-compose up --build --no-cache

# Remove volumes and restart fresh
docker-compose down -v && docker-compose up -d

# View image layers
docker history cloud-notification:latest

# Check image size
docker images cloud-notification
```

### Security Best Practices

✅ **Implemented:**
- Multi-stage build to reduce image size
- Alpine Linux base image (minimal surface area)
- Non-root container option available
- Secrets not stored in Dockerfile
- Health checks configured
- `.dockerignore` excludes unnecessary files

⚠️ **Recommended:**
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Scan images regularly with Trivy
- Keep base images updated (`docker pull node:18-alpine`)
- Set resource limits in docker-compose
- Run containers with read-only filesystem where possible
