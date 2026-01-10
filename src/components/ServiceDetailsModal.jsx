import React from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import VerifiedBadge from './ui/VerifiedBadge';
import { bookingsAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';

const ServiceDetailsModal = ({ isOpen, onClose, service }) => {
  if (!isOpen || !service) return null;
  const { addToCart } = useCart();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            {service.title || service.name}
            {service.provider_verified && <VerifiedBadge size="sm" />}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="X" size={24} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Images */}
          {service.images && service.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {service.images.map((image, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={`${service.title} - ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

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
            {service.rating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-lg">
                <Icon name="Star" size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-foreground">{service.rating.toFixed(1)}</span>
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
          {service.amenities && service.amenities.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Icon name="CheckCircle" size={20} />
                Amenities & Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {service.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-foreground">
                    <Icon name="Check" size={16} className="text-green-500" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

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
        </div>

        {/* Footer with Action Buttons */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Price</p>
            <p className="text-2xl font-bold text-primary">TZS {service.price?.toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                const savedUser = localStorage.getItem('isafari_user');
                if (!savedUser) {
                  window.location.href = '/login';
                  return;
                }
                
                try {
                  await addToCart(service);
                  alert('✅ Added to cart!');
                  onClose();
                } catch (error) {
                  console.error('Error adding to cart:', error);
                  alert('❌ Error adding to cart: ' + error.message);
                }
              }}
              size="lg"
              className="flex items-center gap-2"
            >
              <Icon name="ShoppingBag" size={20} />
              Add to Cart
            </Button>
            <Button
              onClick={async () => {
                const savedUser = localStorage.getItem('isafari_user');
                if (!savedUser) {
                  window.location.href = '/login';
                  return;
                }
                
                try {
                  // Add to cart first
                  const bookingItem = {
                    id: service.id,
                    name: service.title || service.name,
                    title: service.title || service.name,
                    price: parseFloat(service.price || 0),
                    quantity: 1,
                    image: service.images && service.images.length > 0 ? service.images[0] : null,
                    description: service.description,
                    type: 'service',
                    category: service.category,
                    location: service.location,
                    provider_id: service.provider_id,
                    business_name: service.businessName || service.business_name
                  };
                  
                  await addToCart(bookingItem);
                  // Navigate to cart & payment
                  window.location.href = '/traveler-dashboard?tab=cart&openPayment=true';
                } catch (error) {
                  console.error('Error adding to cart:', error);
                  alert('❌ Error: ' + error.message);
                }
              }}
              size="lg"
              className="flex items-center gap-2"
            >
              <Icon name="CreditCard" size={20} />
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
