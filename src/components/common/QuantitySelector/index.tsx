import { IconButton, Stack, SxProps } from '@mui/material';
import useStyles from './styles';
import { Minus, Plus } from '@/components/icons';
import { Trash } from 'lucide-react';
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';

interface QuantitySelectorProps {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
  /** Verilirse adet elle de yazılabilir; verilmezse sayı düz metin kalır. */
  onChange?: (quantity: number) => void;
  min?: number;
  max?: number;
  sx?: SxProps;
}

const QuantitySelector = ({
  value,
  onIncrease,
  onDecrease,
  onChange,
  min = 1,
  max,
  sx,
}: QuantitySelectorProps) => {
  const styles = useStyles();
  const [draft, setDraft] = useState(String(value));

  // Dışarıdan gelen adet değişince (artı/eksi, sepet yenilenmesi) taslağı eşitle.
  useEffect(() => setDraft(String(value)), [value]);

  const handleDraftChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDraft(e.target.value.replace(/\D/g, ''));

  /** Yazılan değeri sınırlara kırpıp uygular; geçersizse eski değere döner. */
  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = Math.max(min, max ? Math.min(parsed, max) : parsed);
    setDraft(String(next));
    if (next !== value) onChange?.(next);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    if (e.key === 'Escape') {
      setDraft(String(value));
      e.currentTarget.blur();
    }
  };

  return (
    <Stack sx={{ ...styles.itemQuantitySelector, ...sx } as SxProps}>
      <IconButton sx={styles.itemQuantityButton} onClick={onDecrease}>
        {value === 1 ? (
          <Trash size={16} color={styles.decreaseButtonColor(value)} strokeWidth={1.5} />
        ) : (
          <Minus size={16} color={styles.decreaseButtonColor(value)} strokeWidth={1.5} />
        )}
      </IconButton>

      {onChange ? (
        <Stack
          component="input"
          type="text"
          inputMode="numeric"
          aria-label="Adet"
          value={draft}
          onChange={handleDraftChange}
          onFocus={(e: ChangeEvent<HTMLInputElement>) => e.target.select()}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          sx={styles.itemQuantityInput}
        />
      ) : (
        <Stack sx={styles.itemQuantityValue}>{value}</Stack>
      )}

      <IconButton
        sx={styles.itemQuantityButton}
        disabled={Boolean(max && value >= max)}
        onClick={!max || value < max ? onIncrease : undefined}
      >
        <Plus size={20} strokeWidth={1.5} />
      </IconButton>
    </Stack>
  );
};

export default QuantitySelector;
