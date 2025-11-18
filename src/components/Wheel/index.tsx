import { Wheel } from 'react-custom-roulette';
import { Stack, Typography } from '@mui/material';
import styles from './styles';
import ModalCard from '../common/ModalCard';
import copyTextOnClick from '@/lib/utils/copyTextOnClick';
import Button from '../common/Button';
import Icon from '../Icon';
import { wheelItems } from '@/lib/utils/wheelItems';

const WheelOfPrizes = ({
  open,
  onClose,
  mustStartSpinning,
  prizeNumber,
  onSpinClick,
  onStopSpinning,
  selectedCoupon,
  isResultModalOpen,
}: {
  open: boolean;
  onClose: () => void;
  mustStartSpinning: boolean;
  prizeNumber: number;
  onSpinClick: () => void;
  onStopSpinning: () => void;
  selectedCoupon: { code: string; option: string } | null;
  isResultModalOpen: boolean;
}) => {
  const t = useTranslations('shop');

  return (
    <>
      <ModalCard
        open={open}
        onClose={onClose}
        showCloseIcon
        disableAutoFocus
        sx={styles.modalCard}
        CardProps={{ sx: styles.card }}
        BodyProps={{ sx: styles.cardBody }}
      >
        <Stack sx={styles.wheelContainer}>
          <Stack sx={styles.wheelOuter}>
            <Wheel
              mustStartSpinning={mustStartSpinning}
              prizeNumber={prizeNumber}
              data={wheelItems.map((item) => ({
                option: t(`wheel.discounts.${item.option}`),
                style: item.style,
              }))}
              radiusLineColor="rgba(255, 255, 255, 0.7)"
              radiusLineWidth={1}
              outerBorderColor="#ffffff"
              outerBorderWidth={2}
              onStopSpinning={onStopSpinning}
            />
          </Stack>
          <Button
            variant="contained"
            onClick={onSpinClick}
            disabled={mustStartSpinning}
            sx={styles.spinButton}
          >
            {t('wheel.spin')}
          </Button>
        </Stack>
      </ModalCard>
      <ModalCard
        open={isResultModalOpen}
        onClose={onClose}
        showCloseIcon
        sx={styles.modalCard}
        CardProps={{ sx: { ...styles.card, background: '#fff', borderRadius: 2 } }}
        BodyProps={{ sx: styles.cardBody }}
      >
        <Typography>
          {t('wheel.congratulations', {
            type: selectedCoupon?.option ? t(`wheel.discounts.${selectedCoupon.option}`) : '',
          })}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="center">
          <Typography fontWeight="bold">
            {t('wheel.couponCode', { code: selectedCoupon?.code })}
          </Typography>
          <Icon
            name="content_copy"
            onClick={() => {
              copyTextOnClick(selectedCoupon?.code);
            }}
            sx={styles.copyIcon}
          />
        </Stack>
      </ModalCard>
    </>
  );
};

export default WheelOfPrizes;
