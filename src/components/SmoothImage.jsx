import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

// Image that fades in once decoded instead of popping in line by line.
// Pair it with a background colour on the wrapper so the space isn't empty while loading.
const SmoothImage = ({ src, alt = '', className = '', eager = false, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setLoaded(false);
    // Already in the browser cache — show immediately, no fade
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      className={cn('transition-opacity duration-300 ease-out', loaded ? 'opacity-100' : 'opacity-0', className)}
      {...props}
    />
  );
};

export default SmoothImage;
