# iSafari Admin Portal

Comprehensive admin portal for managing all aspects of the iSafari platform, including users, services, bookings, payments, and system settings.

## 🌟 Features

### User Management
- **All Users**: View and manage all users (travelers and service providers)
- **Travelers**: Dedicated view for traveler management
- **Service Providers**: Manage service provider accounts
- **User Verification**: Approve or reject user verification requests
- **User Actions**: View, edit, suspend, or delete user accounts

### Service Management
- **All Services**: Browse and manage all services
- **Service Approval**: Review and approve/reject pending services
- **Categories**: Manage service categories
- **Destinations**: Manage travel destinations
- **Service Actions**: View, edit, approve, reject, or delete services

### Bookings & Orders
- **All Bookings**: Monitor all booking activities
- **Pre-Orders**: Manage pre-order requests
- **Calendar View**: Visual calendar of all bookings
- **Booking Actions**: View details, cancel, or refund bookings

### Financial Management
- **Payments**: Track all payment transactions
- **Transactions**: Detailed transaction history
- **Revenue**: Revenue analytics and reports
- **Payouts**: Process provider payouts

### Content & Marketing
- **Content Management**: Manage platform content
- **Promotions**: Create and manage promotional campaigns
- **Reviews**: Moderate user reviews
- **Notifications**: Send system notifications

### Support & Monitoring
- **Support Tickets**: Handle customer support requests
- **Feedback**: Review user feedback
- **Activity Logs**: Monitor all system activities
- **Reports**: Handle user reports and complaints

### Analytics & Insights
- **Dashboard**: Real-time overview of key metrics
- **Analytics**: Detailed analytics and trends
- **Charts**: Visual representation of data
- **Reports**: Generate custom reports

### System Management
- **Settings**: Configure system-wide settings
- **Admin Users**: Manage admin accounts and permissions
- **System Health**: Monitor system performance and status

## 🎨 Design Features

### Consistent with iSafari
- **Color Scheme**: Uses iSafari's primary colors (Green #2C5F41, Blue #4A90A4, Amber #D4A574)
- **Typography**: Playfair Display for headings, Inter for body text
- **Components**: Consistent design language with main iSafari application

### Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Animations**: Smooth transitions and micro-interactions
- **Icons**: Font Awesome icons throughout
- **Charts**: Interactive charts using Chart.js

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- iSafari backend API running on `http://localhost:5000`

### Installation

1. **Navigate to admin portal directory**:
   ```bash
   cd admin-portal
   ```

2. **Open in browser**:
   - Simply open `index.html` in your web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8080
     
     # Using Node.js
     npx http-server -p 8080
     ```

3. **Access the portal**:
   - Open `http://localhost:8080` in your browser
   - Default login credentials (if using demo mode):
     - Email: `admin@isafari.com`
     - Password: `admin123`

## 📁 Project Structure

```
admin-portal/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Main styles and layout
│   └── components.css     # Component-specific styles
├── js/
│   ├── config.js          # Configuration and constants
│   ├── api.js             # API communication layer
│   ├── utils.js           # Utility functions
│   ├── components.js      # Reusable UI components
│   ├── app.js             # Main application controller
│   └── pages/
│       ├── dashboard.js   # Dashboard page
│       ├── users.js       # Users management
│       ├── travelers.js   # Travelers view
│       ├── providers.js   # Providers view
│       ├── services.js    # Services management
│       ├── service-approval.js  # Service approval
│       ├── bookings.js    # Bookings management
│       ├── payments.js    # Payments management
│       ├── analytics.js   # Analytics page
│       └── settings.js    # Settings page
└── README.md              # This file
```

## 🔧 Configuration

