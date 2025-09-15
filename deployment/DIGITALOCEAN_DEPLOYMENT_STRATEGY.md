# DigitalOcean Production Deployment Strategy

## 🚀 Overview
Complete deployment guide for PIM system on DigitalOcean using Docker, Nginx, and GitHub Actions.

## 📋 Prerequisites
- DigitalOcean account with API token
- Domain name (optional but recommended)
- GitHub repository (for CI/CD)
- Local Docker and Docker Compose installed

## 🏗️ Architecture

### Recommended Setup: Single Droplet (Initial)
- **Droplet Size**: 4GB RAM / 2 vCPUs ($24/month)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 80GB SSD
- **Region**: Choose closest to your users

### Services Architecture
```
┌─────────────────────────────────────────┐
│          DigitalOcean Droplet           │
├─────────────────────────────────────────┤
│  Nginx (Reverse Proxy + SSL)            │
├─────────────────────────────────────────┤
│  Docker Compose                         │
│  ├── NestJS API (port 3010)            │
│  ├── React Frontend (nginx:alpine)      │
│  ├── PostgreSQL 15                      │
│  ├── Redis                              │
│  └── Elasticsearch (optional)           │
└─────────────────────────────────────────┘
```

## 📦 Deployment Options

### Option 1: Docker Compose on Single Droplet (Recommended for Start)
**Pros:**
- Simple to manage
- Cost-effective ($24-48/month)
- Easy backup and scaling
- All services in one place

**Cons:**
- Single point of failure
- Limited horizontal scaling

### Option 2: Managed Database + App Droplet
**Pros:**
- Automated database backups
- Better reliability
- Easier scaling

**Cons:**
- Higher cost ($15 for DB + $24 for app = $39+/month)
- More complex setup

### Option 3: Kubernetes (Future Growth)
- Use DigitalOcean Kubernetes when you need auto-scaling
- Start at $48/month for cluster + node costs

## 🔧 Step-by-Step Deployment

### Step 1: Create Droplet
```bash
# Using DigitalOcean CLI (doctl)
doctl compute droplet create pim-production \
  --region nyc3 \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --ssh-keys [your-ssh-key-id] \
  --enable-monitoring \
  --enable-backups
```

### Step 2: Initial Server Setup
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Create app user
adduser --disabled-password --gecos "" pimapp
usermod -aG docker pimapp

# Setup firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Install Nginx
apt install nginx certbot python3-certbot-nginx -y
```

### Step 3: Setup Directory Structure
```bash
# As pimapp user
su - pimapp

# Create directories
mkdir -p ~/app
mkdir -p ~/backups
mkdir -p ~/logs
mkdir -p ~/ssl
```

### Step 4: Deploy Application
```bash
# Clone your repository
cd ~/app
git clone https://github.com/yourusername/pim-project.git .

# Copy production environment files
cp .env.production.example .env

# Build and start services
docker compose -f docker-compose.production.yml up -d
```

### Step 5: Configure Nginx
```nginx
# /etc/nginx/sites-available/pim
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL certificates (after certbot)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # File uploads
    client_max_body_size 50M;
}
```

### Step 6: SSL Certificate
```bash
# Get SSL certificate
certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
systemctl enable certbot.timer
```

## 🔐 Security Checklist

### Application Security
- [ ] Change all default passwords
- [ ] Use strong JWT secrets
- [ ] Enable CORS properly
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Enable helmet.js in NestJS

### Server Security
- [ ] Configure UFW firewall
- [ ] Disable root SSH login
- [ ] Use SSH keys only
- [ ] Regular security updates
- [ ] Install fail2ban
- [ ] Configure log rotation

### Database Security
- [ ] Strong passwords
- [ ] Restrict network access
- [ ] Regular backups
- [ ] Encrypted connections

## 📊 Monitoring Setup

### 1. DigitalOcean Monitoring (Free)
```bash
# Already enabled with --enable-monitoring flag
```

### 2. Application Monitoring
```bash
# Install PM2 for Node.js monitoring
npm install -g pm2
pm2 install pm2-logrotate

