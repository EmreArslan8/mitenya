'use client';

import { useState, useRef, useCallback } from 'react';
import { Box, Portal } from '@mui/material';
import {
  containerSx,
  mainImageSx,
  getLensSx,
  getZoomContainerSx,
  getZoomedImageSx,
} from './styles';

interface ProductImageMagnifierProps {
  src?: string;
  alt?: string;
  zoomLevel?: number;
}

const ProductImageMagnifier = ({ src = '', alt = '', zoomLevel = 2.5 }: ProductImageMagnifierProps) => {
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
      <Box
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        sx={containerSx}
      >
        <Box
          component="img"
          src={src}
          alt={alt}
          sx={mainImageSx}
        />

        {showZoom && (
          <Box sx={getLensSx(lensPosition, lensSize)} />
        )}
      </Box>

      {showZoom && zoomContainerRect && (
        <Portal>
          <Box sx={getZoomContainerSx(zoomContainerRect, window.innerWidth)}>
            <Box
              component="img"
              src={src}
              alt={`${alt} - zoomed`}
              sx={getZoomedImageSx(position, zoomLevel)}
            />
          </Box>
        </Portal>
      )}
    </>
  );
};

export default ProductImageMagnifier;
