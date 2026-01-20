# Admin Portal Extraction Guide

## Overview

Admin portal sasa iko standalone na imejitenga kabisa na main application. Inaunganishwa na backend tu.

## What Was Done

### 1. Created Standalone Admin Portal

```
admin-portal/
├── src/
│   ├── components/          # All admin components
│   ├── contexts/            # Auth context
│   ├── pages/              # Login & Dashboard
│   ├── styles/             # Tailwind CSS
│   ├── utils/              # API utilities
│   └── main.jsx            # Entry point
├── public/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

### 2. Features

- ✅ Completely independent from main app
- ✅ Own authentication system
- ✅ Own build process
- ✅ Own deployment
- ✅ Connects to backend only
- ✅ Can be deployed separately

## How to Use

### Step 1: Build Admin Portal

```bash
# Option A: Use build script
build-admin.bat

# Option B: Manual
cd admin-portal
npm install
npm run build
```

### Step 2: Remove Admin from Main App (Optional)

```bash
# Run removal script
remove-admin-from-main.bat
```

Then update `src/Routes.jsx` to remove admin route:

```jsx
// Remove this line:
import AdminPortal from './pages/admin-portal';

// Remove this route:
<Route path="/admin" element={<AdminPortal />} />
```

### Step 3: Deploy

#### Main App
```bash
npm run build
# Deploy dist folder to main domain (e.g., isafari.com)
```

#### Admin Portal
```bash
cd admin-portal
npm run build
# Deploy admin-portal/dist to subdomain (e.g., admin.isafari.com)
```

## Development

### Running Both Apps Locally

Terminal 1 - Backend:
```bash
npm run backend
# Runs on http://localhost:5000
```

Terminal 2 - Main App:
```bash
npm run dev
# Runs on http://localhost:3000
```

Terminal 3 - Admin Portal:
```bash
cd admin-portal
npm run dev
# Runs on http://localhost:3001
```

## Deployment Scenarios

### Scenario 1: Same Server, Different Paths

```
https://isafari.com/          → Main App
https://isafari.com/admin/    → Admin Portal
```

Configure web server:
```nginx
location / {
    root /var/www/main-app;
    try_files $uri /index.html;
}

location /admin {
    alias /var/www/admin-portal;
    try_files $uri /index.html;
}
```

### Scenario 2: Different Subdomains (Recommended)

```
https://isafari.com/          → Main App
https://admin.isafari.com/    → Admin Portal
```

Benefits:
- Complete separation
- Independent scaling
- Better security
- Easier to manage

### Scenario 3: Different Domains

```
https://isafari.com/          → Main App
https://admin-isafari.com/    → Admin Portal
```

## Backend Configuration

Update CORS to allow both domains:

```javascript
// server.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',      // Main app dev
    'http://localhost:3001',      // Admin dev
    'https://isafari.com',        // Main app prod
    'https://admin.isafari.com'   // Admin prod
  ],
  credentials: true
}));
```

## Environment Variables

### Main App (.env)
```
VITE_API_URL=http://localhost:5000
```

### Admin Portal (admin-portal/.env)
```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=iSafari Global Admin Portal
```

## Benefits of Separation

1. **Independent Deployment**
   - Update admin without affecting main app
   - Update main app without affecting admin

2. **Better Security**
   - Admin on separate domain
   - Easier to implement IP restrictions
   - Separate authentication

3. **Performance**
   - Smaller bundle sizes
   - Faster builds
   - Independent caching

4. **Scalability**
   - Scale admin separately
   - Different hosting for different needs

5. **Development**
   - Teams can work independently
   - Easier to test
   - Cleaner codebase

## Migration Checklist

- [ ] Build admin portal successfully
- [ ] Test admin portal locally
- [ ] Update backend CORS configuration
- [ ] Deploy admin portal to production
- [ ] Test admin portal in production
- [ ] Remove admin from main app (optional)
- [ ] Update main app routes
- [ ] Deploy main app
- [ ] Update documentation
- [ ] Inform team about new admin URL

## Troubleshooting

### Admin portal won't build
```bash
cd admin-portal
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API calls failing
Check:
1. VITE_API_URL in .env
2. Backend CORS configuration
3. Backend is running
4. Network tab in browser

### Login not working
Check:
1. Backend auth routes
2. JWT configuration
3. Cookie settings
4. CORS credentials

## Quick Commands

```bash
# Build everything
npm run build && cd admin-portal && npm run build

# Start everything (development)
# Terminal 1:
npm run backend

# Terminal 2:
npm run dev

# Terminal 3:
cd admin-portal && npm run dev

# Deploy admin only
cd admin-portal && npm run build
# Upload dist folder

# Deploy main app only
npm run build
# Upload dist folder
```

## Support

Kama una maswali:
1. Check README.md files
2. Check DEPLOYMENT.md
3. Check browser console
4. Check backend logs
