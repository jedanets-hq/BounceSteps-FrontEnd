# Quick Start - Admin Portal

## 1. Install Dependencies

```bash
cd admin-portal
npm install
```

## 2. Configure Environment

Create `.env` file:

```bash
VITE_API_URL=http://localhost:5000
```

## 3. Start Development Server

```bash
npm run dev
```

Admin portal itafungua: `http://localhost:3001`

## 4. Login

Use admin credentials:
- Email: admin@isafari.com
- Password: [your admin password]

**Note**: User lazima awe na role ya `admin` kwenye database.

## 5. Build for Production

```bash
npm run build
```

Dist folder: `admin-portal/dist`

## 6. Deploy

### Netlify (Easiest)
1. Drag & drop `dist` folder to Netlify
2. Set `VITE_API_URL` environment variable
3. Done!

### Vercel
1. Import project
2. Set `VITE_API_URL` environment variable
3. Deploy

### Traditional Hosting
1. Upload `dist` folder contents
2. Configure `.htaccess` for SPA routing
3. Done!

## Common Issues

### API calls failing?
- Check `VITE_API_URL` in `.env`
- Make sure backend is running
- Check CORS configuration

### Login not working?
- Verify backend is running
- Check user has `admin` role
- Check browser console for errors

### 404 on page refresh?
- Configure server for SPA routing
- See DEPLOYMENT.md for details

## Need Help?

Check:
- README.md - Full documentation
- DEPLOYMENT.md - Deployment guide
- Browser console - Error messages
- Network tab - API calls
