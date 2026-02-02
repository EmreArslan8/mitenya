'use client';

import { Checkbox, Divider, FormControlLabel, Stack, Typography } from '@mui/material';
import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import ModalCard from '@/components/common/ModalCard';
import { CookieConsentDraft } from '@/contexts/CookieConsentContext';

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
  return (
    <ModalCard
      open={open}
      onClose={onClose}
      showCloseIcon
      border
      iconName="tune"
      title="Çerez Tercihleri"
      BodyProps={{ sx: { gap: 2 } }}
    >
      <Stack gap={0.75}>
        <Typography variant="body" sx={{ fontSize: 13, color: 'text.secondary' }}>
          Zorunlu çerezler siteyi çalıştırmak için gereklidir. Analitik ve pazarlama çerezleri
          yalnızca izninizle aktif olur. Detaylar için{' '}
          <Link href={policyHref} colored>
            Çerez Politikası
          </Link>
          &rsquo;nı inceleyebilirsiniz.
        </Typography>
      </Stack>

      <Stack gap={1.5}>
        <Stack gap={0.5}>
          <FormControlLabel
            control={<Checkbox checked disabled />}
            label="Zorunlu Çerezler"
          />
          <Typography variant="body" sx={{ fontSize: 13, color: 'text.secondary', pl: 4 }}>
            Oturum yönetimi, güvenlik ve temel site fonksiyonları için gereklidir.
          </Typography>
        </Stack>

        <Divider />

        <Stack gap={0.5}>
          <FormControlLabel
            control={
              <Checkbox
                checked={draft.analytics}
                onChange={(event) =>
                  onChange({ ...draft, analytics: event.target.checked })
                }
              />
            }
            label="Analitik Çerezler"
          />
          <Typography variant="body" sx={{ fontSize: 13, color: 'text.secondary', pl: 4 }}>
            Ziyaretçi davranışlarını ölçerek deneyimi geliştirmemize yardımcı olur.
          </Typography>
        </Stack>

        <Divider />

        <Stack gap={0.5}>
          <FormControlLabel
            control={
              <Checkbox
                checked={draft.marketing}
                onChange={(event) =>
                  onChange({ ...draft, marketing: event.target.checked })
                }
              />
            }
            label="Pazarlama Çerezleri"
          />
          <Typography variant="body" sx={{ fontSize: 13, color: 'text.secondary', pl: 4 }}>
            İlgi alanlarınıza uygun içerik ve kampanyalar sunmamıza yardımcı olur.
          </Typography>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} justifyContent="flex-end">
        <Button size="small" variant="outlined" color="neutral" onClick={onRejectAll}>
          Reddet
        </Button>
        <Button size="small" variant="outlined" color="primary" onClick={onSave}>
          Kaydet
        </Button>
        <Button size="small" variant="contained" color="primary" onClick={onAcceptAll}>
          Tümünü Kabul Et
        </Button>
      </Stack>
    </ModalCard>
  );
};

export default CookiePreferencesModal;
