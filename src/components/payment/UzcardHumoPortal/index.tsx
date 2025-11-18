import Button from '@/components/common/Button';
import Link from 'next/link';
import ModalCard from '@/components/common/ModalCard';
import Icon from '@/components/Icon';
import { confirmUzcardHumoPayment, createUzcardHumoPayment } from '@/lib/api/checkout/uzcardHumo';
import useLocale from '@/lib/hooks/useLocale';
import { Currency } from '@/lib/utils/currencies';
import formatPrice from '@/lib/utils/formatPrice';
import { Stack, TextField, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import useStyles from './styles';

interface UzcardHumoPortalProps {
  orderId: string;
  sessionId: string;
  total: { amount: number; currency: Currency };
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UzcardHumoPortal = ({
  orderId,
  sessionId: initialSessionId,
  total,
  open,
  onClose,
  onSuccess,
}: UzcardHumoPortalProps) => {
  const t = useTranslations('shop.payment.uzcardHumo.portal');
  const styles = useStyles();
  const { locale } = useLocale();
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [step, setStep] = useState<'card_details' | 'confirmation'>('card_details');
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState(false);
  const [expiration, setExpiration] = useState('');
  const [expirationError, setExpirationError] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    let cursorPosition = input.selectionStart || 0;
    const previousValue = cardNumber.replace(/\D/g, '');

    if (value.length > 16) value = value.slice(0, 16);
    let formattedValue = '';
    let spaceCount = 0;

    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
        if (i < cursorPosition) spaceCount++;
      }
      formattedValue += value[i];
    }

    if (value.length > previousValue.length) {
      cursorPosition += (cursorPosition - spaceCount) % 4 === 0 ? 1 : 0;
    }

    if (value.length < previousValue.length) {
      if (previousValue[cursorPosition - 1] === ' ' && cursorPosition > 0) {
        cursorPosition--;
      }
    }

    setCardNumber(formattedValue);
    setTimeout(() => input.setSelectionRange(cursorPosition, cursorPosition), 0);
  };

  const handleExpirationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    let cursorPosition = input.selectionStart || 0;
    const previousValue = expiration.replace(/\D/g, '');

    if (value.length > 4) value = value.slice(0, 4);
    let formattedValue = '';
    let slashCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (i === 2) {
        formattedValue += '/';
        if (i < cursorPosition) slashCount++;
      }
      formattedValue += value[i];
    }

    if (value.length > previousValue.length) {
      cursorPosition += cursorPosition - slashCount === 2 ? 1 : 0;
    }

    if (value.length < previousValue.length) {
      if (previousValue[cursorPosition - 1] === '/' && cursorPosition > 0) {
        cursorPosition--;
      }
    }

    setExpiration(formattedValue);
    setTimeout(() => input.setSelectionRange(cursorPosition, cursorPosition), 0);
  };

  const handleSubmitCardDetails = async () => {
    let isValid = true;
    if (cardNumber.length !== 19) {
      setCardNumberError(true);
      isValid = false;
    }
    if (expiration.length !== 5) {
      setExpirationError(true);
      isValid = false;
    }
    if (!isValid) return;
    setLoading(true);
    const { success, sessionId: newSessionId } = await createUzcardHumoPayment({
      orderId,
      sessionId,
      cardNumber: cardNumber.replaceAll(' ', ''),
      paymentMethod: 'UniversalBank',
      expiration: { month: expiration.slice(0, 2), year: expiration.slice(3, 5) },
    });
    setLoading(false);
    if (!success) return setError(true);
    setSessionId(newSessionId);
    setStep('confirmation');
  };

  const handleSubmitConfirmationCode = async () => {
    setLoading(true);
    const res = await confirmUzcardHumoPayment({
      orderId,
      sessionId,
      confirmationCode,
    });
    if (!res) {
      setError(true);
      setLoading(false);
      return;
    }
    onSuccess();
  };

  return (
    <ModalCard
      title={
        step === 'confirmation' && (
          <Icon color="neutral" name="arrow_back" onClick={() => setStep('card_details')} />
        )
      }
      noDivider
      open={open}
      onClose={onClose}
      showCloseIcon
      BodyProps={{ sx: { pt: '0 !important' } }}
    >
      <Stack
        component="form"
        sx={styles.body}
        onSubmit={(e) => {
          e.preventDefault();
          step === 'card_details' ? handleSubmitCardDetails() : handleSubmitConfirmationCode();
        }}
      >
        {step === 'card_details' ? (
          <>
            <Stack sx={styles.total}>
              <Typography variant="warningSemibold" color="text.medium">
                {t('total')}
              </Typography>
              <Typography sx={styles.totalAmount}>
                {formatPrice(total.amount, total.currency, locale)}
              </Typography>
            </Stack>
            <Stack gap={1}>
              <Stack sx={styles.cardDetailsInputs}>
                <Stack gap={0.5}>
                  <Typography variant="infoLabel" color="text.medium">
                    {t('cardNumberLabel')}
                  </Typography>
                  <TextField
                    inputMode="numeric"
                    fullWidth
                    placeholder="•••• •••• •••• ••••"
                    value={cardNumber}
                    inputProps={{ sx: styles.numberInput }}
                    InputProps={{
                      endAdornment: <CardVendorLogo cardNumber={cardNumber} />,
                    }}
                    onChange={handleCardNumberChange}
                    error={cardNumberError}
                    sx={{ minWidth: 256 }}
                  />
                </Stack>
                <Stack gap={0.5}>
                  <Typography variant="infoLabel" color="text.medium" whiteSpace="nowrap" pr={1}>
                    {t('expirationLabel')}
                  </Typography>
                  <TextField
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiration}
                    inputProps={{ sx: styles.numberInput }}
                    onChange={handleExpirationChange}
                    error={expirationError}
                    sx={styles.expiration}
                  />
                </Stack>
              </Stack>
              {error && (
                <Typography variant="caption" color="error">
                  {t('error')}
                </Typography>
              )}
            </Stack>
            <Stack gap={1}>
              <Button loading={loading} variant="contained" type="submit" sx={styles.button}>
                {t('continueToCodeButton')}
              </Button>
              <Button
                size="small"
                color="primaryDark"
                // startIcon={<Icon name="support_agent" />}
                href={`https://help.bringist.com/${locale}`}
                target="_blank"
              >
                {t('contactSupport')}
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="warningSemibold" align="center" mt={1}>
              {t('codeDescription')}
            </Typography>
            <TextField
              inputMode="numeric"
              type="number"
              placeholder="•••••"
              value={confirmationCode}
              inputProps={{ sx: styles.numberInput }}
              onChange={(e) => setConfirmationCode(e.target.value.slice(0, 6))}
            />
            {error && (
              <Typography variant="caption" color="error">
                {t('error')}
              </Typography>
            )}
            <Button loading={loading} variant="contained" type="submit" sx={styles.button}>
              {t('confirmButton')}
            </Button>
          </>
        )}
        <Stack sx={styles.provider}>
          <Typography variant="caption">Powered by</Typography>
          <Link href="https://universalbank.uz/" target="_blank" style={{ lineHeight: 0 }}>
            <Image
              src="/static/images/universalbank.png"
              height={17}
              width={112.7}
              alt="universal bank"
            />
          </Link>
        </Stack>
      </Stack>
    </ModalCard>
  );
};

const CardVendorLogo = ({ cardNumber }: { cardNumber: string }) => {
  if (['8600', '5614', '6262', '5440'].includes(cardNumber.slice(0, 4)))
    return (
      <Image
        src="/static/images/uzcard.png"
        width={28}
        height={28}
        style={{ objectFit: 'contain' }}
        alt="uzcard"
      />
    );
  else if (cardNumber.startsWith('9860'))
    return (
      <Image
        src="/static/images/humo.png"
        width={28}
        height={28}
        style={{ objectFit: 'contain' }}
        alt="humo"
      />
    );
  else return null;
};

export default UzcardHumoPortal;
