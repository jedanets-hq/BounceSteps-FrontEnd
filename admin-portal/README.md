# iSafari Admin Portal

Independent admin dashboard for managing the iSafari platform (Traveller & Service Provider systems).

## Features

- **Dashboard**: Real-time statistics and activity monitoring
- **User Management**: Manage travelers and service providers
  - View all users with advanced filtering
  - Suspend/restore user accounts
  - View user activity and bookings
- **Provider Management**: 
  - Verify/unverify service providers
  - Single badge system (one badge per provider)
  - Badge types: Verified, Premium, Top Rated, Eco Friendly, Local Expert
- **Payment Management**:
  - View all transactions
  - Process refunds
  - Financial statistics and reports
- **Settings**: Admin account management

## Tech Stack

- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS
- Lucide React (icons)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your backend URL:
```
VITE_API_URL=http://localhost:5000
```

4. Run database migration (from backend folder):
```bash
psql -U postgres -d isafari_db -f migrations/create_admin_tables.sql
```

5. Start development server:
```bash
npm run dev
```

The admin portal will run on `http://localhost:5176`

## Default Admin Credentials

- **Email**: admin@isafari.com
- **Password**: Admin@123

**⚠️ IMPORTANT**: Change the default password immediately after first login!

## Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

## Deployment

The admin portal is completely independent and can be deployed separately:

- **Netlify**: Connect to your repo and set build command to `npm run build`
- **Vercel**: Import project and deploy
- **Custom Server**: Serve the `dist/` folder with any static file server

## API Integration

The admin portal communicates with the backend via REST API:

- Base URL: `/api/admin`
- Authentication: JWT tokens in Authorization header
- All routes require admin authentication

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Audit logging for all admin actions
- Session timeout (8 hours)
- Password change functionality

## Badge System Rules

- Each provider can have **ONLY ONE** badge at a time
- Assigning a new badge automatically removes the old one
- Badge is independent from identity verification
- A provider can be verified without a badge
- A provider can have a badge without being verified

## Architecture

- **Standalone Frontend**: Runs on separate port (5176)
- **Shared Backend**: Uses existing backend with admin-specific routes
- **No Code Coupling**: Communicates only via API
- **Independent Deployment**: Can be deployed separately from main apps

## Development

- Port: 5176 (to avoid conflicts with main app on 5173)
- Hot reload enabled
- API proxy configured for development

## Support

For issues or questions, contact the development team.
