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
  className?: string;
}

const QuantitySelector = ({
  value,
  onIncrease,
  onDecrease,
  onChange,
  min = 1,
  max,
  className,
}: QuantitySelectorProps) => {
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
    <div className={`flex h-[30px] w-fit shrink-0 items-center overflow-hidden rounded-full border border-bg-dark px-1.5 ${className ?? ''}`}>
      <button type="button" className="inline-flex size-5 items-center justify-center border-0 bg-transparent p-0 text-text-medium" onClick={onDecrease} aria-label={value === 1 ? 'Ürünü sil' : 'Adedi azalt'}>
        {value === 1 ? (
          <Trash size={16} className="text-error" strokeWidth={1.5} />
        ) : (
          <Minus size={16} strokeWidth={1.5} />
        )}
      </button>

      {onChange ? (
        <input
          type="text"
          inputMode="numeric"
          aria-label="Adet"
          value={draft}
          onChange={handleDraftChange}
          onFocus={(e: ChangeEvent<HTMLInputElement>) => e.target.select()}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="h-6 w-7 cursor-text rounded border-0 bg-transparent p-0 text-center font-inherit text-lg font-bold text-text outline-none transition-colors hover:bg-bg-dark focus:bg-bg-dark"
        />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center text-lg font-bold text-text">{value}</span>
      )}

      <button
        type="button"
        className="inline-flex size-5 items-center justify-center border-0 bg-transparent p-0 text-text-medium disabled:opacity-50"
        disabled={Boolean(max && value >= max)}
        onClick={!max || value < max ? onIncrease : undefined}
        aria-label="Adedi artır"
      >
        <Plus size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
};

export default QuantitySelector;
