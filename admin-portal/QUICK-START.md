# iSafari Admin Portal - Quick Start Guide

## 🚀 Starting the Admin Portal

### Step 1: Start the Backend

First, make sure the iSafari backend is running:

```bash
cd backend
npm start
```

The backend should be running on `http://localhost:5000`

### Step 2: Open the Admin Portal

You have two options:

#### Option A: Direct File Access
Simply open the `index.html` file in your browser:
```
admin-portal/index.html
```

#### Option B: Local Server (Recommended)
Use a local server for better performance:

**Using Python:**
```bash
cd admin-portal
python -m http.server 8080
```

**Using Node.js:**
```bash
cd admin-portal
npx http-server -p 8080
```

**Using VS Code Live Server:**
- Right-click on `index.html`
- Select "Open with Live Server"

Then open: `http://localhost:8080`

### Step 3: Login

The admin portal uses the same authentication as the main iSafari application.

**Login with existing account:**
- Use any registered user email and password
- For testing, you can use credentials from `CREDENTIALS.txt` in the root folder

**Default test credentials (if available):**
- Email: `admin@isafari.com` or any registered user
- Password: `123456` (or the password you set during registration)

## 📋 Features Available

Once logged in, you can:

✅ **Dashboard**
- View real-time statistics
- Monitor user activity
- Track revenue and bookings
- See system health

✅ **User Management**
- View all users (travelers & providers)
- Verify user accounts
- Suspend or delete users
- Export user data

✅ **Service Management**
- View all services
- Approve/reject pending services
- Edit or delete services
- Monitor service performance

✅ **Booking Management**
- View all bookings
- Cancel bookings
- Track booking status
- Monitor revenue

✅ **Payment Management**
- View all transactions
- Track payment status
- Monitor revenue
- Export financial reports

✅ **Analytics**
- Detailed charts and graphs
- User growth trends
- Revenue analytics
- Service performance

## 🔧 Configuration

### Backend URL
If your backend is running on a different port, update `js/config.js`:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',  // Change port if needed
    // ...
};
```

### CORS Settings
The backend is already configured to allow admin portal access. If you have issues:

1. Check `backend/server.js` CORS configuration
2. Make sure your admin portal URL is in the allowed origins
3. For development, CORS should allow all origins

## 🐛 Troubleshooting

### Issue: Can't login
**Solution:**
- Make sure backend is running (`http://localhost:5000/api/health` should work)
- Check browser console for errors
- Verify credentials are correct

### Issue: Data not loading
**Solution:**
- Open browser DevTools (F12)
- Check Network tab for failed requests
- Verify backend is responding to API calls
- Check console for JavaScript errors

### Issue: Charts not displaying
**Solution:**
- Make sure Chart.js is loaded (check Network tab)
- Refresh the page
- Clear browser cache

### Issue: CORS errors
**Solution:**
- Make sure backend CORS is configured correctly
- Try using a local server instead of opening HTML directly
- Check backend console for CORS-related messages

## 📊 Data Flow

```
Admin Portal (Frontend)
    ↓
    ↓ HTTP Requests
    ↓
Backend API (http://localhost:5000/api)
    ↓
    ↓ MongoDB Queries
    ↓
MongoDB Database
```

## 🔐 Security Notes

- Admin portal uses JWT authentication
- Token is stored in localStorage
- All API requests include Authorization header
- Session expires after 24 hours

## 📱 Browser Compatibility

Tested and working on:
- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari

## 🎯 Next Steps

1. **Explore the Dashboard** - Get familiar with the overview
2. **Check Users** - See all registered users
3. **Review Services** - Approve or manage services
4. **Monitor Bookings** - Track booking activity
5. **View Analytics** - Analyze platform performance

## 📞 Support

For issues or questions:
- Check the main README.md
- Review backend logs for API errors
- Check browser console for frontend errors

## 🔄 Updates

To get the latest updates:
```bash
git pull origin main
```

Then refresh your browser (Ctrl+F5 or Cmd+Shift+R)

---

**Happy Managing! 🎉**
