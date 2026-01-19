# Admin Portal Deployment Guide

## Quick Start

### 1. Build Admin Portal

```bash
cd admin-portal
npm install
npm run build
```

Hii itatengeneza `dist` folder yenye static files.

### 2. Deploy Options

#### Option A: Netlify (Recommended)

1. Login to [Netlify](https://netlify.com)
2. Click "Add new site" → "Deploy manually"
3. Drag & drop `admin-portal/dist` folder
4. Set environment variables:
   - `VITE_API_URL`: Your backend URL
5. Done! Admin portal iko live

#### Option B: Vercel

1. Login to [Vercel](https://vercel.com)
2. Click "Add New" → "Project"
3. Import `admin-portal` folder
4. Set environment variables:
   - `VITE_API_URL`: Your backend URL
5. Deploy

#### Option C: Traditional Hosting (cPanel, etc)

1. Build: `npm run build`
2. Upload `dist` folder contents to your web server
3. Configure `.htaccess` for React Router:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Environment Configuration

### Development (.env)
```
VITE_API_URL=http://localhost:5000
```

### Production (.env.production)
```
VITE_API_URL=https://your-backend-api.com
```

## Backend Configuration

Hakikisha backend inakubali requests kutoka admin portal domain:

```javascript
// server.js or backend config
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3001',  // Development
    'https://admin.isafari.com',  // Production admin
    'https://isafari.com'  // Main app
  ],
  credentials: true
}));
```

## Custom Domain Setup

### Netlify
1. Go to Domain settings
2. Add custom domain: `admin.isafari.com`
3. Update DNS records as instructed

### Vercel
1. Go to Project Settings → Domains
2. Add domain: `admin.isafari.com`
3. Update DNS records

## Security Checklist

- [ ] Backend API ina proper CORS configuration
- [ ] Admin authentication iko enabled
- [ ] Role-based access control (admin role required)
- [ ] HTTPS enabled (SSL certificate)
- [ ] Environment variables properly set
- [ ] API endpoints protected with JWT

## Troubleshooting

### Issue: API calls failing
**Solution**: Check VITE_API_URL environment variable

### Issue: 404 on page refresh
**Solution**: Configure server for SPA routing (see .htaccess above)

### Issue: CORS errors
**Solution**: Update backend CORS configuration to include admin domain

### Issue: Login not working
**Solution**: 
1. Check backend is running
2. Verify API URL is correct
3. Check browser console for errors
4. Ensure cookies/credentials are enabled

## Monitoring

After deployment, monitor:
- API response times
- Error rates
- User login success rate
- Page load times

## Updates

To update admin portal:

```bash
cd admin-portal
git pull
npm install
npm run build
# Re-deploy dist folder
```

## Support

For issues, check:
1. Browser console for errors
2. Network tab for failed requests
3. Backend logs
4. Environment variables
