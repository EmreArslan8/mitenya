import { Modal, Slide, Stack, SxProps } from '@mui/material';
import { CloseIcon } from '@/components/icons';
import { ReactNode } from 'react';
import Card, { CardProps } from '../Card';
import useStyles from './styles';
import useScreen from '@/lib/hooks/useScreen';

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
  customIcon,
  ...cardProps
}: ModalCardProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();
  const isBottomSheet = layout === 'bottom-sheet';
  const isWideLayout = fullWidth || isBottomSheet;


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
  <div tabIndex={-1} style={{ outline: 'none', width: isWideLayout ? '100%' : undefined }}>
    <Card
      {...cardProps}
      customIcon={customIcon}
      sx={{
        ...styles.card,
        ...(isWideLayout ? { width: '100%', maxWidth: '100%' } : {}),
        ...(isBottomSheet ? { borderRadius: '16px 16px 0 0' } : {}),
        ...CardProps?.sx,
      }}
      stickyHeader
      action={
        showCloseIcon && (
          <Stack
            component="span"
            onClick={onClose}
            sx={{
              display: 'inline-flex',
              cursor: onClose ? 'pointer' : 'default',
              /* Masaüstünde 20px fazla ufak kalıyordu. */
              '& svg': { width: { xs: 20, sm: 28 }, height: { xs: 20, sm: 28 } },
            }}
          >
            <CloseIcon size={28} />
          </Stack>
        )
      }
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