# Docker stats
docker stats --no-stream
```

### 3. Logging
```bash
# Centralized logging with Docker
docker compose logs -f

# Application logs
tail -f ~/logs/app.log
tail -f ~/logs/error.log
```

## 🔄 Backup Strategy

### Automated Daily Backups
```bash
# Create backup script
cat > ~/backups/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/pimapp/backups"

# Database backup
docker exec postgres-pim pg_dump -U pim_user pim_production > $BACKUP_DIR/db_$DATE.sql

# Compress
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/db_$DATE.sql

# Upload to DigitalOcean Spaces (optional)
# s3cmd put $BACKUP_DIR/backup_$DATE.tar.gz s3://your-space/backups/

# Clean old backups (keep 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +1 -delete
EOF

# Make executable and add to cron
chmod +x ~/backups/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /home/pimapp/backups/backup.sh") | crontab -
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
See `.github/workflows/deploy.yml` for automated deployment

### Manual Deployment
```bash
# SSH to server
ssh pimapp@your-server-ip

# Pull latest code
cd ~/app
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d

# Run migrations
docker compose exec api npm run migration:run
```

## 📈 Scaling Strategy

### Vertical Scaling (Immediate)
```bash
# Resize droplet (requires shutdown)
doctl compute droplet-action resize <droplet-id> --size s-4vcpu-8gb --wait
```

### Horizontal Scaling (Future)
1. **Database**: Move to DigitalOcean Managed PostgreSQL
2. **Cache**: Use DigitalOcean Managed Redis
3. **Files**: Use DigitalOcean Spaces for media
4. **Load Balancer**: Add DigitalOcean Load Balancer
5. **Multiple Droplets**: Run multiple app instances

## 💰 Cost Breakdown

### Minimal Production Setup
- Droplet (2 vCPU, 4GB RAM): $24/month
- Backups: $4.80/month (20% of droplet cost)
- Domain: ~$12/year
- **Total: ~$30/month**

### Recommended Production Setup
- Droplet (4 vCPU, 8GB RAM): $48/month
- Managed Database: $15/month
- Spaces (250GB): $5/month
- Backups: $9.60/month
- **Total: ~$78/month**

### High-Availability Setup
- Load Balancer: $12/month
- 2x App Droplets: $96/month
- Managed Database (HA): $30/month
- Managed Redis: $15/month
- Spaces: $5/month
- **Total: ~$158/month**

## 🛠️ Troubleshooting

### Common Issues
1. **Port conflicts**: Check with `netstat -tulpn`
2. **Memory issues**: Monitor with `free -h` and `docker stats`
3. **Disk space**: Check with `df -h`
4. **Docker issues**: `docker compose logs [service]`
5. **Nginx errors**: `nginx -t` and check `/var/log/nginx/error.log`

### Performance Optimization
- Enable gzip in Nginx
- Use Redis for session storage
- Implement database indexing
- Enable Docker BuildKit
- Use multi-stage Docker builds

## 📝 Environment Variables

### Required for Production
```env
# Application
NODE_ENV=production
APP_URL=https://your-domain.com
API_PORT=3010

# Database
DB_HOST=postgres-pim
DB_PORT=5432
DB_NAME=pim_production
DB_USER=pim_user
DB_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_REFRESH_SECRET=<generate-with-openssl-rand-base64-32>

# Redis
REDIS_HOST=redis-pim
REDIS_PORT=6379

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🎯 Next Steps

1. **Week 1**: Deploy to single droplet with Docker Compose
2. **Week 2**: Setup monitoring and backups
3. **Week 3**: Configure CI/CD pipeline
4. **Month 2**: Evaluate performance and scale if needed
5. **Month 3**: Consider managed services for reliability

## 📚 Resources

- [DigitalOcean Docker Tutorial](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04)
- [Nginx Configuration](https://www.digitalocean.com/community/tools/nginx)
- [SSL with Certbot](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04)
- [DigitalOcean API](https://docs.digitalocean.com/reference/api/)

---
*Created: September 2025 | PIM Production Deployment Guide v1.0*
