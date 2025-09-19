# Database Maintenance Plan - PIM Project

## 📋 Overview
This document outlines the database backup, recovery, and maintenance procedures for the PIM PostgreSQL database running in Docker.

**Created:** December 2024  
**Database:** PostgreSQL (Docker Container: postgres-pim)  
**Database Name:** pim_dev / pim_prod  
**Backup Script:** `/shell-scripts/db-backup.sh`

---

## 🔒 Backup Strategy

### Backup Types

#### 1. **Full Database Backups**
- **Frequency:** Daily at 2:00 AM (automated)
- **Retention:** 30 days (configurable)
- **Format:** Compressed SQL dump (.sql.gz)
- **Location:** `/backups/database/`

#### 2. **Manual Backups**
- **When:** Before major deployments, schema changes, or data migrations
- **Command:** `./db-backup.sh backup`
- **Purpose:** Safety checkpoint before risky operations

#### 3. **Pre-Restore Backups**
- **When:** Automatically before any restore operation
- **Purpose:** Safety net in case restore fails

#### 4. **Quick Snapshots**
- **When:** Before testing or development work
- **Command:** `./db-backup.sh snapshot`
- **Format:** PostgreSQL custom format (faster, less portable)

---

## 🎯 Implementation Guide

### Initial Setup

1. **Make script executable:**
```bash
chmod +x /Users/colinroets/dev/projects/product/shell-scripts/db-backup.sh
```

2. **Create your first backup:**
```bash
cd /Users/colinroets/dev/projects/product/shell-scripts
./db-backup.sh backup
```

3. **Setup automatic daily backups:**
```bash
./db-backup.sh auto
```

### Daily Operations

#### Morning Checklist
- [ ] Check last backup status: `./db-backup.sh list`
- [ ] Verify backup size is reasonable
- [ ] Check available disk space

#### Before Deployments
```bash
# Create pre-deployment backup
./db-backup.sh backup pre-deployment

# After deployment, verify database
./test-docker-db.sh
```

---

## 📊 Backup Schedule

| Type | Frequency | Time | Retention | Automation |
|------|-----------|------|-----------|------------|
| Full Backup | Daily | 2:00 AM | 30 days | Cron |
| Pre-Deploy | On-demand | Before deploy | 7 days | Manual |
| Snapshot | On-demand | Development | 3 days | Manual |
| Pre-Restore | Automatic | Before restore | 7 days | Automatic |

---

## 🔄 Recovery Procedures

### Restore from Backup

1. **List available backups:**
```bash
./db-backup.sh list
```

2. **Restore specific backup:**
```bash
# Example: Restore from timestamp
./db-backup.sh restore 20241219_143022
```

3. **Restart application:**
```bash
cd /Users/colinroets/dev/projects/product/engines
npm run start:dev
```

### Disaster Recovery Steps

1. **Total database loss:**
```bash
# Start Docker container
docker-compose up -d postgres-pim

# Wait for container to be ready
sleep 5

# Restore latest backup
./db-backup.sh restore $(ls -t /backups/database/*.meta | head -1 | xargs basename | cut -d_ -f4 | cut -d. -f1)
```

2. **Corrupted data:**
```bash
# Create safety backup first
./db-backup.sh backup corrupted-state

# Find last known good backup
./db-backup.sh list

# Restore from good backup
./db-backup.sh restore [timestamp]
```

---

## 🧹 Maintenance Tasks

### Weekly Tasks

1. **Check backup integrity:**
```bash
# View backup statistics
./db-backup.sh stats

# Test restore to temporary database
docker exec postgres-pim createdb test_restore
# Restore to test database
gunzip -c /backups/database/[latest].sql.gz | docker exec -i postgres-pim psql -U pim_user -d test_restore
docker exec postgres-pim dropdb test_restore
```

2. **Clean old backups:**
```bash
# Keep only last 14 days
./db-backup.sh clean 14
```

### Monthly Tasks

1. **Analyze database performance:**
```bash
# Check table sizes
docker exec postgres-pim psql -U pim_user -d pim_dev -c "
  SELECT schemaname, tablename, 
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables 
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

2. **Update table statistics:**
```bash
docker exec postgres-pim psql -U pim_user -d pim_dev -c "ANALYZE;"
```

3. **Check for unused indexes:**
```bash
docker exec postgres-pim psql -U pim_user -d pim_dev -c "
  SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
  ORDER BY schemaname, tablename;"
