import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Pour les images critiques
  aspectRatio?: string; // Pour éviter le layout shift
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  placeholder,
  width,
  height,
  priority = false,
  aspectRatio = '16/9'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px' // Charger l'image 50px avant qu'elle soit visible
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.warn(`Failed to load image: ${src}`);
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden img-container ${className}`}
      style={{ 
        width, 
        height,
        aspectRatio: !width && !height ? aspectRatio : undefined
      }}
    >
      {/* Placeholder avec skeleton loader */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 loading-skeleton"
          style={{ 
            backgroundColor: placeholder || '#f3f4f6'
          }}
        />
      )}
      
      {/* Image réelle */}
      {(isInView || priority) && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "low"}
          width={width}
          height={height}
        />
      )}
    </div>
  );
};

export default LazyImage;
