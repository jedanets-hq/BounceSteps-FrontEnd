# iSafari Global - Admin Portal (Standalone)

Admin portal ya iSafari Global imejitenga kabisa na main application. Inaunganishwa na backend tu.

## Features

- User Management (Travelers & Service Providers)
- Service Management & Approvals
- Booking Management
- Payment Management
- Content Management
- Analytics & Reports
- Support Tickets
- Promotions & Marketing
- System Settings

## Installation

```bash
cd admin-portal
npm install
```

## Development

```bash
npm run dev
```

Admin portal itafungua kwenye: `http://localhost:3001`

## Build for Production

```bash
npm run build
```

Build itatengeneza `dist` folder ambayo inaweza ku-deploy independently.

## Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=iSafari Global Admin Portal
```

Kwa production:

```
VITE_API_URL=https://your-backend-url.com
VITE_APP_NAME=iSafari Global Admin Portal
```

## Deployment

### Option 1: Netlify
```bash
npm run build
# Upload dist folder to Netlify
```

### Option 2: Vercel
```bash
npm run build
# Upload dist folder to Vercel
```

### Option 3: Traditional Hosting
```bash
npm run build
# Upload dist folder to your web server
```

## Admin Access

Inabidi user awe na role ya `admin` kwenye database ili aweze kuingia admin portal.

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Lucide Icons
- Axios

## Notes

- Admin portal haina mahusiano na main app
- Inaunganishwa na backend tu kupitia API
- Build yake ni separate na inaweza ku-deploy independently
- Ina authentication yake mwenyewe
