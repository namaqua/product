# Digital Ocean Deployment Plan for PIM Project

## Executive Summary
This document outlines the deployment strategy for the PIM (Product Information Management) system to Digital Ocean, focusing on **cost-effectiveness** and **simplicity** while maintaining production-ready performance.

**Recommended Approach**: Start with **Option 2 (Droplet-based)** for maximum control and cost savings ($30-40/month), with a clear migration path to App Platform if needed later.

---

## 📊 Deployment Options Comparison

### Option 1: App Platform (Fully Managed) - $60-85/month
**Best for**: Teams wanting minimal DevOps overhead

| Component | Service | Cost/Month | Notes |
|-----------|---------|------------|-------|
| Backend (NestJS) | App Platform - Basic | $12 | 1 instance, 512MB RAM |
| Frontend (React) | App Platform - Static | $3 | CDN included |
| Database | Managed PostgreSQL | $30 | 2GB RAM, HA standby |
| Backups | Included | $0 | Daily automated |
| **Total** | | **$45-60** | Plus bandwidth |

**Pros:**
- Zero server management
- Automatic SSL certificates
- Built-in CI/CD from GitHub
- Auto-scaling available
- Global CDN for frontend

**Cons:**
- Higher cost
- Less control over environment
- Vendor lock-in to App Platform

---

### Option 2: Droplet-based (Self-Managed) - $30-40/month ⭐ RECOMMENDED
**Best for**: Cost-conscious teams with basic DevOps skills

| Component | Service | Cost/Month | Notes |
|-----------|---------|------------|-------|
| App Server | Basic Droplet 2GB | $18 | Both frontend & backend |
| Database | Managed PostgreSQL | $15 | 1GB RAM, single node |
| Backups | Droplet Backups | $3.60 | Weekly automated |
| **Total** | | **$36.60** | Plus bandwidth |

**Pros:**
- Most cost-effective
- Full control over environment
- Easy to scale vertically
- Can add monitoring/observability
- Familiar Docker deployment

