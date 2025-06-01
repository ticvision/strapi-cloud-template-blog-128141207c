# Strapi Migration Guide

This guide outlines everything you need to set up Strapi as a replacement for ButterCMS.

## Part 1: Strapi Setup

### 1. Install and Initialize Strapi

```bash
# Create a new Strapi project
npx create-strapi-app@latest ticvision-cms --quickstart

# Or manually install in existing directory
npm install @strapi/strapi @strapi/plugin-users-permissions
```

### 2. Content Type Configuration

Create these content types in Strapi Admin Panel:

#### **Blog Post Content Type** (`blog-post`)
```javascript
// Collection Type: "blog-post" (API ID: blog-posts)
{
  title: "Text" (Required, Unique),
  slug: "UID" (Target field: title, Required, Unique),
  summary: "Text" (Required),
  body: "Rich Text (Markdown)", // or Blocks if preferred
  seo_title: "Text",
  meta_description: "Text",
  featured_image: "Media (Single Image)",
  published: "DateTime" (Required),
  status: "Enumeration" (published, draft) (Required, Default: draft),
  author: "Relation" (Many-to-One with Author),
  tags: "Relation" (Many-to-Many with Tag)
}
```

#### **Author Content Type** (`author`)
```javascript
// Collection Type: "author" (API ID: authors)
{
  first_name: "Text" (Required),
  last_name: "Text" (Required),
  email: "Email" (Required, Unique),
  bio: "Text (Long text)",
  slug: "UID" (Target field: first_name + last_name, Required, Unique),
  profile_image: "Media (Single Image)"
}
```

#### **Tag Content Type** (`tag`)
```javascript
// Collection Type: "tag" (API ID: tags)
{
  name: "Text" (Required, Unique),
  slug: "UID" (Target field: name, Required, Unique)
}
```

### 3. API Permissions Setup

In **Settings → Roles → Public**:

✅ **blog-posts**: `find`, `findOne`  
✅ **authors**: `find`, `findOne`  
✅ **tags**: `find`, `findOne`  
✅ **upload**: `find` (for media files)

### 4. Sample Data Migration

You'll need to migrate your existing ButterCMS content:

1. **Export from ButterCMS** (use their API or dashboard export)
2. **Import to Strapi** using:
   - Strapi's import/export plugin
   - Custom migration script
   - Manual entry through admin panel

### 5. Environment Configuration

**Strapi `.env` file:**
```bash
# Database (SQLite for development, PostgreSQL/MySQL for production)
DATABASE_CLIENT=sqlite
DATABASE_FILENAME=.tmp/data.db

# Server
HOST=0.0.0.0
PORT=1337

# Admin JWT Secret
ADMIN_JWT_SECRET=your-admin-jwt-secret

# App JWT Secret  
APP_KEYS=your-app-key1,your-app-key2

# API Token (for frontend access - create in Admin Panel)
API_TOKEN_SALT=your-api-token-salt
```

### 6. Hosting Options

**Local Development:**
```bash
npm run develop  # Runs on http://localhost:1337
```

**Production Hosting Options:**
- **Railway** (~$5/month) - Easiest setup
- **Heroku** (~$7/month) - Good documentation
- **DigitalOcean App Platform** (~$12/month) - Reliable
- **AWS/Vercel** - Custom setup required
- **Self-hosted VPS** - Most cost-effective

## Part 2: Frontend Integration

### 1. Environment Variables

Update your `.env`:
```bash
# ButterCMS (keep for gradual migration)
VITE_BUTTER_CMS_API_KEY=your_buttercms_api_key_here

# Strapi Configuration
VITE_STRAPI_URL=http://localhost:1337  # Development
# VITE_STRAPI_URL=https://your-strapi-domain.com  # Production
VITE_STRAPI_TOKEN=  # Optional: API token for private content
```

### 2. New Dependencies

No additional dependencies needed! The Strapi client is included.

### 3. Files Modified

✅ **Created**: `src/lib/strapi.ts` - New API client  
✅ **Updated**: `src/pages/BlogList.tsx` - Import changed to Strapi  
✅ **Updated**: `src/pages/BlogPost.tsx` - Import changed to Strapi  
✅ **Updated**: `scripts/generate-sitemap.js` - Uses Strapi API  
✅ **Updated**: `src/components/Footer.tsx` - Shows "Powered by Strapi"  
✅ **Updated**: `.env` - Added Strapi configuration  

### 4. API Structure Comparison

**ButterCMS Response:**
```javascript
{
  data: {
    data: [
      {
        slug: "post-slug",
        title: "Post Title",
        // ... direct properties
      }
    ]
  }
}
```

**Strapi Response:**
```javascript  
{
  data: [
    {
      id: 1,
      attributes: {
        slug: "post-slug", 
        title: "Post Title",
        // ... nested in attributes
      }
    }
  ]
}
```

The **`transformPost()`** function in `src/lib/strapi.ts` handles this difference automatically.

### 5. Testing the Integration

**Development Testing:**
1. Start Strapi: `npm run develop` (in Strapi directory)
2. Create test content in Strapi Admin Panel
3. Start frontend: `npm run dev`
4. Test blog pages work with Strapi data

**Production Testing:**
1. Deploy Strapi to your chosen hosting
2. Update `VITE_STRAPI_URL` to production URL
3. Test sitemap generation: `npm run generate-sitemap`
4. Deploy frontend with updated environment variables

## Part 3: Migration Strategy

### Option A: Gradual Migration (Recommended)
1. Set up Strapi alongside ButterCMS
2. Import a few test posts to Strapi
3. Test frontend with Strapi locally
4. Gradually migrate content
5. Switch environment variables when ready

### Option B: Complete Switch
1. Export all ButterCMS content
2. Set up Strapi with all content
3. Update environment variables
4. Deploy both Strapi and frontend together

## Part 4: Cost Comparison

**ButterCMS** (Current):
- ~$83/month for Micro plan
- Hosted CMS, limited customization

**Strapi** (New):
- ~$5-12/month hosting (Railway/Heroku)
- Self-hosted, full control
- Potential savings: ~$70/month

## Part 5: Post-Migration

### Content Management
- Access Strapi admin at `https://your-strapi-url.com/admin`
- Create authors, tags, and blog posts
- Use built-in media library for images

### SEO & Performance
- Sitemap automatically generated with Strapi data
- Same SEO structure maintained
- No performance impact on frontend

### Backup Strategy
- Regular database backups (hosting provider)
- Export content periodically via Strapi admin
- Version control for Strapi configuration

## Part 6: Support & Resources

**Strapi Documentation:**
- [Getting Started](https://docs.strapi.io/dev-docs/quick-start)
- [Content Types](https://docs.strapi.io/user-docs/content-types-builder)
- [API Documentation](https://docs.strapi.io/dev-docs/api/rest)

**Frontend Code:**
- All existing UI components remain unchanged
- Only data fetching layer updated
- Same TypeScript interfaces maintained

## Next Steps

1. **Set up local Strapi instance** for testing
2. **Create content types** as specified above
3. **Add sample content** to test integration
4. **Test frontend locally** with new Strapi API
5. **Choose production hosting** for Strapi
6. **Plan content migration** strategy
7. **Deploy and switch over** when ready

The migration maintains 100% UI compatibility while giving you full control over your CMS! 