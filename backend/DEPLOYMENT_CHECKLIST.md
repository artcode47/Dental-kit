# Fly.io Deployment Checklist

Use this checklist to ensure your backend is ready for deployment on Fly.io.

## Pre-Deployment Checklist

### ✅ 1. Fly CLI Setup
- [ ] Fly CLI installed (`fly version`)
- [ ] Logged in to Fly.io (`fly auth whoami`)
- [ ] Have access to the target Fly.io account

### ✅ 2. Project Structure
- [ ] `package.json` exists with correct scripts
- [ ] `fly.toml` configuration file exists
- [ ] `Dockerfile` exists and is optimized
- [ ] `.gitignore` excludes sensitive files
- [ ] `node_modules` is not committed to git

### ✅ 3. Dependencies
- [ ] All production dependencies listed in `package.json`
- [ ] No dev dependencies in production build
- [ ] All required services configured (Firebase, Cloudinary, etc.)

### ✅ 4. Environment Variables
- [ ] `env.example` file updated with all required variables
- [ ] All secrets ready for Fly.io secrets
- [ ] No hardcoded secrets in code
- [ ] Environment-specific configurations set

### ✅ 5. Security
- [ ] Running as non-root user in Docker
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation in place

### ✅ 6. Health Checks
- [ ] Health check endpoint implemented (`/health`)
- [ ] Health check configured in `fly.toml`
- [ ] Dockerfile health check configured

### ✅ 7. Logging
- [ ] Logging configured for production
- [ ] Log files directory created
- [ ] Log rotation configured

## Deployment Steps

### Step 1: Initial Setup
```cmd
cd backend
fly auth login
```

### Step 2: Deploy Application
```cmd
deploy-fly.cmd
```

### Step 3: Set Environment Variables
Follow the `ENV_SETUP_GUIDE.md` to set all required secrets.

### Step 4: Verify Deployment
```cmd
fly status
fly logs
fly open
```

## Post-Deployment Verification

### ✅ 1. Application Status
- [ ] App is running (`fly status`)
- [ ] Health check passes (`fly open`)
- [ ] No errors in logs (`fly logs`)

### ✅ 2. Environment Variables
- [ ] All secrets set (`fly secrets list`)
- [ ] App can access all required services
- [ ] No missing environment variables

### ✅ 3. API Endpoints
- [ ] Health endpoint responds (`/health`)
- [ ] API endpoints accessible
- [ ] Authentication working
- [ ] Database connections working

### ✅ 4. External Services
- [ ] Firebase connection working
- [ ] Cloudinary uploads working
- [ ] Email sending working
- [ ] Push notifications working

### ✅ 5. Performance
- [ ] Response times acceptable
- [ ] Memory usage within limits
- [ ] CPU usage normal
- [ ] No memory leaks

## Troubleshooting Common Issues

### Issue: App won't start
**Solution:**
```cmd
fly logs
fly ssh console
```

### Issue: Environment variables not loaded
**Solution:**
```cmd
fly secrets list
fly apps restart
```

### Issue: Health check failing
**Solution:**
- Check if `/health` endpoint exists
- Verify port 5000 is exposed
- Check logs for errors

### Issue: Database connection failed
**Solution:**
- Verify database credentials
- Check network connectivity
- Ensure database allows connections from Fly.io

### Issue: External service errors
**Solution:**
- Verify API keys and credentials
- Check service quotas and limits
- Verify CORS settings

## Monitoring and Maintenance

### Daily
- [ ] Check app status (`fly status`)
- [ ] Review logs for errors (`fly logs`)
- [ ] Monitor resource usage

### Weekly
- [ ] Review performance metrics
- [ ] Check for security updates
- [ ] Backup important data

### Monthly
- [ ] Review and rotate secrets
- [ ] Update dependencies
- [ ] Review and optimize costs

## Cost Optimization

- [ ] Auto-stop enabled (configured in `fly.toml`)
- [ ] Appropriate machine size selected
- [ ] Monitoring resource usage
- [ ] Cleaning up unused resources

## Security Checklist

- [ ] All secrets stored in Fly secrets
- [ ] No sensitive data in code
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation in place
- [ ] Regular security updates

## Backup and Recovery

- [ ] Database backups configured
- [ ] Important data backed up
- [ ] Recovery procedures documented
- [ ] Disaster recovery plan in place

---

## Quick Commands Reference

```cmd
# Deploy
deploy-fly.cmd

# Check status
fly status

# View logs
fly logs

# Open app
fly open

# Set secret
fly secrets set KEY=VALUE

# List secrets
fly secrets list

# Restart app
fly apps restart

# Scale app
fly scale count 1

# SSH into machine
fly ssh console

# Destroy app (if needed)
fly apps destroy dental-website-backend
```

## Support

If you encounter issues not covered in this checklist:

1. Check Fly.io documentation: https://fly.io/docs/
2. Review application logs: `fly logs`
3. Check Fly.io status page
4. Contact Fly.io support if needed
