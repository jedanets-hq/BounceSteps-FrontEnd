import React, { useState, useEffect } from 'react';

const ImageOptimizer = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height, 
  quality = 85,
  loading = 'lazy',
  fallback = '/api/placeholder/400/300'
}) => {
  const [imageSrc, setImageSrc] = useState(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Image optimization function
  const optimizeImage = (originalSrc, targetWidth, targetHeight, quality) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate optimal dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let newWidth = targetWidth || img.width;
        let newHeight = targetHeight || img.height;
        
        if (targetWidth && !targetHeight) {
          newHeight = targetWidth / aspectRatio;
        } else if (targetHeight && !targetWidth) {
          newWidth = targetHeight * aspectRatio;
        }
        
        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to optimized format
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        resolve(optimizedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = originalSrc;
    });
  };

  useEffect(() => {
    if (!src) {
      setImageSrc(fallback);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    // If it's already a data URL (uploaded image), use it directly
    if (src.startsWith('data:')) {
      setImageSrc(src);
      setIsLoading(false);
      return;
    }

    // For external URLs, try to optimize
    optimizeImage(src, width, height, quality)
      .then(optimizedSrc => {
        setImageSrc(optimizedSrc);
        setIsLoading(false);
      })
      .catch(() => {
        // If optimization fails, use original or fallback
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          setIsLoading(false);
        };
        img.onerror = () => {
          setImageSrc(fallback);
          setHasError(true);
          setIsLoading(false);
        };
        img.src = src;
      });
  }, [src, width, height, quality, fallback]);

  if (isLoading) {
    return (
      <div 
        className={`bg-muted animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (imageSrc !== fallback) {
          setImageSrc(fallback);
          setHasError(true);
        }
      }}
      style={{ 
        width: width || 'auto', 
        height: height || 'auto',
        objectFit: 'cover'
      }}
    />
  );
};

export default ImageOptimizer;
