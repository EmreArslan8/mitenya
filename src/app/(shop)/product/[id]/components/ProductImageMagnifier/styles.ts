import { SxProps, Theme } from '@mui/material';

export const containerSx: SxProps<Theme> = {
  position: 'relative',
  width: '100%',
  height: '100%',
  cursor: 'crosshair',
  overflow: 'hidden',
};

export const mainImageSx: SxProps<Theme> = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  display: 'block',
};

export const getLensSx = (lensPosition: { x: number; y: number }, lensSize: number): SxProps<Theme> => ({
  position: 'absolute',
  left: lensPosition.x,
  top: lensPosition.y,
  width: lensSize,
  height: lensSize,
  border: '2px solid rgba(0, 0, 0, 0.3)',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  pointerEvents: 'none',
  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.15)',
});

export const getZoomContainerSx = (
  zoomContainerRect: DOMRect,
  windowWidth: number
): SxProps<Theme> => ({
  position: 'fixed',
  left: zoomContainerRect.right + 20,
  top: zoomContainerRect.top,
  width: Math.min(500, windowWidth - zoomContainerRect.right - 40),
  height: zoomContainerRect.height,
  backgroundColor: '#fff',
  border: '1px solid #e0e0e0',
  borderRadius: 1,
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  overflow: 'hidden',
  zIndex: 1300,
  pointerEvents: 'none',
});

export const getZoomedImageSx = (
  position: { x: number; y: number },
  zoomLevel: number
): SxProps<Theme> => ({
  position: 'absolute',
  width: `${zoomLevel * 100}%`,
  height: `${zoomLevel * 100}%`,
  maxWidth: 'none',
  objectFit: 'contain',
  left: `${-position.x * zoomLevel + 50}%`,
  top: `${-position.y * zoomLevel + 50}%`,
  transform: 'translate(0, 0)',
});