```

---

## 📈 Monitoring

### Key Metrics to Track

1. **Backup Success Rate**
   - Target: 100%
   - Check: `grep -c "completed successfully" /logs/db-backup.log`

2. **Database Size Growth**
   - Monitor: Weekly
   - Alert if: >20% growth in a week

3. **Backup Size**
   - Normal range: Depends on data volume
   - Alert if: Sudden size changes (>50% difference)

4. **Recovery Time**
   - Test monthly
   - Target: <5 minutes for standard database

### Health Checks

```bash
# Database connection test
./test-docker-db.sh

# Verify all tables present
docker exec postgres-pim psql -U pim_user -d pim_dev -c "\dt"

# Check active connections
docker exec postgres-pim psql -U pim_user -d pim_dev -c "
  SELECT COUNT(*) as connections 
  FROM pg_stat_activity 
  WHERE datname = 'pim_dev';"
```

---

## 🚨 Emergency Contacts & Procedures

### Critical Issues

1. **Backup Failures**
   - Check disk space: `df -h`
   - Check Docker container: `docker ps`
   - Review logs: `tail -100 /logs/db-backup.log`

2. **Cannot Restore**
   - Verify backup file exists and is not corrupted
   - Check PostgreSQL version compatibility
   - Ensure sufficient disk space

3. **Data Corruption**
   - Stop application immediately
   - Create backup of corrupted state
   - Restore from last known good backup
   - Investigate root cause

### Backup Verification Commands

```bash
# Verify backup file integrity
gzip -t /backups/database/[backup-file].sql.gz

# Check backup content (first 100 lines)
gunzip -c /backups/database/[backup-file].sql.gz | head -100

# Count tables in backup
gunzip -c /backups/database/[backup-file].sql.gz | grep "CREATE TABLE" | wc -l
```

---

## 📝 Best Practices

### DO's
- ✅ Test restore procedure monthly
- ✅ Keep 30 days of backups minimum
- ✅ Backup before any schema changes
- ✅ Monitor backup sizes for anomalies
- ✅ Document any restore operations
- ✅ Encrypt backups if containing sensitive data

### DON'Ts
- ❌ Never delete backups without verification
- ❌ Don't skip pre-deployment backups
- ❌ Never restore directly to production without testing
- ❌ Don't ignore backup failure notifications
- ❌ Never store backups only on same server

---

## 🔐 Security Considerations

1. **Backup Encryption** (if needed):
```bash
# Encrypt backup
gzip -c backup.sql | openssl enc -aes-256-cbc -salt -out backup.sql.gz.enc

# Decrypt backup
openssl enc -aes-256-cbc -d -in backup.sql.gz.enc | gunzip > backup.sql
```

2. **Access Control:**
   - Backup directory permissions: 750
   - Only authorized users should have restore access
   - Log all restore operations

3. **Off-site Storage:**
   - Consider syncing to cloud storage (AWS S3, Google Cloud)
   - Keep at least weekly backups off-site

---

## 📅 Maintenance Calendar

| Day | Task | Command |
|-----|------|---------|
| **Daily** | Automatic backup | (Automated via cron) |
| **Monday** | Check backup status | `./db-backup.sh stats` |
| **Wednesday** | Verify last 3 backups | `./db-backup.sh list` |
| **Friday** | Test restore procedure | (Use test database) |
| **1st of Month** | Clean old backups | `./db-backup.sh clean 30` |
| **15th of Month** | Performance analysis | (See monthly tasks) |

---

## 🛠️ Troubleshooting

### Common Issues

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Backup fails | Disk full | Clean old backups or increase disk |
| Backup fails | Container down | `docker-compose up -d postgres-pim` |
| Restore fails | Wrong timestamp | Check exact timestamp with `list` |
| Slow backups | Large database | Consider incremental backups |
| Missing tables | Incomplete backup | Verify backup completed successfully |

---

## 📚 Additional Resources

- **Scripts Location:** `/Users/colinroets/dev/projects/product/shell-scripts/`
- **Backup Location:** `/Users/colinroets/dev/projects/product/backups/database/`
- **Logs Location:** `/Users/colinroets/dev/projects/product/logs/`
- **TypeORM Standards:** `/docs/TYPEORM_STANDARDIZATION_PLAN.md`

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Dec 2024 | Initial database maintenance plan |

---

**Remember:** A backup is only as good as your last successful restore test!