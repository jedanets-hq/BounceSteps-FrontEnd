import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import VerifiedBadge from './ui/VerifiedBadge';
import RatingStars from './RatingStars';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import { bookingsAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useFavorites } from '../contexts/FavoritesContext';

const ServiceDetailsModal = ({ isOpen, onClose, service, providerInfo }) => {
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [isFav, setIsFav] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'reviews'

  useEffect(() => {
    if (service?.id) {
      setIsFav(isFavorite('service', service.id));
      setShowReviewForm(false);
      setActiveTab('details');
    }
  }, [service, isFavorite]);

  const handleToggleFavorite = async () => {
    if (!service?.id) return;
    
    const savedUser = localStorage.getItem('isafari_user');
    if (!savedUser) {
      alert('Please login to add favorites');
      window.location.href = '/login';
      return;
    }

    setLoadingFavorite(true);
    try {
      if (isFav) {
        const success = await removeFromFavorites('service', service.id);
        if (success) {
          setIsFav(false);
        }
      } else {
        const success = await addToFavorites('service', service.id);
        if (success) {
          setIsFav(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoadingFavorite(false);
    }
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            {service.title || service.name}
            {service.provider_verified && <VerifiedBadge size="sm" />}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleFavorite}
              disabled={loadingFavorite}
              className={`p-2 rounded-lg transition-colors ${
                isFav 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Icon 
                name="Heart" 
                size={24} 
                className={isFav ? 'fill-current' : ''} 
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="X" size={24} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-4 border-b border-border">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'details'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Details
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                activeTab === 'reviews'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Reviews
              {activeTab === 'reviews' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <>
          {/* Images */}
          {(() => {
            const images = Array.isArray(service.images) 
              ? service.images 
              : (typeof service.images === 'string' && service.images.trim() !== '' 
                  ? [service.images] 
                  : []);
            
            return images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={`${service.title} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Provider Info */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Building2" size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground flex items-center gap-2">
                {service.businessName || service.provider?.name || 'Provider'}
                {service.provider_verified && <VerifiedBadge size="xs" />}
              </p>
              {service.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Icon name="MapPin" size={14} />
                  {service.location}
                </p>
              )}
            </div>
            {(service.rating > 0 || service.average_rating > 0) && (
              <div className="flex flex-col items-end gap-1">
                <RatingStars 
                  rating={service.average_rating || service.rating || 0} 
                  size={16} 
                  showValue={true}
                />
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-xs text-primary hover:underline"
                >
                  View reviews
                </button>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Price per person</p>
              <p className="text-3xl font-bold text-primary">TZS {service.price?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                <Icon name="Tag" size={14} />
                {service.category}
              </p>
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                <Icon name="FileText" size={20} />
                Description
              </h3>
              <p className="text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          )}

          {/* Amenities */}
          {(() => {
            const amenities = Array.isArray(service.amenities) 
              ? service.amenities 
              : [];
            
            return amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Icon name="CheckCircle" size={20} />
                  Amenities & Features
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                      <Icon name="Check" size={16} className="text-green-500" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Payment Methods */}
          {service.payment_methods && Object.keys(service.payment_methods).some(key => service.payment_methods[key]?.enabled) && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="CreditCard" size={20} />
                Accepted Payment Methods
              </h3>
              <div className="flex flex-wrap gap-3">
                {service.payment_methods.visa?.enabled && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
                    <Icon name="CreditCard" size={18} />
                    <span className="font-medium">Visa/Mastercard</span>
                  </div>
                )}
                {service.payment_methods.paypal?.enabled && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg">
                    <Icon name="DollarSign" size={18} />
                    <span className="font-medium">PayPal</span>
                  </div>
                )}
                {service.payment_methods.googlePay?.enabled && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
                    <Icon name="Smartphone" size={18} />
                    <span className="font-medium">Google Pay</span>
                  </div>
                )}
                {service.payment_methods.mobileMoney?.enabled && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg">
                    <Icon name="Smartphone" size={18} />
                    <span className="font-medium">Mobile Money</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {service.contact_info && (service.contact_info.email?.enabled || service.contact_info.whatsapp?.enabled || service.contact_info.phone?.enabled) && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="Phone" size={20} />
                Contact Information
              </h3>
              <div className="space-y-2">
                {service.contact_info.whatsapp?.enabled && service.contact_info.whatsapp?.number && (
                  <a
                    href={`https://wa.me/${service.contact_info.whatsapp.number.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Icon name="MessageCircle" size={20} />
                    <div>
                      <p className="font-medium">WhatsApp</p>
                      <p className="text-sm">{service.contact_info.whatsapp.number}</p>
                    </div>
                  </a>
                )}
                {service.contact_info.email?.enabled && service.contact_info.email?.address && (
                  <a
                    href={`mailto:${service.contact_info.email.address}`}
                    className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Icon name="Mail" size={20} />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm">{service.contact_info.email.address}</p>
                    </div>
                  </a>
                )}
                {service.contact_info.phone?.enabled && service.contact_info.phone?.number && (
                  <a
                    href={`tel:${service.contact_info.phone.number}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Icon name="Phone" size={20} />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm">{service.contact_info.phone.number}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          )}
            </>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {showReviewForm ? (
                <div className="bg-muted/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Write Your Review
                  </h3>
                  <ReviewForm
                    serviceId={service.id}
                    onSubmit={(review) => {
                      setShowReviewForm(false);
                      // Refresh reviews list
                      window.location.reload();
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              ) : (
                <ReviewsList
                  serviceId={service.id}
                  showAddReview={true}
                  onAddReview={() => {
                    const savedUser = localStorage.getItem('isafari_user');
                    if (!savedUser) {
                      alert('Please login to write a review');
                      window.location.href = '/login';
                      return;
                    }
                    setShowReviewForm(true);
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Price</p>
            <p className="text-2xl font-bold text-primary">TZS {service.price?.toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const savedUser = localStorage.getItem('isafari_user');
                if (!savedUser) {
                  window.location.href = '/login';
                  return;
                }
                
                console.log('🔍 [Chat Button - ServiceDetailsModal] Service data:', {
                  provider_user_id: service?.provider_user_id,
                  provider_id: service?.provider_id,
                  providerId: service?.providerId,
                  business_name: service?.business_name
                });
                
                const providerUserId = service.provider_user_id || providerInfo?.user_id;
                
                if (!providerUserId) {
                  console.error('❌ [Chat Button] No valid provider ID found!');
                  alert('Error: Unable to start chat. Provider information is incomplete.');
                  return;
                }
                
                // Open messaging modal with provider info
                const messagingEvent = new CustomEvent('openMessaging', {
                  detail: {
                    providerId: providerUserId,
                    providerName: service.businessName || service.provider?.name || service.business_name || 'Provider',
                    serviceId: service.id,
                    serviceName: service.title || service.name
                  }
                });
                window.dispatchEvent(messagingEvent);
                onClose();
              }}
              size="lg"
              className="flex items-center gap-2"
            >
              <Icon name="MessageCircle" size={20} />
              Chat with Provider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
