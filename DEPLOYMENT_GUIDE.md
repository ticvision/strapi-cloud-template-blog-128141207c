# Strapi Deployment Guide

This guide covers deploying your Strapi CMS to production, with **Strapi Cloud** as the recommended hosting solution.

## 🚀 Quick Deploy to Strapi Cloud (Recommended)

### Prerequisites
- GitHub account with your Strapi project
- Strapi Cloud account ([cloud.strapi.io](https://cloud.strapi.io))

### Step 1: Prepare Your Repository
1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Strapi Cloud deployment"
   git push origin main
   ```

2. **Ensure your `.env` is NOT committed** (it should be in `.gitignore`)

### Step 2: Deploy to Strapi Cloud
1. **Login to Strapi Cloud:**
   - Go to [cloud.strapi.io](https://cloud.strapi.io)
   - Sign up/Login with GitHub

2. **Create New Project:**
   - Click "Create Project"
   - Connect your GitHub repository
   - Select the repository containing your Strapi app

3. **Configure Environment Variables:**
   ```bash
   # Required for Strapi Cloud
   APP_KEYS=your-app-key-1,your-app-key-2,your-app-key-3,your-app-key-4
   API_TOKEN_SALT=your-api-token-salt
   ADMIN_JWT_SECRET=your-admin-jwt-secret
   TRANSFER_TOKEN_SALT=your-transfer-token-salt
   JWT_SECRET=your-jwt-secret
   
   # Database (automatically configured by Strapi Cloud)
   DATABASE_CLIENT=postgres
   # DATABASE_* variables are auto-configured
   
   # Optional: File upload (Strapi Cloud includes media storage)
   # These are automatically configured
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (5-10 minutes)
   - Your Strapi admin will be available at `https://your-project.strapi.app/admin`

### Step 3: Set Up Admin User
1. Visit your deployed admin panel
2. Create your first admin user
3. Configure content permissions in Settings → Roles → Public

## 🔧 Alternative Hosting Options

### Option 1: Railway (~$5/month)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Environment Variables for Railway:**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Option 2: Heroku (~$7/month)
```bash
# Install Heroku CLI and deploy
heroku create your-strapi-app
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
git push heroku main
```

### Option 3: DigitalOcean App Platform (~$12/month)
1. Connect GitHub repository
2. Configure build settings:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Add environment variables
4. Deploy

### Option 4: VPS (Most Cost-Effective)
```bash
# On your VPS (Ubuntu/Debian)
sudo apt update
sudo apt install nodejs npm nginx

# Clone and setup
git clone your-repo
cd your-strapi-app
npm install
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "strapi" -- start
pm2 startup
pm2 save
```

## 📁 File Upload Configuration

### Strapi Cloud (Built-in)
File uploads work automatically with Strapi Cloud's integrated media storage.

### AWS S3 (for other hosts)
```bash
npm install @strapi/provider-upload-aws-s3
```

**Environment Variables:**
```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_ACCESS_SECRET=your-secret-key
AWS_REGION=us-east-1
AWS_BUCKET=your-bucket-name
```

**Config (`config/plugins.js`):**
```javascript
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('AWS_ACCESS_KEY_ID'),
        secretAccessKey: env('AWS_ACCESS_SECRET'),
        region: env('AWS_REGION'),
        params: {
          Bucket: env('AWS_BUCKET'),
        },
      },
    },
  },
});
```

## 🗄️ Database Configuration

### Strapi Cloud
PostgreSQL is automatically configured and managed.

### Self-Hosted PostgreSQL
```bash
# Environment Variables
DATABASE_CLIENT=postgres
DATABASE_HOST=127.0.0.1
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-password
DATABASE_SSL=false
```

### Self-Hosted MySQL
```bash
# Environment Variables
DATABASE_CLIENT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=your-secure-password
```

## 🔒 Security Checklist

### Environment Variables
- [ ] Generate strong, unique secrets for production
- [ ] Never commit `.env` files to version control
- [ ] Use different secrets for each environment

### Generate Production Secrets
```bash
# Generate random secrets (run each command separately)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Database Security
- [ ] Use strong database passwords
- [ ] Enable SSL connections for production databases
- [ ] Restrict database access to application servers only

### Server Security
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Regular security updates

## 🔧 Configuration Files

### Production `config/database.js`
```javascript
module.exports = ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT', 'postgres'),
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: env.bool('DATABASE_SSL', false) && {
        key: env('DATABASE_SSL_KEY', undefined),
        cert: env('DATABASE_SSL_CERT', undefined),
        ca: env('DATABASE_SSL_CA', undefined),
        capath: env('DATABASE_SSL_CAPATH', undefined),
        cipher: env('DATABASE_SSL_CIPHER', undefined),
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
      },
    },
    debug: false,
  },
});
```

### Production `config/server.js`
```javascript
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
```

## 📈 Performance Optimization

### Enable Gzip Compression
```javascript
// config/middlewares.js
module.exports = [
  'strapi::compression',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### Database Optimization
- Use connection pooling
- Index frequently queried fields
- Regular database maintenance

## 🔄 CI/CD Pipeline

### GitHub Actions (Auto-deploy to Strapi Cloud)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Strapi Cloud
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Strapi Cloud
        # Strapi Cloud auto-deploys on git push
        run: echo "Deployment triggered automatically"
```

## 📊 Monitoring & Maintenance

### Health Checks
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor database performance
- Track API response times

### Backup Strategy
- **Strapi Cloud**: Automatic backups included
- **Self-hosted**: Set up regular database backups
  ```bash
  # PostgreSQL backup
  pg_dump -h localhost -U strapi strapi > backup_$(date +%Y%m%d).sql
  ```

### Log Management
- Use structured logging
- Set up log aggregation (if self-hosting)
- Monitor error rates

## 🚨 Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify environment variables
3. **File Upload Issues**: Check permissions and storage configuration
4. **Memory Issues**: Increase server resources

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm run develop
```

## 📞 Support

- **Strapi Cloud**: Built-in support dashboard
- **Community**: [Strapi Discord](https://discord.strapi.io)
- **Documentation**: [docs.strapi.io](https://docs.strapi.io)

---

## Quick Commands Reference

```bash
# Development
npm run develop

# Production build
npm run build
npm start

# Generate production secrets
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Database migration
npm run strapi migration:run
```

**🎉 Your Strapi CMS is now ready for production!** 