# 🚀 DigitalOcean Quick Start Guide

## Prerequisites Checklist
- [ ] DigitalOcean account
- [ ] SSH key added to DigitalOcean
- [ ] Domain name (optional)
- [ ] GitHub repository set up

## Step 1: Create Droplet (5 minutes)

### Via DigitalOcean Console:
1. Click "Create" → "Droplets"
2. Choose: Ubuntu 22.04 LTS
3. Select Plan: Basic → Regular → $24/month (4GB RAM, 2 vCPUs)
4. Choose datacenter region closest to your users
5. Add your SSH key
6. Enable: Monitoring & Backups
7. Hostname: `pim-production`
8. Click "Create Droplet"

### Via CLI:
```bash
doctl compute droplet create pim-production \
  --region nyc3 \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --ssh-keys $(doctl compute ssh-key list --format ID --no-header) \
  --enable-monitoring \
  --enable-backups
```

## Step 2: Initial Server Setup (10 minutes)

```bash
# SSH into your droplet (replace with your IP)
ssh root@YOUR_DROPLET_IP

# Run this setup script
bash <(curl -s https://raw.githubusercontent.com/yourusername/pim-project/main/deployment/server-setup.sh)

# Or manually:
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin nginx certbot python3-certbot-nginx -y
adduser --disabled-password --gecos "" pimapp
usermod -aG docker pimapp
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

## Step 3: Deploy Application (15 minutes)

```bash
# Switch to pimapp user
su - pimapp

# Clone repository
cd ~
git clone https://github.com/yourusername/pim-project.git app
cd app

# Setup environment
cp .env.production.example .env
nano .env  # Update with your values

# Generate secrets
echo "JWT_SECRET=$(openssl rand -base64 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)"
echo "REDIS_PASSWORD=$(openssl rand -base64 16)"
echo "DB_PASSWORD=$(openssl rand -base64 16)"

# Start services
docker compose -f docker-compose.production.yml up -d

# Check status
docker ps
docker compose logs -f
```

## Step 4: Configure Nginx (10 minutes)

```bash
# As root user
sudo nano /etc/nginx/sites-available/pim

# Paste this configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3010;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    client_max_body_size 50M;
}

# Enable site
sudo ln -s /etc/nginx/sites-available/pim /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 5: SSL Certificate (5 minutes)

```bash
# Get free SSL certificate
sudo certbot --nginx -d your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 6: Setup Monitoring & Backups (10 minutes)

### Enable DigitalOcean Monitoring:
Already enabled if you used `--enable-monitoring` flag

### Setup Automated Backups:
```bash
# Create backup script
cat > ~/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cd ~/app
docker exec postgres-pim pg_dump -U pim_user pim_production > ~/backups/db_$DATE.sql
tar -czf ~/backups/backup_$DATE.tar.gz ~/backups/db_$DATE.sql ~/app/uploads/
find ~/backups -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x ~/backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /home/pimapp/backup.sh") | crontab -
```

## 🎉 You're Live!

Visit: `http://your-domain.com` or `http://YOUR_DROPLET_IP`

Default login:
- Email: `admin@test.com`
- Password: `Admin123!`

## Quick Commands

### Check Status:
```bash
docker ps
docker compose -f docker-compose.production.yml logs --tail=50
```

### Restart Services:
```bash
docker compose -f docker-compose.production.yml restart
```

### Update Application:
```bash
git pull origin main
docker compose -f docker-compose.production.yml build
docker compose -f docker-compose.production.yml up -d
```

### View Logs:
```bash
# All logs
docker compose logs -f

# Specific service
docker compose logs -f api
docker compose logs -f frontend
```

### Database Access:
```bash
docker exec -it postgres-pim psql -U pim_user -d pim_production
```

## Troubleshooting

### Port Already in Use:
```bash
sudo lsof -i :3010
sudo lsof -i :3000
# Kill process if needed: sudo kill -9 <PID>
```

### Container Won't Start:
```bash
docker compose down
docker system prune -a
docker compose up -d
```

### Database Connection Issues:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# Check logs
docker logs postgres-pim
```

### Nginx Issues:
```bash
# Test configuration
sudo nginx -t
# Check error log
sudo tail -f /var/log/nginx/error.log
```

## Security Hardening

### 1. Firewall Rules:
```bash
# Only allow necessary ports
sudo ufw status
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
```

### 2. Fail2ban:
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

### 3. Automatic Updates:
```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

## Scaling Options

### When to Scale:
- CPU usage consistently > 80%
- Memory usage > 85%
- Response times > 1 second
- 100+ concurrent users

### Vertical Scaling (Easy):
```bash
# Resize droplet via DigitalOcean console
# Or via CLI:
doctl compute droplet-action resize <droplet-id> --size s-4vcpu-8gb --wait
```

### Horizontal Scaling (Advanced):
1. Add DigitalOcean Load Balancer ($12/month)
2. Create second droplet
3. Use managed PostgreSQL ($15/month)
4. Use Spaces for file storage ($5/month)

## Costs Summary

### Minimum Production:
- Droplet (2vCPU, 4GB): $24/month
- Backups: $4.80/month
- **Total: $28.80/month**

### Recommended Production:
- Droplet (4vCPU, 8GB): $48/month
- Managed Database: $15/month
- Backups: $9.60/month
- **Total: $72.60/month**

## Support & Resources

- [DigitalOcean Community](https://www.digitalocean.com/community)
- [Docker Documentation](https://docs.docker.com)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [PostgreSQL Tuning](https://pgtune.leopard.in.ua)

## Emergency Contacts

Create these before going live:
- DigitalOcean Support Ticket
- Database Backup Location
- Application Error Logs Location
- System Administrator Contact

---
*Last Updated: September 2025 | Deployment Time: ~45 minutes*