**Cons:**
- Requires server management
- Manual SSL setup (via Let's Encrypt)
- Need to configure CI/CD

---

### Option 3: Hybrid Approach - $45-55/month
**Best for**: Balancing convenience and cost

| Component | Service | Cost/Month | Notes |
|-----------|---------|------------|-------|
| Backend | Basic Droplet 2GB | $18 | NestJS + Docker |
| Frontend | App Platform Static | $3 | CDN + auto-deploy |
| Database | Managed PostgreSQL | $15 | 1GB RAM |
| Backups | Automated | $3.60 | Weekly |
| **Total** | | **$39.60** | Plus bandwidth |

---

## 🚀 Recommended Implementation Plan (Option 2)

### Phase 1: Initial Setup (Week 1)

#### 1.1 Digital Ocean Account Setup
```bash
# Sign up and get $200 credit for 60 days
# Use this for testing and initial deployment
```

#### 1.2 Create Infrastructure
```bash
# Create Droplet
Name: pim-app-prod
Region: nyc3 (or closest to users)
Size: Basic / Regular / 2GB RAM / 1 vCPU / 50GB SSD
OS: Ubuntu 24.04 LTS
Options: 
  - Enable backups ($3.60/month)
  - Add SSH keys
  - Enable monitoring (free)

# Create Managed Database
Name: pim-db-prod
Engine: PostgreSQL 15
Plan: Basic / 1GB RAM / 1 vCPU / 10GB storage
Region: Same as droplet (nyc3)
```

#### 1.3 Configure Droplet
```bash
# SSH into droplet
ssh root@<droplet-ip>

# Update system
apt update && apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin -y

# Install Node.js 20 (for PM2)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install nodejs -y
npm install -g pm2

# Install Nginx
apt install nginx certbot python3-certbot-nginx -y

# Install monitoring tools
apt install htop netdata -y

# Create app user
useradd -m -s /bin/bash pimapp
usermod -aG docker pimapp
```

### Phase 2: Application Deployment (Week 1-2)

#### 2.1 Deployment Structure
```
/home/pimapp/
├── app/
│   ├── docker-compose.prod.yml
│   ├── engines/           # Backend build
│   ├── admin/            # Frontend build
│   └── .env.production
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   └── health-check.sh
└── logs/
```

#### 2.2 Docker Compose Production Config
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: pim-backend:latest
    container_name: pim-backend
    restart: always
    ports:
      - "3010:3010"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db-host:25060/pim_prod?sslmode=require
      - JWT_SECRET=${JWT_SECRET}
      - PORT=3010
    volumes:
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3010/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    image: pim-frontend:latest
    container_name: pim-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend
```

#### 2.3 Nginx Configuration
```nginx
# /etc/nginx/sites-available/pim
server {
    listen 80;
    server_name pim.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Media uploads
    location /uploads {
        alias /home/pimapp/app/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Phase 3: Security & SSL (Week 2)

#### 3.1 Firewall Configuration
```bash
# Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

#### 3.2 SSL Certificate
```bash
# Install SSL with Let's Encrypt
certbot --nginx -d pim.yourdomain.com
# Auto-renewal is configured automatically
```

#### 3.3 Database Security
- Use Digital Ocean's trusted sources for database
- Configure connection pooling
- Enable SSL for database connections
- Rotate credentials quarterly

### Phase 4: CI/CD Setup (Week 2-3)

#### 4.1 GitHub Actions Deployment
```yaml
# .github/workflows/deploy.yml
name: Deploy to Digital Ocean

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and Deploy
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DO_HOST }}
          username: ${{ secrets.DO_USER }}
          key: ${{ secrets.DO_SSH_KEY }}
          script: |
            cd /home/pimapp/app
            git pull origin main
            docker-compose -f docker-compose.prod.yml build
            docker-compose -f docker-compose.prod.yml up -d
            pm2 restart all
```

#### 4.2 Deployment Script
```bash
#!/bin/bash
# /home/pimapp/scripts/deploy.sh

echo "Starting deployment..."

# Pull latest code
cd /home/pimapp/app
git pull origin main

# Build containers
docker-compose -f docker-compose.prod.yml build

# Run migrations
docker exec pim-backend npm run migration:run

# Restart services
docker-compose -f docker-compose.prod.yml up -d

# Clear CDN cache if needed
# curl -X DELETE "https://api.digitalocean.com/v2/cdn/endpoints/{id}/cache" \
#   -H "Authorization: Bearer $DO_API_TOKEN"

echo "Deployment complete!"
```

### Phase 5: Monitoring & Backups (Week 3)

#### 5.1 Monitoring Setup
```bash
# Install monitoring stack
docker run -d \
  --name netdata \
  -p 19999:19999 \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --cap-add SYS_PTRACE \
  --security-opt apparmor=unconfined \
  netdata/netdata

# Setup alerts via Digital Ocean monitoring
# Configure alerts for:
# - CPU > 80%
# - Memory > 85%
# - Disk > 80%
# - Database connections > 80%
```

#### 5.2 Backup Strategy
```bash
#!/bin/bash
# /home/pimapp/scripts/backup.sh

# Database backup (managed by DO, but extra backup)
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -U $DB_USER -d pim_prod | gzip > /backup/db-$(date +%Y%m%d).sql.gz

# Application data backup
tar -czf /backup/uploads-$(date +%Y%m%d).tar.gz /home/pimapp/app/uploads

# Sync to Spaces (DO's S3-compatible storage)
s3cmd sync /backup/ s3://pim-backups/

# Keep only last 30 days
find /backup -type f -mtime +30 -delete
```

### Phase 6: Scaling Strategy (Future)

#### 6.1 Vertical Scaling Path
```
Current: Basic 2GB → $18/month
Step 1:  Basic 4GB → $36/month
Step 2:  General Purpose 4GB → $48/month
Step 3:  General Purpose 8GB → $96/month
```

#### 6.2 Horizontal Scaling Path
When you outgrow single server:
1. Add Load Balancer ($12/month)
2. Add second Droplet ($18/month)
3. Upgrade database to HA cluster ($30/month)
4. Consider Kubernetes for orchestration

---

## 💰 Cost Optimization Tips

### Immediate Savings
1. **Use Reserved Droplets**: Up to 30% savings with annual commitment
2. **Bandwidth Pooling**: All droplets share bandwidth allocation
3. **Snapshots vs Backups**: Snapshots are cheaper for non-critical envs
4. **Development Environment**: Use smaller droplets or destroy when not in use

### Long-term Optimization
1. **CDN for Static Assets**: Use Spaces + CDN ($5/month) instead of serving from droplet
2. **Database Read Replicas**: Only when needed ($15/month each)
3. **Spot Instances**: For batch processing and non-critical workloads
4. **Auto-scaling**: Implement only when traffic patterns justify it

---

## 📋 Pre-Launch Checklist

### Essential
- [ ] Domain configured with Digital Ocean DNS
- [ ] SSL certificates installed and auto-renewing
- [ ] Database backups configured and tested
- [ ] Monitoring alerts configured
- [ ] Firewall rules configured
- [ ] SSH key-only authentication
- [ ] Application environment variables secured
- [ ] Health checks implemented
- [ ] Error tracking configured (Sentry free tier)

### Recommended
- [ ] CDN configured for static assets
- [ ] Rate limiting implemented
- [ ] DDoS protection enabled
- [ ] Log rotation configured
- [ ] Database connection pooling optimized
- [ ] Redis cache implemented (if needed)
- [ ] Automated security updates enabled
- [ ] Documentation for team members

---

## 🚨 Disaster Recovery Plan

### Backup Schedule
- **Database**: Daily automated (DO Managed) + weekly manual
- **Application Data**: Daily to Spaces
- **Configuration**: Version controlled in Git
- **Droplet Snapshots**: Weekly

### Recovery Time Objectives
- **RTO**: 2 hours (time to restore service)
- **RPO**: 24 hours (maximum data loss)

### Recovery Procedures
1. **Database Failure**: Restore from DO automated backup (15 min)
2. **Droplet Failure**: Deploy to new droplet from snapshot (30 min)
3. **Region Failure**: Deploy to alternate region from backups (2 hours)

---

## 📞 Support Resources

### Digital Ocean Support
- **Community**: Free - Forums and tutorials
- **Developer Support**: $25/month - 24-hour response
- **Business Support**: $200/month - 4-hour response

### Recommended Approach
- Start with Community support
- Upgrade to Developer support after launch
- Consider Business support at $10k+ MRR

---

## 🎯 Migration Timeline

### Week 1: Setup & Testing
- Day 1-2: Account setup, infrastructure provisioning
- Day 3-4: Application deployment, testing
- Day 5: SSL, domain configuration

### Week 2: Optimization
- Day 1-2: Monitoring setup
- Day 3-4: Backup configuration
- Day 5: Performance tuning

### Week 3: Production Ready
- Day 1-2: Security audit
- Day 3-4: Load testing
- Day 5: Go-live

---

## 📝 Monthly Operating Costs

### Minimum Production Setup
```
Droplet (2GB):        $18.00
Database (1GB):       $15.00
Backups:              $3.60
Domain:               $12.00/year ($1/month)
-----------------------------------
Total:                $36.60/month
```

### Recommended Production Setup
```
Droplet (4GB):        $36.00
Database (2GB HA):    $30.00
Backups:              $7.20
Monitoring:           $0.00 (included)
Spaces + CDN:         $5.00
-----------------------------------
Total:                $78.20/month
```

### Growth Setup (1000+ active users)
```
2x Droplets (4GB):    $72.00
Load Balancer:        $12.00
Database (4GB HA):    $60.00
Backups:              $14.40
Spaces + CDN:         $5.00
-----------------------------------
Total:                $163.40/month
```

---

## ✅ Next Steps

1. **Create Digital Ocean account** and claim $200 credit
2. **Review and approve** this deployment plan
3. **Purchase domain** if not already owned
4. **Schedule deployment** window (recommend weekend)
5. **Prepare deployment assets**:
   - Environment variables
   - SSL certificate details
   - Database migration scripts
   - Docker images

---

## 📚 Additional Resources

- [Digital Ocean Documentation](https://docs.digitalocean.com)
- [DO Community Tutorials](https://www.digitalocean.com/community/tutorials)
- [DO Marketplace](https://marketplace.digitalocean.com) - Pre-configured 1-Click Apps
- [DO API Reference](https://docs.digitalocean.com/reference/api/) - For automation
- [Terraform DO Provider](https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs) - Infrastructure as Code

---

*Document Version: 1.0*  
*Created: September 15, 2025*  
*Last Updated: September 15, 2025*  
*Author: PIM Development Team*

---

## Appendix A: Cost Calculator

Use [Digital Ocean's Pricing Calculator](https://www.digitalocean.com/pricing/calculator) to estimate costs based on your specific needs.

## Appendix B: Alternative Providers Comparison

| Provider | Similar Setup | Cost/Month | Pros | Cons |
|----------|--------------|------------|------|------|
| **Digital Ocean** | Droplet + Managed DB | $36.60 | Simple, developer-friendly | Limited managed services |
| **AWS** | EC2 + RDS | $50-70 | Comprehensive services | Complex pricing |
| **Linode** | Linode + Managed DB | $35-45 | Good performance | Smaller ecosystem |
| **Vultr** | Instance + Managed DB | $30-40 | Slightly cheaper | Less mature platform |
| **Heroku** | Dyno + Postgres | $50-75 | Easiest deployment | Most expensive |

**Conclusion**: Digital Ocean offers the best balance of simplicity, cost, and features for this project.
