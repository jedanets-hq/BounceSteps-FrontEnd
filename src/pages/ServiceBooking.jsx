import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/ui/Header';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';
import { API_URL } from '../utils/api';

const ServiceBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [myBookings, setMyBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  // Load user's bookings from localStorage
  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem(`bookings_${user.id}`) || '[]');
    setMyBookings(savedBookings);
  }, [user.id]);

  // Fetch real services from database
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`);
      const data = await response.json();
      
      if (data.success) {
        setServices(data.services);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Services', icon: 'Grid' },
    { id: 'Accommodation', name: 'Accommodation', icon: 'Hotel' },
    { id: 'Transportation', name: 'Transportation', icon: 'Car' },
    { id: 'Tours & Activities', name: 'Tours & Activities', icon: 'Compass' }
  ];

  // Use real services from database only
  const availableServices = services;

  const filteredServices = availableServices.filter(service => 
    selectedCategory === 'all' || service.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center py-12">
            <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        </div>
      </div>
    );
  }

  const addToBookings = (service) => {
    const newBooking = {
      ...service,
      bookingId: Date.now(),
      bookedAt: new Date().toISOString(),
      status: 'pending'
    };
    
    const updatedBookings = [...myBookings, newBooking];
    setMyBookings(updatedBookings);
    localStorage.setItem(`bookings_${user.id}`, JSON.stringify(updatedBookings));
    alert(`${service.name} added to bookings!`);
  };

  const removeBooking = (bookingId) => {
    const updatedBookings = myBookings.filter(b => b.bookingId !== bookingId);
    setMyBookings(updatedBookings);
    localStorage.setItem(`bookings_${user.id}`, JSON.stringify(updatedBookings));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              Travel Services
            </h1>
            <p className="text-lg text-muted-foreground">
              Book accommodation, transport, tours and more
            </p>
          </div>

          {myBookings.length > 0 && (
            <div className="mb-8 bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Icon name="BookmarkCheck" size={24} className="mr-2 text-primary" />
                My Bookings ({myBookings.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {myBookings.map(booking => (
                  <div key={booking.bookingId} className="bg-card border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{booking.name}</h3>
                        <p className="text-sm text-muted-foreground">{booking.provider}</p>
                      </div>
                      <button onClick={() => removeBooking(booking.bookingId)} className="text-destructive">
                        <Icon name="X" size={18} />
                      </button>
                    </div>
                    <div className="flex justify-between mt-3 pt-3 border-t">
                      <span className="font-bold text-primary">${booking.price}</span>
                      <span className="text-sm text-muted-foreground">{booking.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 flex gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border hover:bg-muted'
                }`}
              >
                <Icon name={cat.icon} size={16} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <div key={service.id} className="bg-card border rounded-lg overflow-hidden hover:shadow-lg transition">
                {service.images && service.images.length > 0 ? (
                  <img src={service.images[0]} alt={service.title} className="w-full h-48 object-cover" />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Icon name="Package" size={48} className="text-primary/40" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Icon name="MapPin" size={14} />
                    {service.location}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  {service.amenities && service.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {service.amenities.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">{amenity}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <div className="text-2xl font-bold">Tshs {parseFloat(service.price || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">per day</div>
                    </div>
                    <Button size="sm" onClick={() => addToBookings(service)}>
                      <Icon name="Plus" size={16} />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBooking;
