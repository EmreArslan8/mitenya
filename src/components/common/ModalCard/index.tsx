import { Modal, Slide, Stack, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import Card, { CardProps } from '../Card';
import useStyles from './styles';
import useScreen from '@/lib/hooks/useScreen';
import { SlidersHorizontal, X } from 'lucide-react';

type ModalCardLayout = 'dialog' | 'bottom-sheet';

export interface ModalCardProps extends CardProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  showCloseIcon?: boolean;
  fullWidth?: boolean;
  layout?: ModalCardLayout;
  bottomOffset?: number | string;
  keepMounted?: boolean;
  disableAutoFocus?: boolean;
  CardProps?: { sx?: SxProps };
  BodyProps?: { sx?: SxProps };
}

const ModalCard = ({
  open,
  onClose,
  children,
  sx,
  showCloseIcon = false,
  fullWidth = false,
  layout = 'dialog',
  bottomOffset = 0,
  keepMounted,
  disableAutoFocus,
  CardProps,
  BodyProps,
  iconName,
  customIcon,
  iconProps,
  ...cardProps
}: ModalCardProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();
  const isBottomSheet = layout === 'bottom-sheet';
  const isWideLayout = fullWidth || isBottomSheet;
  const modalIcon =
    customIcon ||
    (iconName === 'tune' ? (
      <Stack component="span" sx={{ color: 'primary.main', display: 'inline-flex' }}>
        <SlidersHorizontal size={24} color="currentColor" />
      </Stack>
    ) : undefined);

  return (
    <Modal
      disableAutoFocus={disableAutoFocus}
      keepMounted={keepMounted}
      open={open}
      onClose={onClose}
      sx={{
        ...styles.modal,
        ...(isBottomSheet
          ? {
              p: 0,
              mb: bottomOffset,
              alignItems: 'end',
              justifyContent: 'center',
              '& .MuiSlide-root': { width: '100%' },
              '& .MuiBackdrop-root': { bottom: bottomOffset },
            }
          : {}),
        ...sx,
      }}
    >
  <Slide appear={isMobile} in={open} direction="up" unmountOnExit={!keepMounted}>
  <div tabIndex={-1} style={{ outline: 'none', width: isWideLayout ? '100%' : undefined, maxWidth: '100vw' }}>
    <Card
      {...cardProps}
      iconName={iconName === 'tune' ? undefined : iconName}
      iconProps={iconProps}
      customIcon={modalIcon}
      sx={{
        ...styles.card,
        ...(isWideLayout ? { width: '100%', maxWidth: '100%' } : {}),
        ...(isBottomSheet ? { borderRadius: '16px 16px 0 0' } : {}),
        ...CardProps?.sx,
      }}
      stickyHeader
      action={ showCloseIcon && (
        <Stack component="span" onClick={onClose}sx={{ cursor: onClose ? 'pointer' : 'default' }} >
          <X size={20} />
        </Stack>
      )}
    >
      <Stack {...BodyProps} sx={{ ...styles.cardBody, ...BodyProps?.sx }}>
        {children}
      </Stack>
    </Card>
  </div>
</Slide>

    </Modal>
  );
};

export default ModalCard;
