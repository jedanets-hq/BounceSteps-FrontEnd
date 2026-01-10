import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActiveBookingCard = ({ booking }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-success bg-success/10';
      case 'pending': return 'text-warning bg-warning/10';
      case 'delayed': return 'text-error bg-error/10';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusIcon = (type) => {
    switch (type) {
      case 'flight': return 'Plane';
      case 'hotel': return 'Building';
      case 'experience': return 'MapPin';
      case 'transport': return 'Car';
      default: return 'Calendar';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={getStatusIcon(booking?.type)} size={20} className="text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-foreground">{booking?.title}</h4>
            <p className="text-sm text-muted-foreground">{booking?.subtitle}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking?.status)}`}>
          {booking?.status}
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Date & Time</span>
          <span className="text-foreground">{booking?.datetime}</span>
        </div>
        
        {booking?.location && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location</span>
            <span className="text-foreground">{booking?.location}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Booking ID</span>
          <span className="text-foreground font-mono">{booking?.bookingId}</span>
        </div>
      </div>
      {booking?.updates && booking?.updates?.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertCircle" size={16} className="text-warning" />
            <span className="text-sm font-medium">Recent Updates</span>
          </div>
          <ul className="space-y-1">
            {booking?.updates?.map((update, index) => (
              <li key={`update-${update.substring(0, 15) || index}`} className="text-xs text-muted-foreground">• {update}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const bookingWindow = window.open('', '_blank', 'width=700,height=600');
            bookingWindow.document.write(`
              <html>
                <head><title>Booking Details - ${booking.title}</title></head>
                <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                  <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #2563eb; margin-bottom: 20px;">${booking.title}</h1>
                    <p style="color: #666; margin-bottom: 20px;">${booking.subtitle}</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                      <h3 style="margin-bottom: 15px;">Booking Information</h3>
                      <p><strong>Status:</strong> <span style="color: ${booking.status === 'confirmed' ? '#22c55e' : '#f59e0b'}; text-transform: capitalize;">${booking.status}</span></p>
                      <p><strong>Date & Time:</strong> ${booking.datetime}</p>
                      <p><strong>Location:</strong> ${booking.location || 'N/A'}</p>
                      <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
                      <p><strong>Type:</strong> ${booking.type}</p>
                    </div>
                    ${booking.updates && booking.updates.length > 0 ? `
                      <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="margin-bottom: 15px;">Recent Updates</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                          ${booking.updates.map(update => `<li style="margin-bottom: 5px;">${update}</li>`).join('')}
                        </ul>
                      </div>
                    ` : ''}
                    <div style="text-align: center; margin-top: 30px;">
                      <button onclick="window.print()" style="background: #2563eb; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print</button>
                      <button onclick="window.close()" style="background: #6b7280; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Close</button>
                    </div>
                  </div>
                </body>
              </html>
            `);
          }}
        >
          <Icon name="Eye" size={16} />
          View
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const phoneNumber = '+255123456789'; // Default support number
            window.open(`tel:${phoneNumber}`);
          }}
        >
          <Icon name="Phone" size={16} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const message = `Hi, I need assistance with my booking ${booking.bookingId} for ${booking.title}. Status: ${booking.status}`;
            window.open(`https://wa.me/255123456789?text=${encodeURIComponent(message)}`);
          }}
        >
          <Icon name="MessageSquare" size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ActiveBookingCard;