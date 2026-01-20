import React, { useState } from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      // Try fallback image first
      e.target.src = "/assets/images/no_image.png";
    } else {
      // If fallback also fails, show a placeholder div
      e.target.style.display = 'none';
      const placeholder = document.createElement('div');
      placeholder.className = `${className} bg-gray-200 flex items-center justify-center text-gray-500 text-sm`;
      placeholder.textContent = alt || 'Image unavailable';
      placeholder.style.minHeight = '100px';
      e.target.parentNode?.appendChild(placeholder);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
      {...props}
    />
  );
}

export default Image;
