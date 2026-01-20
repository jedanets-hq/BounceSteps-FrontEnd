import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import CartSidebar from '../../components/CartSidebar';
import { PaymentModal, BookingConfirmation } from '../../components/PaymentSystem';
import { locationData, serviceCategories, mockServices } from '../../data/locations';

const ServiceBooking = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    location: searchParams.get('location') || 'all',
    priceRange: 'all',
    rating: 'all'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=service-booking');
      return;
    }
  }, [isAuthenticated, navigate]);

  const handleAddToCart = (service) => {
    const bookingItem = {
      id: service.id,
      name: service.name,
      price: service.price,
      image: service.image,
      description: service.description,
      location: service.location,
      rating: service.rating,
      type: 'individual_service',
      category: service.category
    };
    
    addToCart(bookingItem);
    alert(`${service.name} added to cart!`);
  };

  const handleBookNow = (service) => {
    handleAddToCart(service);
    setShowPayment(true);
  };

  // Convert mockServices object to flat array
  const getAllServices = () => {
    const allServices = [];
    Object.keys(mockServices).forEach(location => {
      Object.keys(mockServices[location]).forEach(category => {
        mockServices[location][category].forEach(service => {
          allServices.push({
            ...service,
            location: location,
            category: category,
            image: `https://images.unsplash.com/photo-${1500000000000 + service.id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`,
            description: `Premium ${service.name} in ${location}`
          });
        });
      });
    });
    return allServices;
  };

  // Filter and sort services
  const filteredServices = getAllServices()
    .filter(service => {
      const matchesCategory = filters.category === 'all' || service.category === filters.category;
      const matchesLocation = filters.location === 'all' || service.location.includes(filters.location);
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesPrice = true;
      if (filters.priceRange !== 'all') {
        const price = service.price;
        switch (filters.priceRange) {
          case 'budget':
            matchesPrice = price <= 100;
            break;
          case 'mid':
            matchesPrice = price > 100 && price <= 500;
            break;
          case 'luxury':
            matchesPrice = price > 500;
            break;
        }
      }
      
      let matchesRating = true;
      if (filters.rating !== 'all') {
        matchesRating = service.rating >= parseFloat(filters.rating);
      }
      
      return matchesCategory && matchesLocation && matchesSearch && matchesPrice && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return b.rating - a.rating; // popular (by rating)
      }
    });

  const priceRanges = [
    { value: 'all', label: 'All Prices' },
    { value: 'budget', label: 'Budget ($0-$100)' },
    { value: 'mid', label: 'Mid-range ($100-$500)' },
    { value: 'luxury', label: 'Luxury ($500+)' }
  ];

  const ratingFilters = [
    { value: 'all', label: 'All Ratings' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'name', label: 'Name A-Z' }
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Book Services</h1>
            <p className="text-muted-foreground">Find and book individual travel services</p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-lg p-6 mb-8 border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {Object.keys(serviceCategories).map(categoryKey => (
                    <option key={categoryKey} value={categoryKey}>{categoryKey}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price Range</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {ratingFilters.map(rating => (
                    <option key={rating.value} value={rating.value}>{rating.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Showing {filteredServices.length} services
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <div key={service.id} className="bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Icon name="Star" size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <Icon name="MapPin" size={14} className="mr-1" />
                      <span className="text-sm">{service.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">${service.price}</span>
                      <span className="text-sm text-muted-foreground capitalize">{service.category}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleAddToCart(service)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Icon name="ShoppingBag" size={16} />
                      Add to Cart
                    </Button>
                    <Button 
                      onClick={() => handleBookNow(service)}
                      size="sm"
                      className="flex-1"
                    >
                      <Icon name="CreditCard" size={16} />
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredServices.length === 0 && (
            <div className="text-center py-12">
              <Icon name="Search" size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No services found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
              <Button 
                onClick={() => {
                  setFilters({ category: 'all', location: 'all', priceRange: 'all', rating: 'all' });
                  setSearchTerm('');
                }}
                variant="outline"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <CartSidebar onCheckout={() => setShowPayment(true)} />
      
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        cartItems={cartItems}
        total={getCartTotal()}
        onPaymentSuccess={(bookingData) => {
          setBooking(bookingData);
          setShowPayment(false);
        }}
      />
      
      <BookingConfirmation
        booking={booking}
        onClose={() => {
          setBooking(null);
          navigate('/dashboard');
        }}
      />
    </div>
  );
};

export default ServiceBooking;
