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
      const response = await fetch(`${API_URL}/providers/${provider.id}`);
      const data = await response.json();
      
      if (data.success) {
        setProviderDetails(data.provider);
      }
    } catch (error) {
      console.error('Error fetching provider details:', error);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.business_name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Briefcase" size={24} className="text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground">{provider.business_name}</h2>
              <p className="text-muted-foreground">{provider.business_type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading provider details...</p>
          </div>
        ) : providerDetails ? (
          <div className="p-6 space-y-6">
            {/* Provider Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="MapPin" size={18} className="mr-2 text-primary" />
                  Location
                </h3>
                <p className="text-muted-foreground">{providerDetails.location}</p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="Briefcase" size={18} className="mr-2 text-primary" />
                  Service Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {providerDetails.service_categories?.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-secondary/10 text-secondary text-sm rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="Star" size={18} className="mr-2 text-primary" />
                  Rating
                </h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-foreground">{providerDetails.rating || 0}</span>
                  <span className="text-muted-foreground ml-2">({providerDetails.total_reviews || 0} reviews)</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="Phone" size={18} className="mr-2 text-primary" />
                  Contact
                </h3>
                <p className="text-muted-foreground">{providerDetails.phone || 'Not provided'}</p>
                <p className="text-muted-foreground text-sm">{providerDetails.email}</p>
              </div>
            </div>

            {/* Description */}
            {providerDetails.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center">
                  <Icon name="FileText" size={18} className="mr-2 text-primary" />
                  About
                </h3>
                <p className="text-muted-foreground">{providerDetails.description}</p>
              </div>
            )}

            {/* Services */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center">
                <Icon name="Package" size={18} className="mr-2 text-primary" />
                Available Services ({providerDetails.services?.length || 0})
              </h3>
              
              {providerDetails.services && providerDetails.services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {providerDetails.services.map((service) => {
                    const isSelected = selectedServices.find(s => s.id === service.id);
                    return (
                      <div
                        key={service.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleServiceSelection(service)}
                      >
                        {/* Service Image */}
                        {service.images && service.images.length > 0 && (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                          />
                        )}
                        
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-foreground">{service.title}</h4>
                          {isSelected && (
                            <Icon name="Check" size={20} className="text-primary" />
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">
                            ${service.price}
                          </span>
                          {service.duration_days && (
                            <span className="text-sm text-muted-foreground">
                              {service.duration_days} days
                            </span>
                          )}
                        </div>
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

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-card border-t border-border pt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {selectedServices.length > 0 && (
                  <span>{selectedServices.length} service(s) selected</span>
                )}
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                {selectedServices.length > 0 && (
                  <Button onClick={handleAddServices}>
                    <Icon name="Plus" size={16} />
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
