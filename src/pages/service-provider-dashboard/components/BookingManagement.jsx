import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BookingManagement = ({ bookings = [], onUpdateBookingStatus, onDeleteBooking, loading = false }) => {
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length
  };

  const handleBookingAction = async (bookingId, action) => {
    if (!confirm(`Are you sure you want to ${action} this pre-order?`)) {
      return;
    }
    await onUpdateBookingStatus(bookingId, action);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to delete this pre-order? This action cannot be undone.')) {
      return;
    }
    if (onDeleteBooking) {
      await onDeleteBooking(bookingId);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-medium">Pre-Order Management</h3>
        <Button variant="outline" size="sm" onClick={() => alert('Export functionality will be implemented')}>
          <Icon name="Download" size={16} />
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'all'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          All ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'pending'
              ? 'bg-yellow-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          �� Pending ({statusCounts.pending})
        </button>
        <button
          onClick={() => setFilterStatus('confirmed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'confirmed'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          ✅ Confirmed ({statusCounts.confirmed})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'completed'
              ? 'bg-green-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          ✅ Completed ({statusCounts.completed})
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filterStatus === 'cancelled'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          ❌ Rejected ({statusCounts.cancelled})
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading pre-orders...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filterStatus === 'all' ? 'No pre-orders yet' : `No ${filterStatus} pre-orders`}
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-foreground">
                      {`${booking.traveler_first_name || ''} ${booking.traveler_last_name || ''}`.trim() || booking.traveler?.name || 'Unknown Traveler'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status === 'pending' ? '🟡 Pending Review' :
                       booking.status === 'confirmed' ? '✅ Confirmed' :
                       booking.status === 'completed' ? '✅ Completed' :
                       '❌ Rejected'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{booking.service_title || 'Service'}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Travel Date:</span>
                      <p className="font-medium text-foreground">
                        {booking.travel_date ? new Date(booking.travel_date).toLocaleDateString() : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Amount:</span>
                      <p className="font-medium text-foreground">TZS {parseFloat(booking.total_amount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Guests:</span>
                      <p className="font-medium text-foreground">{booking.number_of_guests || 1}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pre-Ordered:</span>
                      <p className="font-medium text-foreground">
                        {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  {booking.special_requests && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <span className="text-xs text-muted-foreground">Special Requests:</span>
                      <p className="text-sm text-foreground mt-1">{booking.special_requests}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-border">
                {booking.status === 'pending' && (
                  <>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleBookingAction(booking.id, 'confirmed')}
                    >
                      <Icon name="Check" size={14} />
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBookingAction(booking.id, 'cancelled')}
                    >
                      <Icon name="X" size={14} />
                      Reject
                    </Button>
                  </>
                )}
                {booking.status === 'confirmed' && (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleBookingAction(booking.id, 'completed')}
                  >
                    <Icon name="CheckCircle" size={14} />
                    Mark as Completed
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteBooking(booking.id)}
                  className="text-error hover:text-error hover:bg-error/10"
                >
                  <Icon name="Trash2" size={14} />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
