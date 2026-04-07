import React from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import ProviderBadge from './ui/ProviderBadge';

const ServiceCard = ({ 
  service, 
  onViewImages, 
  onViewDetails, 
  onAddToCart, 
  onBookNow,
  isFavorite,
  onToggleFavorite,
  favoriteLoading
}) => {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <div 
        className="relative h-40 md:h-48 cursor-pointer group"
        onClick={() => {
          if (service.images && service.images.length > 0 && onViewImages) {
            onViewImages(service);
          }
        }}
      >
        {service.images && service.images.length > 0 ? (
          <>
            <img 
              src={service.images[0]} 
              alt={service.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded-lg flex items-center gap-1.5 md:gap-2">
                <Icon name="Eye" className="w-4 h-4 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">View Images</span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Icon name="Package" className="w-10 h-10 md:w-12 md:h-12 text-primary/40" />
          </div>
        )}
        
        {/* Favorite Icon (if props provided) */}
        {onToggleFavorite && (
          <button 
            className={`absolute top-2 right-2 md:top-3 md:right-3 w-7 h-7 md:w-8 md:h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-colors shadow-sm z-10 ${
              isFavorite 
                ? 'bg-red-500 hover:bg-red-600 outline-none' 
                : 'bg-white/80 hover:bg-white'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e, service);
            }}
            disabled={favoriteLoading}
          >
            {favoriteLoading ? (
              <Icon name="Loader2" size={14} className="animate-spin text-muted-foreground" />
            ) : (
              <Icon 
                name="Heart" 
                size={14} 
                className={isFavorite ? 'text-white fill-white' : 'text-muted-foreground'} 
              />
            )}
          </button>
        )}

        {service.images && service.images.length > 1 && (
          <div className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] md:text-xs font-medium flex items-center gap-1">
            <Icon name="Image" size={12} />
            {service.images.length}
          </div>
        )}
        
        {/* Rating Badge */}
        <div className={`absolute ${onToggleFavorite ? 'bottom-2 right-2' : 'top-2 right-2'} bg-white/90 backdrop-blur-sm px-2 md:px-3 py-0.5 md:py-1 rounded-full`}>
          <div className="flex items-center gap-1">
            <Icon name="Star" size={12} className="text-yellow-500" />
            <span className="text-xs md:text-sm font-semibold">{(service.average_rating > 0 ? parseFloat(service.average_rating).toFixed(1) : parseFloat(service.rating || 0).toFixed(1)) || 'New'}</span>
          </div>
        </div>
        
        <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-0.5 md:py-1 rounded-md text-[10px] md:text-xs font-medium">
          {service.category}
        </div>
      </div>
      
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-1.5 md:mb-2">
          <div className="w-full">
            <h3 className="text-sm md:text-lg font-semibold text-foreground mb-0.5 md:mb-1 line-clamp-1 truncate w-full">{service.title}</h3>
            <div className="flex items-center text-xs md:text-sm text-muted-foreground">
              <Icon name="MapPin" size={12} className="mr-1 shrink-0" />
              <span className="line-clamp-1">{service.location}</span>
            </div>
          </div>
        </div>
        
        {/* Description - Hidden on mobile, shown on desktop */}
        <p className="max-md:hidden text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
          {service.description}
        </p>
        
        {service.amenities && service.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 md:gap-2 mb-2 md:mb-4">
            {service.amenities.slice(0, 2).map((amenity, idx) => (
              <span key={idx} className="px-1.5 md:px-2 py-0.5 md:py-1 bg-primary/10 text-primary text-[10px] md:text-[11px] rounded-full line-clamp-1 max-w-[100px] truncate">
                {amenity}
              </span>
            ))}
          </div>
        )}
        
        {/* Payment Methods Display - Hidden on mobile, shown on desktop */}
        {service?.payment_methods && Object.keys(service.payment_methods).some(key => service.payment_methods[key]?.enabled) && (
          <div className="hidden md:block mb-3 p-2 bg-muted/30 rounded-lg">
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Accepted Payments:</p>
            <div className="flex flex-wrap gap-1.5">
              {service.payment_methods.visa?.enabled && (
                <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                  <Icon name="CreditCard" size={10} className="mr-1 shrink-0" />
                  Visa/Card
                </span>
              )}
              {service.payment_methods.paypal?.enabled && (
                <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                  PayPal
                </span>
              )}
              {service.payment_methods.mobileMoney?.enabled && (
                <span className="inline-flex items-center px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                  <Icon name="Smartphone" size={10} className="mr-1 shrink-0" />
                  M-Money
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 md:pt-4 mt-auto border-t border-border">
          <div className="w-full">
            <div className="text-sm md:text-2xl font-bold text-foreground truncate">TZS {parseFloat(service.price || 0).toLocaleString()}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1 line-clamp-1">
              by <span className="truncate max-w-[80px] md:max-w-[150px]">{service.provider_name || service.business_name}</span>
              {service.provider_badge_type && (
                 <ProviderBadge badgeType={service.provider_badge_type} size="xs" showText={false} />
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons - Mobile: View only, Desktop: All buttons */}
        <div className="flex flex-col gap-1.5 md:gap-2 mt-3 md:mt-4">
          {/* Mobile: Only View button */}
          <Button 
            variant="outline"
            size="sm"
            className="w-full md:hidden text-[10px] py-1.5 h-auto dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
            onClick={() => onViewDetails && onViewDetails(service)}
          >
            <Icon name="Eye" className="w-3 h-3 mr-1" />
            View
          </Button>
          
          {/* Desktop: All buttons */}
          <div className="hidden md:flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 text-sm py-2 h-auto dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
              onClick={() => onViewDetails && onViewDetails(service)}
            >
              <Icon name="Eye" className="w-3.5 h-3.5 mr-2" />
              View
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 text-sm py-2 h-auto dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
              onClick={() => onAddToCart && onAddToCart(service)}
            >
              <Icon name="ShoppingCart" className="w-3.5 h-3.5 mr-2" />
              Cart
            </Button>
          </div>
          <Button 
            size="sm"
            className="hidden md:block w-full bg-primary hover:bg-primary/90 text-sm py-3 h-auto leading-none"
            onClick={() => onBookNow && onBookNow(service)}
          >
            <Icon name="CreditCard" className="w-4 h-4 mr-2" />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
