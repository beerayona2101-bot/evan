import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

// Global session memory cache of loaded image URLs to eliminate flash/skeletons on page transitions
const imageSessionCache = new Set<string>();

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/saree_banarasi_red.png',
  className = '',
  containerClassName = '',
  priority = false,
  onError,
  onLoad,
  ...props
}) => {
  const isAlreadyLoaded = imageSessionCache.has(src);
  const [loaded, setLoaded] = useState<boolean>(isAlreadyLoaded);
  const [imgSrc, setImgSrc] = useState<string>(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImgSrc(src);
    if (imageSessionCache.has(src) || (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0)) {
      setLoaded(true);
      imageSessionCache.add(src);
    } else {
      setLoaded(false);
    }
  }, [src]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    imageSessionCache.add(imgSrc);
    setLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      imageSessionCache.add(fallbackSrc);
    }
    if (onError) onError(e);
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName || 'w-full h-full'}`}>
      {!loaded && !isAlreadyLoaded && (
        <div className="absolute inset-0 bg-amber-100/25 animate-pulse z-0" />
      )}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...({ fetchpriority: priority ? 'high' : 'auto' } as any)}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} transition-opacity duration-200 ease-out ${
          loaded || isAlreadyLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
