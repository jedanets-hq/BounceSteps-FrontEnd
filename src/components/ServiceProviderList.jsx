import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { API_URL } from '../utils/api';

const ServiceProviderList = ({ region, district, selectedServices, onSelectProvider, selectedProviders = [] }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewingService, setViewingService] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getCategoryName = (category) => {
    const names = {
      accommodation: 'Accommodation',
      transport: 'Transportation',
      tours: 'Tours & Activities'
    };
    return names[category] || category;
  };

  useEffect(() => {
    if (region && selectedServices.length > 0) {
      fetchServices();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, district, selectedServices]);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch services for each selected category
      const allServices = [];
      
      for (const category of selectedServices) {
        // Convert category to proper format (e.g., "accommodation" -> "Accommodation")
        const categoryName = getCategoryName(category);
        
        const params = new URLSearchParams({
          category: categoryName
        });
        
        // Add location filter
        if (region) {
          params.append('location', region);
        }
        
        console.log('Fetching services with params:', params.toString());
        
        const response = await fetch(`${API_URL}/services?${params}`);
        const data = await response.json();
        
        console.log(`Services for ${categoryName}:`, data);
        
        if (data.success && data.services) {
          allServices.push(...data.services.map(s => ({ ...s, serviceCategory: category })));
        }
      }
      
      setServices(allServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      accommodation: 'Hotel',
      transport: 'Car',
      tours: 'Compass'
    };
    return icons[category] || 'Package';
  };

  const isSelected = (serviceId) => {
    return selectedProviders.some(p => p.id === serviceId);
  };

  const handleSelect = (service) => {
    if (isSelected(service.id)) {
      // Remove from selection
      onSelectProvider(selectedProviders.filter(p => p.id !== service.id));
    } else {
      // Add to selection
      onSelectProvider([...selectedProviders, service]);
    }
  };

  if (!region) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="MapPin" size={48} className="mx-auto mb-4 opacity-50" />
        <p>Please select a region first</p>
      </div>
    );
  }

  if (selectedServices.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="Package" size={48} className="mx-auto mb-4 opacity-50" />
        <p>Please select at least one service category</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Icon name="Loader2" size={48} className="mx-auto mb-4 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading available services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-destructive" />
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={fetchServices} variant="outline">
          <Icon name="RefreshCw" size={16} />
          Try Again
        </Button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-50" />
        <p className="font-medium mb-2">No services found</p>
        <p className="text-sm">No service providers available in {region} {district && `- ${district}`}</p>
        <p className="text-sm mt-2">Try selecting a different location or service category</p>
      </div>
    );
  }

  // Group services by category
  const groupedServices = services.reduce((acc, service) => {
    const category = service.serviceCategory;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Service Details Modal */}
      {viewingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewingService(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto bg-background rounded-lg" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button 
              onClick={() => setViewingService(null)}
              className="absolute top-4 right-4 z-10 bg-background/90 hover:bg-background text-foreground p-2 rounded-full transition-colors"
            >
              <Icon name="X" size={24} />
            </button>
            
            {/* Image Gallery */}
            {viewingService.images && viewingService.images.length > 0 && (
              <div className="relative h-96 bg-gradient-to-br from-primary/10 to-primary/5">
                <img 
                  src={viewingService.images[currentImageIndex]} 
                  alt={`${viewingService.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {viewingService.images.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + viewingService.images.length) % viewingService.images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                    >
                      <Icon name="ChevronLeft" size={24} />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % viewingService.images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                    >
                      <Icon name="ChevronRight" size={24} />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                      {currentImageIndex + 1} / {viewingService.images.length}
                    </div>
                  </>
                )}
              </div>
            )}
            
            {/* Service Details */}
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-foreground mb-2">{viewingService.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="User" size={16} />
                        <span>{viewingService.provider_name || 'Provider'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Icon name="MapPin" size={16} />
                        <span>{viewingService.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">Tshs {parseFloat(viewingService.price || 0).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">per day</div>
                  </div>
                </div>
                
                {/* Rating and Category */}
                <div className="flex items-center gap-3 mt-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    {viewingService.category}
                  </span>
                  {viewingService.average_rating && parseFloat(viewingService.average_rating) > 0 ? (
                    <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full">
                      <Icon name="Star" size={16} className="text-yellow-500" fill="currentColor" />
                      <span className="text-sm font-medium">{parseFloat(viewingService.average_rating).toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">New Service</span>
                  )}
                </div>
              </div>
              
              {/* Description */}
              {viewingService.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <Icon name="FileText" size={20} className="text-primary" />
                    Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{viewingService.description}</p>
                </div>
              )}
              
              {/* Amenities */}
              {viewingService.amenities && viewingService.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Icon name="CheckCircle" size={20} className="text-primary" />
                    Amenities & Features
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {viewingService.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Icon name="Check" size={16} className="text-green-500" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viewingService.duration && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Icon name="Clock" size={20} className="text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="font-medium">{viewingService.duration} hours</div>
                    </div>
                  </div>
                )}
                
                {viewingService.max_participants && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Icon name="Users" size={20} className="text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Max Participants</div>
                      <div className="font-medium">{viewingService.max_participants} people</div>
                    </div>
                  </div>
                )}
                
                {viewingService.phone && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Icon name="Phone" size={20} className="text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">Contact</div>
                      <div className="font-medium">{viewingService.phone}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Reviews Section Placeholder */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Icon name="MessageSquare" size={20} className="text-primary" />
                  Reviews & Comments
                </h3>
                <div className="text-center py-8 bg-muted/50 rounded-lg">
                  <Icon name="MessageSquare" size={48} className="mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">Be the first to review this service</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    handleSelect(viewingService);
                    setViewingService(null);
                  }}
                  variant={isSelected(viewingService.id) ? "outline" : "default"}
                >
                  <Icon name={isSelected(viewingService.id) ? "X" : "Check"} size={16} />
                  {isSelected(viewingService.id) ? 'Remove from Journey' : 'Add to Journey'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setViewingService(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Available Services in {region} {district && `- ${district}`}
        </h3>
        <span className="text-sm text-muted-foreground">
          {services.length} service{services.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {Object.entries(groupedServices).map(([category, categoryServices]) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Icon name={getCategoryIcon(category)} size={20} className="text-primary" />
            <h4 className="font-semibold text-foreground">{getCategoryName(category)}</h4>
            <span className="text-sm text-muted-foreground">({categoryServices.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryServices.map(service => (
              <div
                key={service.id}
                className={`border rounded-lg overflow-hidden transition-all ${
                  isSelected(service.id)
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50 hover:shadow-md'
                }`}
              >
                {/* Service Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                  {service.images && service.images.length > 0 ? (
                    <>
                      <img 
                        src={service.images[0]} 
                        alt={service.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      {service.images.length > 1 && (
                        <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                          <Icon name="Image" size={12} />
                          {service.images.length}
                        </div>
                      )}
                    </>
                  ) : null}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10" style={{display: (service.images && service.images.length > 0) ? 'none' : 'flex'}}>
                    <Icon name={getCategoryIcon(category)} size={48} className="text-primary/40" />
                  </div>
                  {isSelected(service.id) && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Icon name="Check" size={20} />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
                    {getCategoryName(category)}
                  </div>
                </div>

                {/* Service Details */}
                <div className="p-4">
                  <div className="mb-3">
                    <h5 className="font-semibold text-foreground text-lg mb-1">{service.title}</h5>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Icon name="User" size={14} />
                      {service.provider_name || service.business_name || `${service.first_name || ''} ${service.last_name || ''}`.trim() || 'Provider'}
                    </p>
                  </div>

                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-1 text-xs text-muted-foreground mb-3">
                    <Icon name="MapPin" size={14} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{service.location || `${service.district}, ${service.region}`}</span>
                  </div>

                  {/* Price and Rating */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <div className="text-xl font-bold text-primary">
                        Tshs {parseFloat(service.price).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per day
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.average_rating && parseFloat(service.average_rating) > 0 ? (
                        <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded">
                          <Icon name="Star" size={14} className="text-yellow-500" fill="currentColor" />
                          <span className="text-sm font-medium">{parseFloat(service.average_rating).toFixed(1)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">New</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-3 border-t border-border flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingService(service);
                        setCurrentImageIndex(0);
                      }}
                    >
                      <Icon name="Eye" size={14} />
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant={isSelected(service.id) ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(service);
                      }}
                    >
                      <Icon name={isSelected(service.id) ? "Check" : "Plus"} size={14} />
                      {isSelected(service.id) ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {selectedProviders.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sticky bottom-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">
                {selectedProviders.length} Service{selectedProviders.length !== 1 ? 's' : ''} Selected
              </p>
              <p className="text-sm text-muted-foreground">
                Click on services to add or remove from your journey
              </p>
            </div>
            <Button size="sm" onClick={() => onSelectProvider([])}>
              <Icon name="X" size={16} />
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceProviderList;
