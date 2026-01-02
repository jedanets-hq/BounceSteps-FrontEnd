import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Icon from './AppIcon';
import Button from './ui/Button';
import { API_URL } from '../utils/api';

const TripDetailsModal = ({ trip, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  if (!isOpen || !trip) return null;

  // Check if this is a journey plan (saved from journey planner) or booked trip
  const isJourneyPlan = trip.isJourneyPlan || trip.services;
  
  // For journey plans
  const services = trip.services || [];
  
  // Build location string - handle multiple destinations
  let journeyLocation = '';
  if (trip.isMultiTrip && trip.destinations && trip.destinations.length > 0) {
    // Multiple destinations - show route
    journeyLocation = trip.destinations
      .filter(dest => dest.region)
      .map(dest => {
        const parts = [dest.ward, dest.district, dest.region].filter(Boolean);
        return parts.join(', ');
      })
      .join(' → ');
  } else if (trip.locationString) {
    // Use pre-built location string
    journeyLocation = trip.locationString;
  } else if (trip.area || trip.district || trip.region) {
    // Single destination
    const parts = [trip.area, trip.district, trip.region, trip.country].filter(Boolean);
    journeyLocation = parts.join(', ');
  } else {
    journeyLocation = 'Location not set';
  }
  
  const journeyDates = trip.startDate && trip.endDate ? `${trip.startDate} - ${trip.endDate}` : 'Dates not set';
  const journeyTravelers = trip.travelers || 1;
  const journeyTotalCost = trip.totalCost || 0;
  const journeyStatus = trip.status || 'saved';
  
  // For booked trips
  const hasBookings = trip.bookings && Array.isArray(trip.bookings);
  const bookings = hasBookings ? trip.bookings : [];
  const tripDate = trip.date || trip.dateRange || 'Unknown Date';
  const totalAmount = trip.totalAmount || journeyTotalCost || 0;

  // Handle continue to payment for saved journey plans
  const handleContinueToPayment = () => {
    if (services.length > 0) {
      services.forEach(service => {
        addToCart({
          ...service,
          location: journeyLocation,
          travelers: journeyTravelers,
          journey_details: {
            startDate: trip.startDate,
            endDate: trip.endDate,
            travelers: journeyTravelers
          }
        });
      });
      
      // Update plan status in localStorage
      const savedPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
      const updatedPlans = savedPlans.map(p => 
        p.id === trip.id ? {...p, status: 'pending_payment'} : p
      );
      localStorage.setItem('journey_plans', JSON.stringify(updatedPlans));
      
      onClose();
      navigate('/traveler-dashboard?tab=cart&openPayment=true');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">
              {isJourneyPlan ? 'Journey Plan Details' : 'Trip Details'}
            </h2>
            <p className="text-muted-foreground">
              {isJourneyPlan ? journeyLocation || 'Location not set' : tripDate}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Trip/Journey Summary */}
        <div className="p-6 border-b border-border bg-muted/30">
          {isJourneyPlan ? (
            <>
              {/* Journey Plan Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
                <div>
                  <p className="text-2xl font-bold text-primary">{services.length}</p>
                  <p className="text-sm text-muted-foreground">Services</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">TZS {journeyTotalCost.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{journeyTravelers}</p>
                  <p className="text-sm text-muted-foreground">Travelers</p>
                </div>
                <div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    journeyStatus === 'pending_payment' 
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {journeyStatus === 'pending_payment' ? '💳 Pending Payment' : '✅ Saved'}
                  </span>
                </div>
              </div>
              {/* Journey Dates */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Icon name="Calendar" size={16} />
                <span>{journeyDates}</span>
              </div>
            </>
          ) : (
            /* Booked Trip Summary */
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{bookings.length}</p>
                <p className="text-sm text-muted-foreground">Services</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">TZS {totalAmount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Amount</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          )}
        </div>

        {/* Services List */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center">
            <Icon name="List" size={18} className="mr-2" />
            {isJourneyPlan ? 'Services in this Journey' : 'Services in this Trip'}
          </h3>
          
          {isJourneyPlan ? (
            /* Journey Plan Services */
            services.length > 0 ? (
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={service.id || index} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {service.title || service.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.businessName || service.provider?.name || 'Provider'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Icon name="Tag" size={12} className="mr-1" />
                            {service.category}
                          </span>
                          {service.location && (
                            <span className="flex items-center">
                              <Icon name="MapPin" size={12} className="mr-1" />
                              {service.location}
                            </span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-primary">
                          TZS {(service.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No services in this journey</p>
              </div>
            )
          ) : (
            /* Booked Trip Services */
            bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((booking, index) => (
                  <div key={booking.id || index} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {booking.service_title || booking.service?.title || 'Service'}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {booking.business_name || booking.provider?.businessName || 'Provider'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Icon name="Users" size={12} className="mr-1" />
                            {booking.participants} participant(s)
                          </span>
                          <span className="flex items-center">
                            <Icon name="Calendar" size={12} className="mr-1" />
                            {new Date(booking.booking_date || booking.bookingDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-primary">
                          TZS {(booking.total_price || booking.totalAmount || 0).toLocaleString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs mt-1 ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300'
                        }`}>
                          {booking.status === 'confirmed' ? '✅ Confirmed' : 
                           booking.status === 'pending' ? '🟡 Pending' : 
                           booking.status === 'completed' ? '✔️ Completed' :
                           '❌ Rejected'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Icon name="Package" size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No services in this trip</p>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <div className="flex flex-col gap-4">
            {/* Total Cost Summary */}
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-xl font-bold text-primary">
                  TZS {(isJourneyPlan ? journeyTotalCost : totalAmount).toLocaleString()}
                </p>
              </div>
              
              {/* Multi-destination indicator */}
              {trip.isMultiTrip && trip.destinations && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="text-sm font-medium text-foreground">
                    {trip.destinations.length} destinations
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3 justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              
              {/* Pre-Order Button - for journey plans with services */}
              {isJourneyPlan && services.length > 0 && (
                <Button 
                  variant="secondary"
                  onClick={async () => {
                    const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
                    const token = userData.token;

                    if (!token) {
                      alert('Please login to create pre-orders');
                      onClose();
                      navigate('/login');
                      return;
                    }

                    try {
                      const bookingDate = trip.startDate || new Date().toISOString().split('T')[0];
                      const participants = trip.travelers || 1;
                      
                      let successCount = 0;
                      let failCount = 0;

                      for (const service of services) {
                        try {
                          const response = await fetch(`${API_URL}/bookings`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              serviceId: parseInt(service.id || service.service_id),
                              bookingDate: bookingDate,
                              participants: parseInt(participants)
                            })
                          });

                          const data = await response.json();
                          if (data.success) {
                            successCount++;
                          } else {
                            failCount++;
                          }
                        } catch (error) {
                          failCount++;
                        }
                      }

                      if (successCount > 0) {
                        alert(`✅ ${successCount} pre-order(s) created successfully!\n\nRedirecting to My Pre-Orders...`);
                        onClose();
                        navigate('/traveler-dashboard?tab=cart');
                      } else {
                        alert('❌ Failed to create pre-orders. Please try again.');
                      }
                    } catch (error) {
                      alert('Error creating pre-orders. Please try again.');
                    }
                  }}
                >
                  <Icon name="Clock" size={16} />
                  Pre-Order
                </Button>
              )}
              
              {/* Continue to Cart & Payment - for saved journey plans */}
              {isJourneyPlan && journeyStatus === 'saved' && services.length > 0 && (
                <Button onClick={handleContinueToPayment}>
                  <Icon name="ShoppingCart" size={16} />
                  Continue to Cart & Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;
