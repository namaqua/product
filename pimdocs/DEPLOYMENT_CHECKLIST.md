# DigitalOcean Deployment Checklist

## Pre-Deployment Checklist
- [ ] Code tested locally
- [ ] Production environment variables prepared
- [ ] Database migrations tested
- [ ] Build process verified (`npm run build`)
- [ ] All secrets removed from code

## DigitalOcean Droplet Setup

### 1. Initial Server Setup
```bash
# Update system
apt update && apt upgrade -y

# Create app user
adduser pim
usermod -aG sudo pim

# Setup firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. Install Required Software
```bash
# Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
apt-get install -y nodejs

# PostgreSQL
apt install postgresql postgresql-contrib

# Nginx
apt install nginx

# PM2
npm install -g pm2

# Git
apt install git
```

### 3. PostgreSQL Production Setup
```bash
# Switch to postgres user
sudo -u postgres psql

# Create production database and user
CREATE DATABASE pim_prod;
CREATE USER pim_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE pim_prod TO pim_user;
\q
```

### 4. Application Deployment
```bash
# Clone repository (adjust as needed)
cd /home/pim
git clone [repository_url] app
cd app

# Install dependencies
npm ci --production

# Setup environment
cp .env.production .env

# Run migrations
npm run migration:run

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Nginx Configuration
Create `/etc/nginx/sites-available/pim`:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6. Enable Site
```bash
ln -s /etc/nginx/sites-available/pim /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 7. SSL Setup (Optional but Recommended)
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your_domain.com
```

## PM2 Ecosystem Configuration
Create `ecosystem.config.js` in project root:
```javascript
module.exports = {
  apps: [{
    name: 'pim',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

## Post-Deployment Checks
- [ ] Application accessible via domain/IP
- [ ] Database connections working
- [ ] Logs being written correctly
- [ ] PM2 auto-restart configured
- [ ] Nginx serving application
- [ ] SSL certificate installed (if applicable)
- [ ] Firewall rules active
- [ ] Backups configured

## Monitoring Commands
```bash
# Check application status
pm2 status
pm2 logs pim

# Check Nginx status
systemctl status nginx

# Check PostgreSQL
systemctl status postgresql

# Monitor server resources
htop

# Check disk usage
df -h
```

## Rollback Plan
```bash
# Stop current deployment
pm2 stop pim

# Restore previous version
cd /home/pim/app
git checkout [previous_tag]
npm ci --production
npm run build

# Restore database if needed
psql -U pim_user pim_prod < backup.sql

# Restart application
pm2 restart pim
```

---
*This checklist ensures smooth deployment from development to production on DigitalOcean*
