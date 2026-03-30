import React from 'react';
import Icon from './AppIcon';

const RatingStars = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 20, 
  interactive = false, 
  onChange = null,
  showValue = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  
  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };
  
  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };
  
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };
  
  const displayRating = hoverRating || rating;
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`${
              interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
            } focus:outline-none`}
          >
            <Icon
              name="Star"
              size={size}
              className={`${
                isFilled 
                  ? 'text-yellow-500 fill-yellow-500' 
                  : 'text-gray-300 dark:text-gray-600'
              } transition-colors`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
