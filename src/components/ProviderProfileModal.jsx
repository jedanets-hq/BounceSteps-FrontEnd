import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { API_URL } from '../utils/api';

const ProviderProfileModal = ({ provider, onClose, onSelectService }) => {
  const [providerDetails, setProviderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);

  useEffect(() => {
    if (provider?.id) {
      fetchProviderDetails();
    }
  }, [provider]);

  const fetchProviderDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching provider details for ID:', provider.id);
      
      const response = await fetch(`${API_URL}/providers/${provider.id}`);
      const data = await response.json();
      
      console.log('📥 Provider details response:', data);
      
      if (data.success) {
        setProviderDetails(data.provider);
      } else {
        console.error('❌ Failed to load provider:', data.message);
        alert('Failed to load provider details: ' + data.message);
      }
    } catch (error) {
      console.error('❌ Error fetching provider details:', error);
      alert('Failed to load provider details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceSelection = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.find(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleAddServices = () => {
    if (selectedServices.length > 0) {
      onSelectService(selectedServices, providerDetails || provider);
    }
  };

  if (!provider) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header - Mobile optimized */}
        <div className="sticky top-0 bg-card border-b border-border p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.business_name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name="Briefcase" size={20} className="text-primary sm:w-6 sm:h-6" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground truncate">{provider.business_name}</h2>
              <p className="text-muted-foreground text-sm sm:text-base truncate">{provider.business_type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0 dark:hover:bg-gray-700 dark:text-white"
          >
            <Icon name="X" size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading provider details...</p>
          </div>
        ) : providerDetails ? (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Provider Info - Mobile optimized grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Icon name="MapPin" size={16} className="mr-2 text-primary flex-shrink-0" />
                  Location
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base">{providerDetails.location}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Icon name="Briefcase" size={16} className="mr-2 text-primary flex-shrink-0" />
                  Service Categories
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {providerDetails.service_categories?.map((category, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary/10 text-secondary text-xs sm:text-sm rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Icon name="Star" size={16} className="mr-2 text-primary flex-shrink-0" />
                  Rating
                </h3>
                <div className="flex items-center">
                  <span className="text-xl sm:text-2xl font-bold text-foreground">{providerDetails.rating || 0}</span>
                  <span className="text-muted-foreground ml-2 text-sm">({providerDetails.total_reviews || 0} reviews)</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Icon name="Phone" size={16} className="mr-2 text-primary flex-shrink-0" />
                  Contact
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base">{providerDetails.phone || 'Not provided'}</p>
                <p className="text-muted-foreground text-xs sm:text-sm truncate">{providerDetails.email}</p>
              </div>
            </div>

            {/* Description */}
            {providerDetails.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <Icon name="FileText" size={16} className="mr-2 text-primary flex-shrink-0" />
                  About
                </h3>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{providerDetails.description}</p>
              </div>
            )}

            {/* Services */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 sm:mb-4 flex items-center text-sm sm:text-base">
                <Icon name="Package" size={16} className="mr-2 text-primary flex-shrink-0" />
                Available Services ({providerDetails.services?.length || 0})
              </h3>
              
              {providerDetails.services && providerDetails.services.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {providerDetails.services.map((service) => {
                    const isSelected = selectedServices.find(s => s.id === service.id);
                    return (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-3 sm:p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleServiceSelection(service)}
                      >
                        {/* Service Image */}
                        {(() => {
                          let images = [];
                          if (service.images) {
                            if (typeof service.images === 'string') {
                              try {
                                const parsed = JSON.parse(service.images);
                                images = Array.isArray(parsed) ? parsed : [parsed];
                              } catch (e) {
                                images = [service.images];
                              }
                            } else if (Array.isArray(service.images)) {
                              images = service.images;
                            }
                          }
                          const validImages = images.filter(img => img && img.trim && img.trim().length > 0);
                          
                          return validImages.length > 0 ? (
                            <img
                              src={validImages[0]}
                              alt={service.title}
                              className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg mb-3"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : null;
                        })()}
                        
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-foreground text-sm sm:text-base flex-1 pr-2">{service.title}</h4>
                          {isSelected && (
                            <Icon name="Check" size={18} className="text-primary flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-base sm:text-lg font-bold text-primary">
                            TZS {parseFloat(service.price || 0).toLocaleString()}
                          </span>
                          {service.duration_days && (
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {service.duration_days} days
                            </span>
                          )}
                        </div>
                        
                        {/* SELECT SERVICE Button - Mobile optimized */}
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className="w-full h-9 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleServiceSelection(service);
                          }}
                        >
                          <Icon name={isSelected ? "CheckCircle" : "Plus"} size={14} className="mr-1" />
                          {isSelected ? 'Selected ✓' : 'Select Service'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Package" size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No services available</p>
                </div>
              )}
            </div>

            {/* Action Buttons - Mobile optimized */}
            <div className="sticky bottom-0 bg-card border-t border-border pt-3 sm:pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                {selectedServices.length > 0 && (
                  <span>{selectedServices.length} service(s) selected</span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="w-full sm:w-auto h-9 text-sm dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Close
                </Button>
                {selectedServices.length > 0 && (
                  <Button 
                    onClick={handleAddServices}
                    className="w-full sm:w-auto h-9 text-sm dark:bg-primary dark:text-white dark:hover:bg-primary/80"
                  >
                    <Icon name="Plus" size={14} className="mr-1" />
                    Add Selected Services
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            <p>Failed to load provider details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfileModal;
