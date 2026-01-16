import React from 'react';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  // Log image loading for debugging
  const handleError = (e) => {
    console.error('❌ Image failed to load:', src);
    console.error('   Attempted URL:', e.target.src);
    e.target.src = "/assets/images/no_image.png";
  };

  const handleLoad = () => {
    if (src && !src.includes('no_image')) {
      console.log('✅ Image loaded successfully:', src);
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
}

export default Image;
