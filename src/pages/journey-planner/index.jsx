import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import VerifiedBadge from '../../components/ui/VerifiedBadge';
import CartSidebar from '../../components/CartSidebar';
import { PaymentModal, BookingConfirmation } from '../../components/PaymentSystem';
import ServiceDetailsModal from '../../components/ServiceDetailsModal';
import { locationData, serviceCategories } from '../../data/locations';

const JourneyPlanner = () => {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, cartItems, getCartTotal } = useCart();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [booking, setBooking] = useState(null);

  // Redirect to login if not authenticated or not a traveler
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=journey-planner&role=traveler');
      return;
    }
    
    if (user && user.userType !== 'traveler') {
      alert('Journey planning is available for travelers only. Please switch to traveler mode or create a traveler account.');
      navigate('/profile');
      return;
    }
  }, [user, isAuthenticated, navigate]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    country: '',
    region: '',
    district: '',
    sublocation: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    budget: '',
    serviceCategory: '',
    selectedServices: []
  });

  const [availableRegions, setAvailableRegions] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableSublocations, setAvailableSublocations] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [showServiceDetailsModal, setShowServiceDetailsModal] = useState(false);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState(null);

  const interests = [
    'Adventure', 'Culture', 'Food & Drink', 'Nature', 'History', 
    'Art & Museums', 'Nightlife', 'Shopping', 'Wellness', 'Photography'
  ];

  // Fetch services from API by category and location - STRICT FILTERING
  const fetchServicesByCategory = async (category) => {
    try {
      setLoadingServices(true);
      console.log('🔍 Fetching services for category:', category);
      console.log('📍 Location:', formData.sublocation, formData.district, formData.region);

      // Build query parameters with STRICT category and location filter
      const params = new URLSearchParams();
      params.append('category', category);
      params.append('limit', '100');
      
      // Add all location filters for strict matching
      if (formData.sublocation) {
        params.append('location', formData.sublocation);
      }
      if (formData.district) {
        params.append('district', formData.district);
      }
      if (formData.region) {
        params.append('region', formData.region);
      }

      const response = await fetch(`/api/services?${params.toString()}`);
      const data = await response.json();

      console.log('📦 Services response:', data);

      if (data.success && data.services) {
        // STRICT FILTER: Only show services that match BOTH category AND location EXACTLY
        const filteredServices = data.services.filter(service => {
          // Category must match EXACTLY
          const matchesCategory = service.category === category;
          if (!matchesCategory) {
            console.log(`❌ Service "${service.title}" rejected: category "${service.category}" !== "${category}"`);
            return false;
          }
          
          // Location matching - STRICT: must match at least one location level EXACTLY
          const serviceLocationLower = (service.location || '').toLowerCase().trim();
          const serviceRegionLower = (service.region || '').toLowerCase().trim();
          const serviceDistrictLower = (service.district || '').toLowerCase().trim();
          const serviceAreaLower = (service.area || '').toLowerCase().trim();
          
          const selectedSublocation = (formData.sublocation || '').toLowerCase().trim();
          const selectedDistrict = (formData.district || '').toLowerCase().trim();
          const selectedRegion = (formData.region || '').toLowerCase().trim();
          
          // STRICT MATCHING: Check exact matches or contains for hierarchical locations
          let matchesLocation = false;
          
          // Priority 1: Check sublocation/area (most specific)
          if (selectedSublocation) {
            matchesLocation = 
              serviceLocationLower === selectedSublocation ||
              serviceAreaLower === selectedSublocation ||
              serviceDistrictLower === selectedSublocation ||
              serviceLocationLower.includes(selectedSublocation) ||
              serviceAreaLower.includes(selectedSublocation);
          }
          
          // Priority 2: Check district if sublocation didn't match
          if (!matchesLocation && selectedDistrict) {
            matchesLocation = 
              serviceDistrictLower === selectedDistrict ||
              serviceLocationLower === selectedDistrict ||
              serviceAreaLower === selectedDistrict ||
              serviceDistrictLower.includes(selectedDistrict) ||
              serviceLocationLower.includes(selectedDistrict);
          }
          
          // Priority 3: Check region if district didn't match
          if (!matchesLocation && selectedRegion) {
            matchesLocation = 
              serviceRegionLower === selectedRegion ||
              serviceDistrictLower === selectedRegion ||
              serviceLocationLower === selectedRegion ||
              serviceRegionLower.includes(selectedRegion);
          }
          
          // If no location selected, don't filter by location
          if (!selectedSublocation && !selectedDistrict && !selectedRegion) {
            matchesLocation = true;
          }
          
          if (!matchesLocation) {
            console.log(`❌ Service "${service.title}" rejected: location mismatch`);
            console.log(`   Service location: ${service.location}, district: ${service.district}, region: ${service.region}`);
            console.log(`   Selected: ${formData.sublocation}, ${formData.district}, ${formData.region}`);
          }
          
          return matchesLocation;
        });

        console.log(`✅ STRICT FILTER RESULTS:`);
        console.log(`   Category: ${category}`);
        console.log(`   Location: ${formData.sublocation || formData.district || formData.region}`);
        console.log(`   Total from API: ${data.services.length}`);
        console.log(`   After strict filtering: ${filteredServices.length}`);
        console.log(`   Filtered services:`, filteredServices.map(s => `${s.title} (${s.category}, ${s.location})`));
        
        // Transform services to match expected format
        const transformedServices = filteredServices.map(service => ({
          id: service.id,
          name: service.title,
          title: service.title,
          description: service.description,
          price: parseFloat(service.price),
          category: service.category,
          location: service.location,
          region: service.region,
          district: service.district,
          area: service.area,
          images: service.images || [],
          provider_id: service.provider_id,
          provider: {
            id: service.provider_id,
            name: service.business_name,
            rating: service.provider_rating || 0,
            verified: service.provider_verified || false
          },
          businessName: service.business_name,
          rating: service.provider_rating || 0,
          provider_verified: service.provider_verified || false,
          payment_methods: service.payment_methods || {},
          contact_info: service.contact_info || {}
        }));

        setAvailableServices(transformedServices);
      } else {
        console.log('⚠️ No services found');
        setAvailableServices([]);
      }
    } catch (error) {
      console.error('❌ Error fetching services:', error);
      setAvailableServices([]);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Handle cascading location selections
    if (field === 'country') {
      const regions = locationData[value] ? Object.keys(locationData[value].regions) : [];
      setAvailableRegions(regions);
      setAvailableDistricts([]);
      setAvailableSublocations([]);
      setFormData(prev => ({ ...prev, region: '', district: '', sublocation: '' }));
    }
    
    if (field === 'region' && formData.country) {
      const districts = locationData[formData.country]?.regions[value] ? 
        Object.keys(locationData[formData.country].regions[value].districts) : [];
      setAvailableDistricts(districts);
      setAvailableSublocations([]);
      setFormData(prev => ({ ...prev, district: '', sublocation: '' }));
    }
    
    if (field === 'district' && formData.country && formData.region) {
      const sublocations = locationData[formData.country]?.regions[formData.region]?.districts[value]?.sublocations || [];
      setAvailableSublocations(sublocations);
      setFormData(prev => ({ ...prev, sublocation: '' }));
    }
    
    if (field === 'serviceCategory') {
      // Fetch real services from API when category is selected
      fetchServicesByCategory(value);
    }
  };

  const handleServiceToggle = (serviceId) => {
    const service = availableServices.find(s => s.id === serviceId);
    const categoryKey = selectedCategory;
    
    setServicesByCategory(prev => {
      const currentCategoryServices = prev[categoryKey] || [];
      const isSelected = currentCategoryServices.some(s => s.id === serviceId);
      
      return {
        ...prev,
        [categoryKey]: isSelected
          ? currentCategoryServices.filter(s => s.id !== serviceId)
          : [...currentCategoryServices, service]
      };
    });

    // Update form data with all selected services from all categories
    setFormData(prev => {
      const allServices = Object.values(servicesByCategory).flat();
      const currentCategoryServices = servicesByCategory[categoryKey] || [];
      const isSelected = currentCategoryServices.some(s => s.id === serviceId);
      
      let updatedServices;
      if (isSelected) {
        updatedServices = allServices.filter(s => s.id !== serviceId);
      } else {
        updatedServices = [...allServices, service];
      }
      
      return {
        ...prev,
        selectedServices: updatedServices.map(s => s.id)
      };
    });
  };

  const handleViewServiceDetails = (service) => {
    setSelectedServiceForDetails(service);
    setShowServiceDetailsModal(true);
  };

  const handleAddToPlanFromModal = (service) => {
    const categoryKey = service.category;
    
    setServicesByCategory(prev => {
      const currentCategoryServices = prev[categoryKey] || [];
      const isAlreadyAdded = currentCategoryServices.some(s => s.id === service.id);
      
      if (isAlreadyAdded) {
        return prev;
      }
      
      return {
        ...prev,
        [categoryKey]: [...currentCategoryServices, service]
      };
    });

    setFormData(prev => {
      const allServices = Object.values(servicesByCategory).flat();
      const isAlreadyAdded = allServices.some(s => s.id === service.id);
      
      if (isAlreadyAdded) {
        return prev;
      }
      
      return {
        ...prev,
        selectedServices: [...prev.selectedServices, service.id]
      };
    });
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = () => {
    // Get all selected services from all categories
    const allSelectedServices = Object.values(servicesByCategory).flat();
    
    // Add all selected services to cart
    allSelectedServices.forEach(service => {
      addToCart({
        ...service,
        location: `${formData.sublocation}, ${formData.district}, ${formData.region}, ${formData.country}`,
        travelers: formData.travelers
      });
    });
    
    const journeyPlan = {
      id: Date.now(),
      country: formData.country,
      region: formData.region,
      district: formData.district,
      area: formData.sublocation,
      services: allSelectedServices,
      travelers: formData.travelers,
      totalCost: allSelectedServices.reduce((total, service) => total + service.price, 0),
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const existingPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
    localStorage.setItem('journey_plans', JSON.stringify([...existingPlans, journeyPlan]));
    
    alert(`Journey plan created! ${allSelectedServices.length} services added to cart.`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-medium text-foreground mb-3 sm:mb-4">
              Plan Your Perfect Journey
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Tell us about your dream trip and we'll create a personalized itinerary just for you
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium ${
                    stepNum <= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepNum}
                </div>
              ))}
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Form Steps */}
          <div className="bg-card rounded-lg shadow-lg p-8">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Select Your Destination</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Country *
                    </label>
                    <select
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a country</option>
                      {Object.keys(locationData).map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Region/State *
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      disabled={!formData.country}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      <option value="">Select a region</option>
                      {availableRegions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      District/City *
                    </label>
                    <select
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      disabled={!formData.region}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      <option value="">Select a district</option>
                      {availableDistricts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Area/Neighborhood *
                    </label>
                    <select
                      value={formData.sublocation}
                      onChange={(e) => handleInputChange('sublocation', e.target.value)}
                      disabled={!formData.district}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                    >
                      <option value="">Select an area</option>
                      {availableSublocations.map(sublocation => (
                        <option key={sublocation} value={sublocation}>{sublocation}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.sublocation && (
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-primary">
                      <Icon name="MapPin" size={20} />
                      <span className="font-medium">Selected Location:</span>
                    </div>
                    <p className="text-foreground mt-1">
                      {formData.sublocation}, {formData.district}, {formData.region}, {formData.country}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Travel Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Number of Travelers
                  </label>
                  <select
                    value={formData.travelers}
                    onChange={(e) => handleInputChange('travelers', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Traveler' : 'Travelers'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Budget Range</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'ultra-budget', label: 'Ultra Budget ($50 - $200)', icon: 'DollarSign' },
                      { value: 'budget', label: 'Budget ($200 - $800)', icon: 'DollarSign' },
                      { value: 'moderate', label: 'Moderate ($800 - $2,000)', icon: 'DollarSign' },
                      { value: 'luxury', label: 'Luxury ($2,000+)', icon: 'DollarSign' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleInputChange('budget', option.value)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          formData.budget === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon name={option.icon} size={24} className="text-primary" />
                          <span className="font-medium text-foreground">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Select Service Category</h2>
                
                {!formData.sublocation ? (
                  <div className="text-center p-8 bg-muted/50 rounded-lg">
                    <Icon name="MapPin" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Please complete location selection in Step 1 first</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(serviceCategories).map(([category, details]) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          handleInputChange('serviceCategory', category);
                        }}
                        className={`p-6 border-2 rounded-lg text-left transition-all ${
                          selectedCategory === category
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <Icon name={details.icon} size={24} className="text-primary" />
                          <span className="font-semibold text-foreground">{category}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {details.subcategories.slice(0, 3).join(', ')}
                          {details.subcategories.length > 3 && '...'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {formData.serviceCategory && (
                  <div className="mt-6 p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                    <div className="flex items-center space-x-2 text-secondary">
                      <Icon name="Tag" size={20} />
                      <span className="font-medium">Selected Category:</span>
                    </div>
                    <p className="text-foreground mt-1">{formData.serviceCategory}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available subcategories: {serviceCategories[formData.serviceCategory]?.subcategories.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Available Services</h2>
                
                {/* Location and Category Info */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg mb-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={16} className="text-primary" />
                      <span className="font-medium">Location:</span>
                      <span className="text-muted-foreground">{formData.sublocation}, {formData.district}, {formData.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Tag" size={16} className="text-primary" />
                      <span className="font-medium">Category:</span>
                      <span className="text-muted-foreground">{selectedCategory}</span>
                    </div>
                  </div>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search services by name or provider..."
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                
                {!formData.serviceCategory ? (
                  <div className="text-center p-8 bg-muted/50 rounded-lg">
                    <Icon name="Package" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Please select a service category in Step 3 first</p>
                  </div>
                ) : loadingServices ? (
                  <div className="text-center p-8 bg-muted/50 rounded-lg">
                    <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-foreground font-medium">Loading {selectedCategory} services...</p>
                    <p className="text-sm text-muted-foreground mt-2">Searching in {formData.sublocation || formData.district || formData.region}...</p>
                  </div>
                ) : availableServices.length === 0 ? (
                  <div className="text-center p-8 bg-muted/50 rounded-lg border-2 border-dashed border-border">
                    <Icon name="AlertCircle" size={56} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No {selectedCategory} Services Found
                    </h3>
                    <p className="text-muted-foreground mb-1">
                      We couldn't find any <span className="font-medium text-foreground">{selectedCategory}</span> services in
                    </p>
                    <p className="text-primary font-medium mb-3">
                      {formData.sublocation}, {formData.district}, {formData.region}
                    </p>
                    
                    <div className="bg-card p-4 rounded-lg mb-4 max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground mb-2">
                        <Icon name="Info" size={16} className="inline mr-1" />
                        This might be because:
                      </p>
                      <ul className="text-xs text-muted-foreground text-left space-y-1">
                        <li>• No providers offer {selectedCategory} services in this area yet</li>
                        <li>• The location or category combination is too specific</li>
                        <li>• Services may be available in nearby areas</li>
                      </ul>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      Try selecting a different category or exploring nearby locations
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setStep(3)}
                        className="flex items-center gap-2"
                      >
                        <Icon name="ArrowLeft" size={16} />
                        Change Category
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2"
                      >
                        <Icon name="MapPin" size={16} />
                        Change Location
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => navigate('/destination-discovery')}
                        className="flex items-center gap-2"
                      >
                        <Icon name="Search" size={16} />
                        Browse All Services
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {selectedCategory} in {formData.sublocation}, {formData.district}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Showing only {selectedCategory} services from {formData.sublocation || formData.district || formData.region}. Select services to add to your plan.
                      </p>
                      
                      {/* Show previously selected services from other categories */}
                      {Object.keys(servicesByCategory).length > 0 && (
                        <div className="mt-4 p-3 bg-secondary/5 rounded-lg">
                          <p className="text-sm font-medium text-foreground mb-2">Services from other categories:</p>
                          {Object.entries(servicesByCategory).map(([category, services]) => (
                            category !== selectedCategory && services.length > 0 && (
                              <div key={category} className="text-xs text-muted-foreground">
                                <span className="font-medium">{category}:</span> {services.map(s => s.name).join(', ')}
                              </div>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        Found <span className="text-primary font-bold">
                          {availableServices.filter(s => 
                            !serviceSearchTerm || 
                            s.title?.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
                            s.businessName?.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
                            s.description?.toLowerCase().includes(serviceSearchTerm.toLowerCase())
                          ).length}
                        </span> {selectedCategory} service{availableServices.length !== 1 ? 's' : ''} in {formData.sublocation || formData.district}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {availableServices
                        .filter(service => 
                          !serviceSearchTerm || 
                          service.title?.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
                          service.businessName?.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
                          service.description?.toLowerCase().includes(serviceSearchTerm.toLowerCase())
                        )
                        .map((service) => {
                        const isSelected = servicesByCategory[selectedCategory]?.some(s => s.id === service.id) || false;
                        return (
                          <div
                            key={service.id}
                            className={`p-3 sm:p-5 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleServiceToggle(service.id)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground text-base sm:text-lg mb-1 flex items-center gap-1.5">
                                  {service.title || service.name}
                                  {service.provider_verified && <VerifiedBadge size="sm" />}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <Icon name="Building2" size={14} />
                                  <span>{service.businessName || service.provider?.name || 'Provider'}</span>
                                  {service.provider_verified && <VerifiedBadge size="xs" />}
                                </div>
                                {service.location && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Icon name="MapPin" size={12} />
                                    <span>{service.location}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                <p className="text-xl font-bold text-primary">TZS {service.price.toLocaleString()}</p>
                                {service.rating > 0 && (
                                  <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                                    <Icon name="Star" size={14} className="text-yellow-500 fill-yellow-500" />
                                    <span className="text-sm font-medium text-foreground">{service.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {service.description && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {service.description}
                              </p>
                            )}

                            {/* Payment Methods Display */}
                            {service?.payment_methods && Object.keys(service.payment_methods).some(key => service.payment_methods[key]?.enabled) && (
                              <div className="mb-3 flex flex-wrap gap-1">
                                {service.payment_methods.visa?.enabled && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                                    <Icon name="CreditCard" size={10} className="mr-0.5" />
                                    Card
                                  </span>
                                )}
                                {service.payment_methods.paypal?.enabled && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                                    PayPal
                                  </span>
                                )}
                                {service.payment_methods.googlePay?.enabled && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px]">
                                    GPay
                                  </span>
                                )}
                                {service.payment_methods.mobileMoney?.enabled && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px]">
                                    <Icon name="Smartphone" size={10} className="mr-0.5" />
                                    M-Money
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Contact Buttons */}
                            {service?.contact_info && (service.contact_info.email?.enabled || service.contact_info.whatsapp?.enabled) && (
                              <div className="mb-3 flex gap-2">
                                {service.contact_info.whatsapp?.enabled && service.contact_info.whatsapp?.number && (
                                  <a 
                                    href={`https://wa.me/${service.contact_info.whatsapp.number.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Icon name="MessageCircle" size={12} className="mr-1" />
                                    WhatsApp
                                  </a>
                                )}
                                {service.contact_info.email?.enabled && service.contact_info.email?.address && (
                                  <a 
                                    href={`mailto:${service.contact_info.email.address}`}
                                    className="inline-flex items-center px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Icon name="Mail" size={12} className="mr-1" />
                                    Email
                                  </a>
                                )}
                              </div>
                            )}
                            
                            {/* View Details Button */}
                            <div className="mb-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewServiceDetails(service);
                                }}
                              >
                                <Icon name="Eye" size={14} />
                                View Details
                              </Button>
                            </div>

                            {/* Provider Profile Section */}
                            {(service.businessName || service.provider?.name) && (
                              <div 
                                className="mb-3 p-2 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/provider/${service.provider_id}`, { state: { provider: service } });
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Icon name="User" size={16} className="text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-foreground flex items-center gap-1">
                                      {service.businessName || service.provider?.name}
                                      {service.provider_verified && <VerifiedBadge size="xs" />}
                                    </p>
                                    <p className="text-xs text-muted-foreground">View Provider Profile</p>
                                  </div>
                                  <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Icon name="Tag" size={12} />
                                {service.category}
                              </span>
                              <div className="flex items-center gap-2">
                                {isSelected ? (
                                  <div className="flex items-center space-x-1 text-primary font-medium">
                                    <Icon name="CheckCircle" size={16} className="fill-primary" />
                                    <span className="text-sm">Added to Plan</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-1 text-muted-foreground">
                                    <Icon name="Plus" size={16} />
                                    <span className="text-sm">Add to Plan</span>
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    // Add provider to favorites
                                    const savedUser = localStorage.getItem('isafari_user');
                                    if (!savedUser) {
                                      navigate('/login?redirect=/journey-planner');
                                      return;
                                    }
                                    
                                    const userData = JSON.parse(savedUser);
                                    const token = userData.token;
                                    
                                    const favorites = JSON.parse(localStorage.getItem('favorite_providers') || '[]');
                                    const isAlreadyFavorite = favorites.some(p => p.id === service.provider_id);
                                    
                                    if (!isAlreadyFavorite) {
                                      const newFavorite = {
                                        id: service.provider_id,
                                        business_name: service.businessName || service.provider?.name,
                                        location: service.location,
                                        is_verified: service.provider_verified,
                                        followers_count: 0
                                      };
                                      
                                      // Save to localStorage
                                      localStorage.setItem('favorite_providers', JSON.stringify([...favorites, newFavorite]));
                                      
                                      // Save to database
                                      try {
                                        await fetch('/api/users/favorites', {
                                          method: 'POST',
                                          headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                          },
                                          body: JSON.stringify({ provider_id: service.provider_id })
                                        });
                                      } catch (error) {
                                        console.error('Error saving favorite to database:', error);
                                      }
                                      
                                      alert('Provider added to favorites!');
                                    } else {
                                      alert('Already in favorites!');
                                    }
                                  }}
                                >
                                  <Icon name="Heart" size={14} />
                                  Add to Favorite
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {Object.values(servicesByCategory).flat().length > 0 && (
                      <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                        <div className="flex items-center space-x-2 text-accent mb-2">
                          <Icon name="ShoppingCart" size={20} />
                          <span className="font-medium">All Selected Services ({Object.values(servicesByCategory).flat().length})</span>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(servicesByCategory).map(([category, services]) => (
                            services.length > 0 && (
                              <div key={category} className="text-sm">
                                <span className="font-medium text-foreground">{category}:</span>
                                <span className="text-muted-foreground ml-2">
                                  {services.map(s => s.name).join(', ')}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                        <div className="mt-2 text-lg font-semibold text-foreground">
                          Total: ${Object.values(servicesByCategory).flat().reduce((total, service) => total + service.price, 0) * formData.travelers}
                          {formData.travelers > 1 && (
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                              (${Object.values(servicesByCategory).flat().reduce((total, service) => total + service.price, 0)} × {formData.travelers} travelers)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-foreground mb-6">Your Trip Summary</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Destination</h3>
                    <p className="text-muted-foreground">
                      {formData.sublocation ? 
                        `${formData.sublocation}, ${formData.district}, ${formData.region}, ${formData.country}` : 
                        'Not specified'
                      }
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Dates</h3>
                      <p className="text-muted-foreground">
                        {formData.startDate && formData.endDate 
                          ? `${formData.startDate} to ${formData.endDate}`
                          : 'Not specified'
                        }
                      </p>
                    </div>
                    
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Travelers</h3>
                      <p className="text-muted-foreground">{formData.travelers} {formData.travelers === 1 ? 'Traveler' : 'Travelers'}</p>
                    </div>
                  </div>
                  
                  {Object.values(servicesByCategory).flat().length > 0 && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h3 className="font-semibold text-foreground mb-2">Selected Services</h3>
                      <div className="space-y-3">
                        {Object.entries(servicesByCategory).map(([category, services]) => (
                          services.length > 0 && (
                            <div key={category}>
                              <h4 className="font-medium text-foreground text-sm mb-2">{category}</h4>
                              <div className="space-y-1 ml-4">
                                {services.map(service => (
                                  <div key={service.id} className="flex justify-between items-center">
                                    <span className="text-muted-foreground text-sm">{service.name}</span>
                                    <span className="text-foreground font-medium">TZS {service.price.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        ))}
                        <div className="border-t border-border pt-2 mt-2">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-foreground">Total Cost:</span>
                            <span className="text-primary text-lg">
                              TZS {(Object.values(servicesByCategory).flat().reduce((total, service) => total + service.price, 0) * formData.travelers).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons for Step 5 */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Save plan to My Trips only (no cart)
                      const allSelectedServices = Object.values(servicesByCategory).flat();
                      
                      if (allSelectedServices.length === 0) {
                        alert('Please select at least one service to save your trip.');
                        return;
                      }
                      
                      const journeyPlan = {
                        id: Date.now(),
                        country: formData.country,
                        region: formData.region,
                        district: formData.district,
                        area: formData.sublocation,
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                        travelers: formData.travelers,
                        services: allSelectedServices,
                        totalCost: allSelectedServices.reduce((total, service) => total + service.price, 0) * formData.travelers,
                        status: 'saved',
                        createdAt: new Date().toISOString()
                      };
                      
                      const existingPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
                      localStorage.setItem('journey_plans', JSON.stringify([...existingPlans, journeyPlan]));
                      
                      alert('Trip saved successfully! You can find it in My Trips.');
                      navigate('/traveler-dashboard?tab=trips');
                    }}
                  >
                    <Icon name="Save" size={16} />
                    Save Plan
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      // Add to cart and save to My Trips, then go to payment
                      const allSelectedServices = Object.values(servicesByCategory).flat();
                      
                      if (allSelectedServices.length === 0) {
                        alert('Please select at least one service to continue.');
                        return;
                      }
                      
                      // Add all services to cart
                      allSelectedServices.forEach(service => {
                        addToCart({
                          ...service,
                          location: `${formData.sublocation}, ${formData.district}, ${formData.region}, ${formData.country}`,
                          travelers: formData.travelers,
                          journey_details: {
                            startDate: formData.startDate,
                            endDate: formData.endDate,
                            travelers: formData.travelers
                          }
                        });
                      });
                      
                      // Save to My Trips with pending_payment status
                      const journeyPlan = {
                        id: Date.now(),
                        country: formData.country,
                        region: formData.region,
                        district: formData.district,
                        area: formData.sublocation,
                        startDate: formData.startDate,
                        endDate: formData.endDate,
                        travelers: formData.travelers,
                        services: allSelectedServices,
                        totalCost: allSelectedServices.reduce((total, service) => total + service.price, 0) * formData.travelers,
                        status: 'pending_payment',
                        createdAt: new Date().toISOString()
                      };
                      
                      const existingPlans = JSON.parse(localStorage.getItem('journey_plans') || '[]');
                      localStorage.setItem('journey_plans', JSON.stringify([...existingPlans, journeyPlan]));
                      
                      navigate('/traveler-dashboard?tab=cart&openPayment=true');
                    }}
                  >
                    <Icon name="CreditCard" size={16} />
                    Continue to Cart & Payments
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-border">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={prevStep}>
                    <Icon name="ChevronLeft" size={16} />
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-4">
                <Link to="/">
                  <Button variant="ghost">Cancel</Button>
                </Link>
                
                {step < 5 && (
                  <Button onClick={nextStep}>
                    Next
                    <Icon name="ChevronRight" size={16} />
                  </Button>
                )}
              </div>
            </div>
          </div>
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
      
      <ServiceDetailsModal
        isOpen={showServiceDetailsModal}
        onClose={() => setShowServiceDetailsModal(false)}
        service={selectedServiceForDetails}
        onAddToPlan={handleAddToPlanFromModal}
      />
    </div>
  );
};

export default JourneyPlanner;
