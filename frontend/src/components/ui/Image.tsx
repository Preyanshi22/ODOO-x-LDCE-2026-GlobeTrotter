import { useState, type ImgHTMLAttributes } from 'react';
export function SafeImage({ alt, className = '', ...props }: ImgHTMLAttributes<HTMLImageElement>) { const [failed, setFailed] = useState(false); return failed ? <div className={`image-fallback ${className}`} aria-label={alt}><span>✦</span></div> : <img {...props} alt={alt} className={className} onError={() => setFailed(true)} />; }
