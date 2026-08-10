import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = '/images/saree_banarasi_red.png',
  className = '',
  containerClassName = '',
  onError,
  onLoad,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImgSrc(src);
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${containerClassName || 'w-full h-full'}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-amber-100/30 animate-pulse z-0" />
      )}
      <img
        ref={imgRef}
        src={imgSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={(e) => {
          setLoaded(true);
          if (onLoad) onLoad(e);
        }}
        onError={(e) => {
          setLoaded(true);
          if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
          }
          if (onError) onError(e);
        }}
        className={`${className} transition-opacity duration-200 ease-out ${
          loaded ? 'opacity-100' : 'opacity-90'
        }`}
        {...props}
      />
    </div>
  );
};
