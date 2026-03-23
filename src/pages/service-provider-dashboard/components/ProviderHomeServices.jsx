import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useCart } from '../../../contexts/CartContext';
import { API_URL } from '../../../utils/api';

const ProviderHomeServices = ({ onTabChange, onEditService }) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [trendingServices, setTrendingServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);

  useEffect(() => {
    fetchProviderServices();
  }, []);

  const fetchProviderServices = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('isafari_user') || '{}');
      const token = userData.token;

      if (!token) {
        console.error('❌ No token found');
        return;
      }

      console.log('📡 [ProviderHome] Fetching provider services...');
      
      // Fetch all provider's services
      const timestamp = new Date().getTime();
      const response = await fetch(`${API_URL}/services/provider/my-services?_t=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      const data = await response.json();
      
      if (data.success && data.services) {
        console.log(`✅ [ProviderHome] Loaded ${data.services.length} services`);
        
        // Filter for featured services (admin approved for home slides)
        const featured = data.services.filter(s => s.is_featured && s.is_active);
        setFeaturedServices(featured);
        console.log(`✅ [ProviderHome] Featured services: ${featured.length}`);
        
        // Filter for trending services (admin approved for trending section)
        const trending = data.services.filter(s => s.is_trending && s.is_active);
        setTrendingServices(trending);
        console.log(`✅ [ProviderHome] Trending services: ${trending.length}`);
      } else {
        console.warn('⚠️ No services found');
        setFeaturedServices([]);
        setTrendingServices([]);
      }
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      setFeaturedServices([]);
      setTrendingServices([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-slide for featured services
  useEffect(() => {
    if (featuredServices.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredServices.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredServices.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredServices.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredServices.length) % featuredServices.length);
  };

  // Get unique categories from provider's trending services
  const getProviderCategories = () => {
    const uniqueCategories = [...new Set(trendingServices.map(s => s.category))];
    return uniqueCategories.map(cat => {
      let icon = 'Package';
      if (cat === 'Transportation') icon = 'Car';
      else if (cat === 'Accommodation') icon = 'Home';
      else if (cat === 'Tours & Activities') icon = 'Compass';
      return { id: cat, name: cat, icon };
    });
  };

  const categories = getProviderCategories();

  const filteredTrendingServices = selectedCategory === '' 
    ? trendingServices 
    : trendingServices.filter(service => service.category === selectedCategory);

  // Set first category as default when categories load
  useEffect(() => {
    if (categories.length > 0 && selectedCategory === '') {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  const currentService = featuredServices[currentSlide];

  return (
    <div className="space-y-12">
      {/* Featured Services Slider - Full Screen like Traveller Portal */}
      <section className="relative h-screen overflow-hidden bg-gray-900 -mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
        {featuredServices.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
            <div className="text-center text-white px-4">
              <Icon name="Package" size={64} className="mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-semibold mb-2">No Featured Services</h3>
              <p className="text-white/80 mb-4">Your services will appear here once admin approves them for featured display</p>
              <Button 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                onClick={() => onTabChange && onTabChange('promotion')}
              >
                <Icon name="TrendingUp" size={16} />
                Request New Promotion
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Background Images */}
            <div className="absolute inset-0">
              {featuredServices.map((service, index) => (
                <div
                  key={service.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {service.images && service.images.length > 0 ? (
                    <img
                      src={service.images[0]}
                      alt={service.title}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
                  )}
                  <div className="absolute inset-0 bg-black/40"></div>
                </div>
              ))}
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-3xl">
                  <div className="mb-6 flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent border border-accent/30">
                      <Icon name="MapPin" size={16} className="mr-2" />
                      {currentService?.location}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary/30">
                      <Icon name="Star" size={16} className="mr-2" />
                      Featured
                    </span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-medium text-white mb-4 leading-tight">
                    {currentService?.title}
                  </h1>
                  
                  <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-2 font-light">
                    {currentService?.description || `Your ${currentService?.category} service`}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 mb-8 text-white/80">
                    <div className="flex items-center">
                      <Icon name="Tag" size={18} className="mr-2" />
                      <span className="text-base sm:text-lg">{currentService?.category}</span>
                    </div>
                    <div className="flex items-center">
                      <Icon name="DollarSign" size={18} className="mr-2" />
                      <span className="text-base sm:text-lg font-medium">Tshs {parseFloat(currentService?.price || 0).toLocaleString()}/day</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="default" 
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => onTabChange && onTabChange('promotion')}
                    >
                      <Icon name="TrendingUp" size={20} />
                      Request New Promotion
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => onTabChange && onTabChange('promotion')}
                    >
                      <Icon name="TrendingUp" size={20} />
                      Promote More
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto bg-white/10 border-white/30 text-white hover:bg-white/20"
                      onClick={() => onTabChange && onTabChange('analytics')}
                    >
                      <Icon name="BarChart" size={20} />
                      View Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            {featuredServices.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
                >
                  <Icon name="ChevronLeft" size={24} />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
                >
                  <Icon name="ChevronRight" size={24} />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                  {featuredServices.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlide ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Trending Services Section */}
      <section className="py-8">
        <div className="mb-8">
          <h2 className="text-3xl lg:text-4xl font-display font-medium text-foreground mb-4">
            Your Trending Services
          </h2>
          <p className="text-lg text-muted-foreground">
            Services that admin has approved to appear in the trending section
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-background text-muted-foreground hover:text-foreground hover:bg-muted border border-border'
              }`}
            >
              <Icon name={category.icon} size={16} />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {filteredTrendingServices.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Icon name="TrendingUp" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Trending Services</h3>
            <p className="text-muted-foreground mb-6">
              Your services will appear here once admin approves them for trending display
            </p>
            <Button onClick={() => onTabChange && onTabChange('promotion')}>
              <Icon name="TrendingUp" size={16} />
              Request New Promotion
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrendingServices.map((service) => (
              <div key={service.id} className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all">
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                  {service.images && service.images.length > 0 ? (
                    <img 
                      src={service.images[0]} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="Package" size={48} className="text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      {service.category}
                    </span>
                    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Icon name="TrendingUp" size={12} />
                      Trending
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Icon name="MapPin" size={14} />
                        {service.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">Tshs {parseFloat(service.price || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">per day</div>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Icon name="Star" size={14} className="text-yellow-500" />
                      <span>{parseFloat(service.average_rating || 0).toFixed(1)}</span>
                    </div>
                    <span>{service.total_bookings || 0} bookings</span>
                  </div>

                  <Button 
                    variant="default"
                    size="sm" 
                    className="w-full"
                    onClick={() => setSelectedServiceDetails(service)}
                  >
                    <Icon name="Eye" size={14} />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Service Details Modal */}
      {selectedServiceDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedServiceDetails(null)}>
          <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Service Image */}
            <div className="relative h-64">
              {selectedServiceDetails.images && selectedServiceDetails.images.length > 0 ? (
                <img 
                  src={selectedServiceDetails.images[0]} 
                  alt={selectedServiceDetails.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Icon name="Package" size={64} className="text-primary/40" />
                </div>
              )}
              <button 
                onClick={() => setSelectedServiceDetails(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Icon name="X" size={20} />
              </button>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  {selectedServiceDetails.category}
                </span>
                <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Icon name="TrendingUp" size={14} />
                  Trending
                </span>
              </div>
            </div>

            {/* Service Details */}
            <div className="p-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {selectedServiceDetails.title}
              </h2>
              
              <p className="text-muted-foreground flex items-center gap-1 mb-4">
                <Icon name="MapPin" size={16} />
                {selectedServiceDetails.location || 'Tanzania'}
              </p>

              <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">TZS {parseFloat(selectedServiceDetails.price || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">per day</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-xl font-bold flex items-center gap-1">
                    <Icon name="Star" size={18} className="text-yellow-500 fill-yellow-500" />
                    {parseFloat(selectedServiceDetails.average_rating || 0).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedServiceDetails.description || 'No description available'}</p>
              </div>

              {/* Amenities */}
              {(() => {
                const amenities = Array.isArray(selectedServiceDetails.amenities) 
                  ? selectedServiceDetails.amenities 
                  : [];
                
                return amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-2">Amenities & Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity, index) => (
                        <span key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Stats */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{selectedServiceDetails.total_bookings || 0}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <p className="text-lg font-semibold text-success">Active & Trending</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setSelectedServiceDetails(null);
                    onEditService && onEditService(selectedServiceDetails.id);
                  }}
                >
                  <Icon name="Edit" size={16} />
                  Edit Service
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setSelectedServiceDetails(null);
                    onTabChange && onTabChange('analytics');
                  }}
                >
                  <Icon name="BarChart" size={16} />
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderHomeServices;
