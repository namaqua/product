# PIM QA Migration Plan

**Date:** September 21, 2025  
**Target:** Digital Ocean Droplet (QA Server)  
**Objective:** Clean deployment avoiding Mac/Linux build errors

## Service Ports Summary
- **NestJS Backend:** 3010
- **React Admin:** 5173  
- **Docusaurus:** 3000 (default)
- **PostgreSQL:** 5432 (internal), 5433 (Docker exposed)

## Phase 1: Droplet Cleanup
### 1.1 Audit Current State
```bash
# SSH into droplet
ssh root@<droplet-ip>

# Check running containers
docker ps -a
docker images

# Check orphaned volumes
docker volume ls
docker volume ls -qf dangling=true

# Check networks
docker network ls

# Check disk usage
df -h
docker system df
```

### 1.2 Clean Orphaned Resources
```bash
# Stop all containers
docker stop $(docker ps -aq)

# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -a -f

# Remove orphaned volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Full system cleanup (careful - removes everything)
docker system prune -a --volumes -f

# Check space recovered
df -h
```

### 1.3 Backup Existing Data (if needed)
```bash
# Backup PostgreSQL data if exists
docker exec postgres-pim pg_dump -U admin -d pim_db > pim_backup_$(date +%Y%m%d).sql

# Copy to local
scp root@<droplet-ip>:~/pim_backup_*.sql ./backups/
```

## Phase 2: Build Strategy (Avoid Mac/Linux Errors)

### 2.1 Multi-Stage Docker Builds
**Key Strategy:** Build on Linux target platform to avoid architecture mismatches

```dockerfile
# Use Linux-specific base images
FROM --platform=linux/amd64 node:20-alpine AS builder
```

### 2.2 Build Locations
**Option A: Build on Droplet (Recommended)**
- Clone repository on droplet
- Build Docker images directly on target server
- Avoids Mac ARM vs Linux x86 issues

**Option B: Build with BuildKit**
- Use Docker buildx for cross-platform builds
- Build for linux/amd64 specifically
- Push to Docker Hub or registry

## Phase 3: Repository Structure

### 3.1 Create Docker Compose for QA
```yaml
# docker-compose.qa.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres-pim
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: pim_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - pim_network

  backend:
    build:
      context: ./engines
      dockerfile: Dockerfile
      target: production
    container_name: pim-backend
    ports:
      - "3010:3010"
    depends_on:
      - postgres
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
    networks:
      - pim_network

  admin:
    build:
      context: ./admin
      dockerfile: Dockerfile
    container_name: pim-admin
    ports:
      - "5173:5173"
    depends_on:
      - backend
    networks:
      - pim_network

  docs:
    build:
      context: ./documentation
      dockerfile: Dockerfile.dev
    container_name: pim-docs
    ports:
      - "3000:3000"
    networks:
      - pim_network

volumes:
  postgres_data:

networks:
  pim_network:
    driver: bridge
```

## Phase 4: Deployment Process

### 4.1 Preparation on Local Machine
```bash
# Ensure .env files are ready
cp .env.example .env.qa

# Test Docker builds locally with platform flag
docker build --platform linux/amd64 -t pim-backend ./engines
```

### 4.2 Deployment Script
Create deployment script on droplet:
```bash
#!/bin/bash
# deploy.sh

# Pull latest code
git pull origin main

# Stop existing containers
docker-compose -f docker-compose.qa.yml down

# Build with no cache to avoid issues
docker-compose -f docker-compose.qa.yml build --no-cache

# Start services
docker-compose -f docker-compose.qa.yml up -d

# Run migrations
docker exec pim-backend npm run migration:run

# Health check
sleep 10
curl -f http://localhost:3010/health || exit 1
```

## Phase 5: Database Migration

### 5.1 Export from Local
```bash
# From local Docker PostgreSQL
docker exec postgres-pim pg_dump -U admin -d pim_db > pim_export.sql
```

### 5.2 Import to QA
```bash
# Copy to droplet
scp pim_export.sql root@<droplet-ip>:~/

# Import to new PostgreSQL container
docker exec -i postgres-pim psql -U admin -d pim_db < pim_export.sql
```

## Phase 6: Environment Configuration

### 6.1 Backend .env.qa
```env
NODE_ENV=production
PORT=3010
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=<secure-password>
DATABASE_NAME=pim_db
JWT_SECRET=<secure-jwt-secret>
```

### 6.2 Admin .env.qa
```env
VITE_API_URL=http://<droplet-ip>:3010
VITE_APP_ENV=qa
```

## Phase 7: Nginx Configuration (Optional)

### 7.1 Reverse Proxy Setup
```nginx
server {
    listen 80;
    server_name qa.yourpim.com;

    location / {
        proxy_pass http://localhost:5173;
    }

    location /api {
        proxy_pass http://localhost:3010;
    }

    location /docs {
        proxy_pass http://localhost:3000;
    }
}
```

## Phase 8: Monitoring & Health

### 8.1 Health Check Endpoints
- Backend: `http://<ip>:3010/health`
- Admin: `http://<ip>:5173`
- Docs: `http://<ip>:3000`
- DB: `docker exec postgres-pim pg_isready`

### 8.2 Logging
```bash
# View logs
docker-compose -f docker-compose.qa.yml logs -f

# Individual service logs
docker logs pim-backend -f
```

## Critical Considerations

### Avoiding Mac/Linux Build Errors
1. **Always specify platform:** `--platform=linux/amd64`
2. **Use Alpine images** for smaller size and compatibility
3. **Build on target** when possible
4. **Lock dependency versions** in package.json
5. **Use Docker BuildKit:** `export DOCKER_BUILDKIT=1`
6. **Avoid native dependencies** that compile differently

### Security
1. Use environment variables for secrets
2. Configure firewall rules on droplet
3. Use non-root user in Docker containers
4. Enable fail2ban for SSH protection
5. Regular security updates

### Backup Strategy
1. Daily automated PostgreSQL backups
2. Weekly full droplet snapshots
3. Store backups off-site (S3 or Spaces)

## Rollback Plan
```bash
# Quick rollback script
docker-compose -f docker-compose.qa.yml down
docker-compose -f docker-compose.qa.yml up -d --scale backend=0
docker exec postgres-pim psql -U admin -d pim_db < last_known_good.sql
docker-compose -f docker-compose.qa.yml up -d
```

## Next Steps
1. Review and approve this plan
2. Set up SSH keys for droplet access
3. Configure DNS for QA subdomain
4. Create deployment credentials
5. Test deployment process with staging data

---

**Note:** This plan prioritizes stability and avoiding build errors over speed. Building directly on the droplet eliminates most architecture-related issues but requires more deployment time.
