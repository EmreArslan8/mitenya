declare module 'react-image-magnifiers' {
  import { ComponentType, CSSProperties, ReactNode } from 'react';

  interface CommonMagnifierProps {
    imageSrc: string | string[];
    imageAlt?: string;
    style?: CSSProperties;
    className?: string;
    cursorStyle?: string;
    overlayOpacity?: number;
    overlayBoxOpacity?: number;
    transitionSpeed?: number;
    renderOverlay?: (isActive: boolean) => ReactNode;
    onImageLoad?: () => void;
  }

  interface SideBySideMagnifierProps {
    imageSrc: string;
    imageAlt?: string;
    alwaysInPlace?: boolean;
    fillAvailableSpace?: boolean;
    cursorStyle?: string;
    largeImageSrc?: string;
    overlayOpacity?: number;
    overlayBoxOpacity?: number;
    overlayBackgroundColor?: string;
    overlayBoxColor?: string;
    overlayBoxImage?: string;
    overlayBoxImageSize?: string;
    transitionSpeed?: number;
    transitionSpeedInPlace?: number;
    switchSides?: boolean;
    fillAlignTop?: boolean;
    fillGapLeft?: number;
    fillGapRight?: number;
    fillGapTop?: number;
    fillGapBottom?: number;
    zoomContainerBorder?: string;
    zoomContainerBoxShadow?: string;
  }

  export const SideBySideMagnifier: ComponentType<SideBySideMagnifierProps>;

  interface MagnifierContainerProps {
    style?: CSSProperties;
    className?: string;
    children?: ReactNode;
  }

  interface MagnifierPreviewProps extends CommonMagnifierProps {}

  interface MagnifierZoomProps extends CommonMagnifierProps {}

  export const MagnifierContainer: ComponentType<MagnifierContainerProps>;
  export const MagnifierPreview: ComponentType<MagnifierPreviewProps>;
  export const MagnifierZoom: ComponentType<MagnifierZoomProps>;
}
