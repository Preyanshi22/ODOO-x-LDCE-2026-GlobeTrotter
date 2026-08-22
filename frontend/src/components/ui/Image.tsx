import { useState, useEffect, type ImgHTMLAttributes } from 'react';

const GENERAL_FALLBACK = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=85';

export function SafeImage({ src, alt, className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [currentSrc, setCurrentSrc] = useState(src || GENERAL_FALLBACK);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || GENERAL_FALLBACK);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(GENERAL_FALLBACK);
    }
  };

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt || 'Travel destination'}
      className={className}
      onError={handleError}
    />
  );
}