### API Configuration
Edit `js/config.js` to configure the API endpoint:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api',
    // ... other settings
};
```

### Color Customization
Edit CSS variables in `styles/main.css`:

```css
:root {
    --color-primary: #2C5F41;      /* iSafari Green */
    --color-secondary: #4A90A4;    /* iSafari Blue */
    --color-accent: #D4A574;       /* iSafari Amber */
    /* ... other colors */
}
```

## 🔐 Authentication

The admin portal uses JWT token-based authentication:

1. **Login**: POST to `/api/auth/login` with email and password
2. **Token Storage**: Token stored in localStorage
3. **API Requests**: Token sent in Authorization header
4. **Logout**: Clears token and redirects to login

## 📊 Features in Detail

### Dashboard
- Real-time statistics (users, services, bookings, revenue)
- Multiple charts (revenue trends, booking status, user growth)
- Recent activity feed
- Pending actions overview
- Top performing services and providers
- System health monitoring

### User Management
- Searchable and filterable user list
- User details modal with complete information
- Bulk actions (export, delete)
- User verification workflow
- Activity tracking per user

### Service Management
- Grid and list views
- Category and status filtering
- Service approval workflow
- Image gallery
- Provider information
- Service statistics

### Bookings Management
- Calendar view of bookings
- Status-based filtering
- Booking details with traveler and service info
- Cancel and refund functionality
- Revenue tracking

### Payments & Financial
- Transaction history
- Payment status tracking
- Revenue analytics
- Provider payout management
- Export financial reports

## 🎯 Usage Examples

### Approving a Service
1. Navigate to "Service Approval" in sidebar
2. Review pending service details
3. Click approve or reject button
4. Service status updates automatically

### Managing Users
1. Go to "User Management"
2. Use filters to find specific users
3. Click on user to view details
4. Use action buttons to edit, suspend, or delete

### Viewing Analytics
1. Navigate to "Analytics" or "Dashboard"
2. Select time period from dropdown
3. View charts and statistics
4. Export reports as needed

## 🔄 Integration with iSafari Backend

The admin portal connects to the iSafari backend API. Ensure the following endpoints are available:

### Required Endpoints
- **Authentication**: `/api/auth/login`, `/api/auth/logout`
- **Users**: `/api/admin/users`, `/api/admin/users/:id`
- **Services**: `/api/admin/services`, `/api/admin/services/:id`
- **Bookings**: `/api/admin/bookings`, `/api/admin/bookings/:id`
- **Payments**: `/api/admin/payments`, `/api/admin/transactions`
- **Analytics**: `/api/admin/analytics/dashboard`

See `js/config.js` for complete endpoint list.

## 🛠️ Development

### Adding a New Page

1. **Create page file**: `js/pages/my-page.js`
   ```javascript
   const MyPage = {
       async init() {
           // Initialize page
       },
       destroy() {
           // Cleanup
       }
   };
   ```

2. **Register in app.js**:
   ```javascript
   this.pages = {
       // ... existing pages
       'my-page': MyPage
   };
   ```

3. **Add navigation item** in `index.html`:
   ```html
   <a href="#my-page" class="nav-item" data-page="my-page">
       <i class="fas fa-icon"></i>
       <span>My Page</span>
   </a>
   ```

### Adding a New Component

Add to `js/components.js`:
```javascript
const Components = {
    // ... existing components
    myComponent(data) {
        return `<div class="my-component">${data}</div>`;
    }
};
```

## 📱 Responsive Design

The admin portal is fully responsive:
- **Desktop**: Full sidebar and multi-column layouts
- **Tablet**: Collapsible sidebar, adjusted grids
- **Mobile**: Hidden sidebar (toggle button), single column

## 🎨 Theming

### Light Mode (Default)
- Clean, bright interface
- High contrast for readability

### Dark Mode
- Toggle with theme button in top bar
- Reduced eye strain for night use
- Preference saved in localStorage

## 🔒 Security Features

- JWT token authentication
- Automatic token refresh
- Session timeout
- Role-based access control (RBAC)
- Activity logging
- Secure API communication

## 📈 Performance

- Lazy loading of pages
- Efficient data pagination
- Optimized chart rendering
- Debounced search inputs
- Cached API responses

## 🐛 Troubleshooting

### Common Issues

**Issue**: Can't login
- **Solution**: Ensure backend API is running and accessible

**Issue**: Charts not displaying
- **Solution**: Check that Chart.js is loaded correctly

**Issue**: Styles not loading
- **Solution**: Verify CSS file paths are correct

**Issue**: API errors
- **Solution**: Check browser console for detailed error messages

## 📝 License

This admin portal is part of the iSafari platform.

## 👥 Support

For support or questions:
- Email: support@isafari.com
- Documentation: See main iSafari README

## 🚀 Future Enhancements

- [ ] Real-time notifications with WebSockets
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Custom report builder
- [ ] Email template editor
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Export to PDF
- [ ] Mobile app version

## 📊 Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS Variables
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Inter, Playfair Display)
- **Architecture**: SPA (Single Page Application)

---

**Built with ❤️ for iSafari Global**
