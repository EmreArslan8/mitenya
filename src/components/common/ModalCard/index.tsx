import { Modal, Slide, Stack, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import Card, { CardProps } from '../Card';

import Icon from '@/components/Icon';
import useStyles from './styles';
import useScreen from '@/lib/hooks/useScreen';

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
  ...cardProps
}: ModalCardProps) => {
  const styles = useStyles();
  const { isMobile } = useScreen();

  return (
    <Modal
      disableAutoFocus={disableAutoFocus}
      keepMounted={keepMounted}
      open={open}
      onClose={onClose}
      sx={{ ...styles.modal, ...sx }}
    >
      <Slide appear={isMobile} in={open} direction="up" unmountOnExit={!keepMounted}>
        <Card
          {...cardProps}
          sx={{ ...styles.card, ...CardProps?.sx }}
          stickyHeader
          action={showCloseIcon && <Icon name="close" onClick={onClose} />}
        >
          <Stack {...BodyProps} sx={{ ...styles.cardBody, ...BodyProps?.sx }}>
            {children}
          </Stack>
        </Card>
      </Slide>
    </Modal>
  );
};

export default ModalCard;
