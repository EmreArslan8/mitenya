import { Modal, Slide, Stack, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import Card, { CardProps } from '../Card';
import useStyles from './styles';
import useScreen from '@/lib/hooks/useScreen';
import { SlidersHorizontal, X } from 'lucide-react';

export interface ModalCardProps extends CardProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  showCloseIcon?: boolean;
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
      sx={{ ...styles.modal, ...sx }}
    >
  <Slide appear={isMobile} in={open} direction="up" unmountOnExit={!keepMounted}>
  <div tabIndex={-1} style={{ outline: "none" }}>
    <Card
      {...cardProps}
      iconName={iconName === 'tune' ? undefined : iconName}
      iconProps={iconProps}
      customIcon={modalIcon}
      sx={{ ...styles.card, ...CardProps?.sx }}
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
