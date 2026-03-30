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
    <div className="rounded-xl bg-white/5 p-3 space-y-2 flex flex-col sm:p-3 md:bg-card md:border md:border-border md:rounded-lg md:overflow-hidden md:hover:shadow-lg md:transition-shadow md:h-full md:flex md:flex-col md:p-5">
      <div 
        className="relative w-full h-40 object-cover rounded-lg sm:h-40 md:h-48 cursor-pointer group"
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
              className="w-full h-40 object-cover rounded-lg sm:h-40 md:h-auto md:transition-transform md:group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2 rounded-lg flex items-center gap-1.5 md:gap-2">
                <Icon name="Eye" className="w-4 h-4 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">View Images</span>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-40 object-cover rounded-lg sm:h-40 md:h-auto bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
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
      
      <div className="space-y-2 flex flex-col flex-grow sm:space-y-2 md:p-5 md:flex md:flex-col md:flex-grow">
        <div className="flex items-start justify-between">
          <div className="w-full">
            <h3 className="text-sm font-semibold line-clamp-2 sm:text-sm md:text-lg md:font-semibold md:text-foreground md:mb-1 md:line-clamp-1 md:truncate md:w-full">{service.title}</h3>
            <div className="flex items-center text-xs text-gray-400 sm:text-xs md:text-sm md:text-muted-foreground">
              <Icon name="MapPin" size={12} className="mr-1 shrink-0" />
              <span className="line-clamp-1">{service.location}</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 line-clamp-2 flex-grow sm:text-xs md:text-sm md:text-muted-foreground md:mb-4 md:line-clamp-2 md:flex-grow">
          {service.description}
        </p>
        
        {service.amenities && service.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-2 md:gap-2 md:mb-4">
            {service.amenities.slice(0, 2).map((amenity, idx) => (
              <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full line-clamp-1 max-w-[100px] truncate sm:px-2 md:px-2 md:py-1 md:text-[11px]">
                {amenity}
              </span>
            ))}
          </div>
        )}
        
        {/* Payment Methods Display */}
        {service?.payment_methods && Object.keys(service.payment_methods).some(key => service.payment_methods[key]?.enabled) && (
          <div className="p-2 bg-muted/30 rounded-lg sm:p-2 md:mb-3 md:p-2 md:bg-muted/30 md:rounded-lg">
            <p className="text-xs font-medium text-gray-300 sm:text-xs md:text-xs md:font-medium md:text-muted-foreground md:mb-1.5">Accepted Payments:</p>
            <div className="flex flex-wrap gap-2 sm:gap-2 md:gap-1.5">
              {service.payment_methods.visa?.enabled && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded text-xs sm:px-2 md:px-2 md:py-0.5 md:text-xs">
                  <Icon name="CreditCard" size={10} className="mr-1 shrink-0 sm:mr-1 md:mr-1" />
                  Visa/Card
                </span>
              )}
              {service.payment_methods.paypal?.enabled && (
                <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded text-xs sm:px-2 md:px-2 md:py-0.5 md:text-xs">
                  PayPal
                </span>
              )}
              {service.payment_methods.mobileMoney?.enabled && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs sm:px-2 md:px-2 md:py-0.5 md:text-xs">
                  <Icon name="Smartphone" size={10} className="mr-1 shrink-0 sm:mr-1 md:mr-1" />
                  M-Money
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center text-xs border-t border-border pt-2 mt-auto sm:text-xs md:pt-4 md:border-t md:border-border">
          <div className="w-full">
            <div className="text-sm font-bold text-foreground truncate sm:text-sm md:text-2xl md:font-bold md:text-foreground md:truncate">TZS {parseFloat(service.price || 0).toLocaleString()}</div>
            <div className="text-xs text-gray-300 flex items-center gap-1 line-clamp-1 sm:text-xs md:text-xs md:text-muted-foreground md:flex md:items-center md:gap-1 md:line-clamp-1">
              by <span className="truncate max-w-[80px] md:max-w-[150px]">{service.provider_name || service.business_name}</span>
              {service.provider_badge_type && (
                 <ProviderBadge badgeType={service.provider_badge_type} size="xs" showText={false} />
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-3 sm:gap-2 md:gap-2 md:mt-4">
          <div className="flex gap-2 sm:gap-2 md:gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 py-2 px-4 text-sm rounded-lg sm:flex-1 sm:py-2 sm:px-4 sm:text-sm sm:rounded-lg md:text-sm md:py-2 md:h-auto"
              onClick={() => onViewDetails && onViewDetails(service)}
            >
              <Icon name="Eye" className="w-4 h-4 mr-2 sm:w-4 sm:h-4 sm:mr-2 md:w-3.5 md:h-3.5 md:mr-2" />
              View
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className="flex-1 py-2 px-4 text-sm rounded-lg sm:flex-1 sm:py-2 sm:px-4 sm:text-sm sm:rounded-lg md:text-sm md:py-2 md:h-auto"
              onClick={() => onAddToCart && onAddToCart(service)}
            >
              <Icon name="ShoppingCart" className="w-4 h-4 mr-2 sm:w-4 sm:h-4 sm:mr-2 md:w-3.5 md:h-3.5 md:mr-2" />
              Cart
            </Button>
          </div>
          <Button 
            size="sm"
            className="w-full py-3 text-sm font-semibold rounded-lg bg-primary hover:bg-primary/90 sm:w-full sm:py-3 sm:text-sm sm:font-semibold sm:rounded-lg md:bg-primary md:hover:bg-primary/90 md:text-sm md:py-3 md:h-auto md:leading-none"
            onClick={() => onBookNow && onBookNow(service)}
          >
            <Icon name="CreditCard" className="w-4 h-4 mr-2 sm:w-4 sm:h-4 sm:mr-2 md:w-4 md:h-4 md:mr-2" />
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
