'use client';

import { ChevronDown, ChevronUp } from '@/components/icons';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import Link from '@/components/common/Link';
import ModalCard from '@/components/common/ModalCard';
import { CookieConsentDraft } from '@/contexts/CookieConsentContext';
import { Chip } from '@/components/ui/Chip';
import { Switch } from '@/components/ui/Switch';

interface CookiePreferencesModalProps {
  open: boolean;
  policyHref: string;
  draft: CookieConsentDraft;
  onChange: (next: CookieConsentDraft) => void;
  onSave: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onClose: () => void;
}

type SectionKey = 'necessary' | 'analytics' | 'marketing';

const CookiePreferencesModal = ({
  open,
  policyHref,
  draft,
  onChange,
  onSave,
  onAcceptAll,
  onRejectAll,
  onClose,
}: CookiePreferencesModalProps) => {
  const [expanded, setExpanded] = useState<SectionKey | null>('analytics');

  const toggleSection = (section: SectionKey) => {
    setExpanded((prev) => (prev === section ? null : section));
  };

  return (
    <ModalCard
      open={open}
      onClose={onClose}
      border
      layout="center"
      className="w-[calc(100vw-20px)] max-w-full overflow-hidden rounded-lg bg-gray-50 sm:w-[560px]"
      bodyClassName="gap-0 overflow-y-auto bg-gray-50 p-0"
    >
      <div className="border-b border-gray-300 bg-gray-200 px-3 py-3 text-text sm:px-6 sm:py-5">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2 className="whitespace-nowrap text-[17px] font-semibold leading-[1.1] text-text sm:text-lg">
            Çerez Tercihleri
          </h2>

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 sm:flex-nowrap">
            <p className="min-w-0 flex-1 text-xs font-medium text-text-medium sm:whitespace-nowrap">
              Lütfen tercihlerinizi yapınız
            </p>
            <Link href={policyHref} className="shrink-0 whitespace-nowrap text-xs font-semibold text-text underline decoration-text underline-offset-3">
              Çerez Politikası
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-nowrap justify-end gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2.5 sm:gap-2 sm:px-6 sm:py-4">
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={onAcceptAll}
          className="h-8 min-w-0 flex-1 rounded-xl px-2.5 text-[10.5px] font-extrabold tracking-[0.01em] sm:h-[34px] sm:flex-none sm:px-3"
        >
          Tümünü Kabul Et
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={onRejectAll}
          className="h-8 min-w-0 flex-1 rounded-xl px-2.5 text-[10.5px] font-extrabold tracking-[0.01em] sm:h-[34px] sm:flex-none sm:px-3"
        >
          Tümünü Reddet
        </Button>
      </div>

      <div className="flex flex-col gap-2.5 px-3 py-3 sm:gap-3.5 sm:px-6 sm:py-5">
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-3 px-2.5 py-[9px] sm:px-4 sm:py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <h3 className="text-[13.5px] font-bold text-text sm:text-sm">
                Zorunlu Çerezler
              </h3>
              <button type="button" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-text-medium-light hover:bg-gray-50 hover:text-text" onClick={() => toggleSection('necessary')} aria-label="Zorunlu çerez açıklamasını aç veya kapat">
                {expanded === 'necessary' ? (
                  <ChevronUp size={18} strokeWidth={2} />
                ) : (
                  <ChevronDown size={18} strokeWidth={2} />
                )}
              </button>
            </div>
            <Chip
              label="Zorunlu"
              size="small"
              className="h-[22px] rounded-full border border-gray-100 bg-gray-50 text-[10.5px] font-bold text-text-medium sm:h-6"
            />
          </div>
          {expanded === 'necessary' && (
            <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-3.5">
              <p className="text-[12.5px] leading-[1.7] text-text-secondary">
                Bu çerezler sitenin güvenli ve sorunsuz çalışması için gereklidir. Sepet, oturum,
                güvenlik ve temel sayfa işlevleri bu kategoriye dahildir.
              </p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-3 px-2.5 py-[9px] sm:px-4 sm:py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <h3 className="text-[13.5px] font-bold text-text sm:text-sm">
                Analitik Çerezler
              </h3>
              <button type="button" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-text-medium-light hover:bg-gray-50 hover:text-text" onClick={() => toggleSection('analytics')} aria-label="Analitik çerez açıklamasını aç veya kapat">
                {expanded === 'analytics' ? (
                  <ChevronUp size={18} strokeWidth={2} />
                ) : (
                  <ChevronDown size={18} strokeWidth={2} />
                )}
              </button>
            </div>
            <Switch
              checked={draft.analytics}
              onCheckedChange={(checked) => onChange({ ...draft, analytics: checked })}
              aria-label="Analitik çerezler"
            />
          </div>
          {expanded === 'analytics' && (
            <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-3.5">
              <p className="text-[12.5px] leading-[1.7] text-text-secondary">
                Bu çerezleri ziyaretçi sayılarını ve trafiği anlamak için kullanırız. Böylece hangi
                içeriklerin daha çok ilgi gördüğünü anlayabilir, deneyimi ölçebilir ve zaman içinde
                iyileştirebiliriz. Toplanan veriler kişisel değil, toplu ve anonim olarak işlenir.
              </p>
            </div>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-3 px-2.5 py-[9px] sm:px-4 sm:py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <h3 className="text-[13.5px] font-bold text-text sm:text-sm">
                Pazarlama Çerezleri
              </h3>
              <button type="button" className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-text-medium-light hover:bg-gray-50 hover:text-text" onClick={() => toggleSection('marketing')} aria-label="Pazarlama çerezi açıklamasını aç veya kapat">
                {expanded === 'marketing' ? (
                  <ChevronUp size={18} strokeWidth={2} />
                ) : (
                  <ChevronDown size={18} strokeWidth={2} />
                )}
              </button>
            </div>
            <Switch
              checked={draft.marketing}
              onCheckedChange={(checked) => onChange({ ...draft, marketing: checked })}
              aria-label="Pazarlama çerezleri"
            />
          </div>
          {expanded === 'marketing' && (
            <div className="px-2.5 pb-2.5 sm:px-4 sm:pb-3.5">
              <p className="text-[12.5px] leading-[1.7] text-text-secondary">
                Pazarlama çerezleri, size daha ilgili kampanyalar, ürün önerileri ve iletişimler
                sunabilmemize yardımcı olur. Bu tercih kapalıyken daha genel içerikler görürsünüz.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="flex flex-col justify-end border-t border-gray-100 bg-gray-50 px-3 py-3 sm:flex-row sm:px-6 sm:py-4">
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={onSave}
          className="h-8 min-w-full rounded-xl px-2.5 text-[10.5px] font-extrabold tracking-[0.01em] sm:h-[42px] sm:min-w-[190px] sm:px-5 sm:text-[11.5px]"
        >
          Değişiklikleri Kaydet
        </Button>
      </div>
    </ModalCard>
  );
};

export default CookiePreferencesModal;
