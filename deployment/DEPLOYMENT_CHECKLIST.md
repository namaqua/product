# 📋 Production Deployment Checklist

## Pre-Deployment Requirements
- [ ] DigitalOcean account created
- [ ] Payment method added
- [ ] SSH key generated locally
- [ ] SSH key added to DigitalOcean
- [ ] GitHub repository is up to date
- [ ] All tests passing locally
- [ ] Domain name ready (optional)

## Environment Preparation
- [ ] Created `.env.production` from template
- [ ] Generated all secret keys:
  ```bash
  openssl rand -base64 32  # For each secret
  ```
- [ ] Set strong database password
- [ ] Set Redis password
- [ ] Configured CORS origin
- [ ] Set JWT expiry times
- [ ] Configured email settings (if needed)

## Server Setup
- [ ] Created DigitalOcean droplet
- [ ] Enabled monitoring
- [ ] Enabled automatic backups
- [ ] SSH access verified
- [ ] Firewall configured (UFW)
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] Nginx installed
- [ ] Created non-root user (pimapp)
- [ ] User added to docker group

## Application Deployment
- [ ] Repository cloned to server
- [ ] Environment file uploaded
- [ ] Docker images built
- [ ] Containers started successfully
- [ ] Database migrations run
- [ ] Health check passing
- [ ] Can access API at port 3010
- [ ] Can access frontend at port 3000

## Nginx Configuration
- [ ] Nginx config file created
- [ ] Sites enabled
- [ ] Nginx configuration tested
- [ ] Nginx reloaded
- [ ] Proxy passing working
- [ ] File upload limits set

## SSL/Security
- [ ] SSL certificate obtained (Certbot)
- [ ] HTTPS redirect configured
- [ ] Security headers added
- [ ] Auto-renewal configured
- [ ] Tested SSL configuration

## Database
- [ ] PostgreSQL running
- [ ] Can connect to database
- [ ] Initial data seeded
- [ ] Backup script created
- [ ] Backup cron job added
- [ ] Tested backup/restore

## Monitoring & Logging
- [ ] DigitalOcean monitoring enabled
- [ ] Application logs accessible
- [ ] Error tracking configured
- [ ] Log rotation configured
- [ ] Disk space monitoring
- [ ] Memory usage monitoring

## Testing Production
- [ ] Can register new user
- [ ] Can login
- [ ] Can create product
- [ ] Can upload images
- [ ] Can export data
- [ ] API response times < 500ms
- [ ] Frontend loads < 2 seconds

## Security Hardening
- [ ] Changed all default passwords
- [ ] SSH root login disabled
- [ ] Fail2ban installed
- [ ] Automatic updates enabled
- [ ] Unnecessary ports closed
- [ ] Rate limiting configured
- [ ] CORS properly configured

## Documentation
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Backup procedures documented
- [ ] Recovery procedures documented
- [ ] Admin credentials stored safely
- [ ] Team access configured

## CI/CD Setup (Optional)
- [ ] GitHub Actions secrets added:
  - [ ] DEPLOY_HOST
  - [ ] DEPLOY_USER
  - [ ] DEPLOY_SSH_KEY
  - [ ] DEPLOY_HOST_KEY
  - [ ] PRODUCTION_API_URL
- [ ] Workflow file committed
- [ ] Test deployment run
- [ ] Rollback tested

## Performance Optimization
- [ ] Gzip enabled in Nginx
- [ ] Static assets cached
- [ ] Database indexed properly
- [ ] Redis caching enabled
- [ ] Image optimization configured
- [ ] CDN configured (optional)

## Backup & Recovery
- [ ] Daily backup scheduled
- [ ] Backup retention policy set
- [ ] Backup storage location secured
- [ ] Recovery procedure tested
- [ ] Off-site backup configured (optional)
- [ ] Database dump tested

## DNS & Domain
- [ ] A record pointed to server IP
- [ ] www subdomain configured
- [ ] DNS propagation complete
- [ ] Domain SSL working

## Final Checks
- [ ] All services healthy
- [ ] No errors in logs
- [ ] Memory usage < 80%
- [ ] CPU usage normal
- [ ] Disk space > 20% free
- [ ] All endpoints responding
- [ ] Mobile responsive working
- [ ] Email notifications working

## Post-Deployment
- [ ] Team notified
- [ ] Monitoring alerts configured
- [ ] First day monitoring planned
- [ ] Backup verified next day
- [ ] Performance baseline recorded
- [ ] Documentation updated

## Emergency Preparedness
- [ ] Rollback procedure ready
- [ ] Emergency contacts listed
- [ ] Incident response plan
- [ ] Database recovery tested
- [ ] Support ticket template ready

## Sign-offs
- [ ] Technical lead approval
- [ ] Security review complete
- [ ] Performance acceptable
- [ ] Business owner approval
- [ ] Go-live approved

---

## Quick Health Check Commands

```bash
# Check all services
docker ps

# Check system resources
free -h && df -h

# Check API health
curl http://localhost:3010/health

# Check logs
docker compose logs --tail=50

# Check database connections
docker exec postgres-pim psql -U pim_user -d pim_production -c "SELECT count(*) FROM pg_stat_activity;"

# Check Nginx
sudo nginx -t && sudo systemctl status nginx
```

## Emergency Rollback

```bash
# Stop current deployment
docker compose -f docker-compose.production.yml down

# Restore database backup
docker exec postgres-pim psql -U pim_user -d pim_production < backup.sql

# Start previous version
docker compose -f docker-compose.production.yml up -d

# Verify services
docker ps && curl http://localhost:3010/health
```

---
*Use this checklist for every deployment to ensure consistency and reliability*
