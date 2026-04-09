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
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Package" size={24} className="text-white" />
              </div>
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
                      <Icon name="Banknote" size={18} className="mr-2" />
                      <span className="text-base sm:text-lg font-medium">TZS {parseFloat(currentService?.price || 0).toLocaleString()}/day</span>
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

      {/* Trending Services Section - ONLY FOR TRAVELERS, NOT PROVIDERS */}
      {/* This section is completely removed for service providers */}

      {/* Service Details Modal - REMOVED FOR PROVIDERS */}
      {/* Providers should use the Services tab to edit their services */}
    </div>
  );
};

export default ProviderHomeServices;
