'use client';

import { useState, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import { createPortal } from 'react-dom';

interface ProductImageMagnifierProps {
  /** HAM kaynak. srcset'i next/image loader'i uretir. */
  src?: string;
  /**
   * Buyutec katmaninin kullandigi yuksek cozunurluklu URL. Ayri tutuluyor
   * cunku buyutecte gorsel %250 olceklendiginden ekran boyutuna gore secilen
   * responsive aday yetmez. Cagiran taraf bunu masaustunde ana gorselin
   * indirdigi URL ile AYNI uretirse tarayici ikinci bir istek yapmaz.
   */
  zoomSrc?: string;
  sizes?: string;
  quality?: number;
  alt?: string;
  zoomLevel?: number;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
}

const ProductImageMagnifier = ({
  src = '',
  zoomSrc,
  sizes,
  quality,
  alt = '',
  zoomLevel = 2.5,
  loading = 'eager',
  fetchPriority = 'auto',
}: ProductImageMagnifierProps) => {
  const [showZoom, setShowZoom] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomContainerRect, setZoomContainerRect] = useState<DOMRect | null>(null);

  const lensSize = 120;

  const handleMouseEnter = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setZoomContainerRect(rect);
    }
    setShowZoom(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setShowZoom(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setPosition({ x: xPercent, y: yPercent });

    const lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
    const lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));

    setLensPosition({ x: lensX, y: lensY });
    setZoomContainerRect(rect);
  }, [lensSize]);

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        className="relative size-full cursor-crosshair overflow-hidden"
      >
        {src && (
          <NextImage
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            quality={quality}
            loading={loading}
            fetchPriority={fetchPriority}
            style={{ objectFit: 'contain' }}
          />
        )}

        {showZoom && (
          <span
            className="pointer-events-none absolute border-2 border-black/30 bg-white/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.15)]"
            style={{ left: lensPosition.x, top: lensPosition.y, width: lensSize, height: lensSize }}
          />
        )}
      </div>

      {showZoom && zoomContainerRect && createPortal(
          <div
            className="pointer-events-none fixed z-[1300] overflow-hidden rounded-lg border border-[#e0e0e0] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
            style={{ left: zoomContainerRect.right + 20, top: zoomContainerRect.top, width: Math.min(500, window.innerWidth - zoomContainerRect.right - 40), height: zoomContainerRect.height }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomSrc ?? src}
              alt={`${alt} - zoomed`}
              className="absolute max-w-none object-contain"
              style={{ width: `${zoomLevel * 100}%`, height: `${zoomLevel * 100}%`, left: `${-position.x * zoomLevel + 50}%`, top: `${-position.y * zoomLevel + 50}%` }}
            />
          </div>,
          document.body,
      )}
    </>
  );
};

export default ProductImageMagnifier;
