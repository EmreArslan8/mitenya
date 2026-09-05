'use client';

import { Box, Chip, Stack, Switch, Typography } from '@mui/material';
import { ChevronDown, ChevronUp } from '@/components/icons';
import { useState } from 'react';
import Button from '@/components/common/Button';
import Link from '@/components/common/Link';
import ModalCard from '@/components/common/ModalCard';
import { CookieConsentDraft } from '@/contexts/CookieConsentContext';
import useStyles from './styles';

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
  const styles = useStyles();
  const [expanded, setExpanded] = useState<SectionKey | null>('analytics');

  const toggleSection = (section: SectionKey) => {
    setExpanded((prev) => (prev === section ? null : section));
  };

  return (
    <ModalCard
      open={open}
      onClose={onClose}
      border
      sx={{ alignItems: 'center', p: { xs: 1.5, sm: 2 } }}
      CardProps={{ sx: styles.card }}
      BodyProps={{ sx: styles.body }}
    >
      <Stack sx={styles.hero}>
        <Stack sx={styles.heroTop}>
          <Typography component="h2" sx={styles.heroTitle}>
            Çerez Tercihleri
          </Typography>

          <Stack direction="row" sx={styles.heroMeta}>
            <Typography component="p" sx={styles.heroSubtitle}>
              Lütfen tercihlerinizi yapınız
            </Typography>
            <Link href={policyHref} style={styles.heroLink}>
              Çerez Politikası
            </Link>
          </Stack>
        </Stack>
      </Stack>

      <Stack direction="row" sx={styles.quickActions}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={onAcceptAll}
          sx={styles.quickButton}
        >
          Tümünü Kabul Et
        </Button>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={onRejectAll}
          sx={styles.quickButton}
        >
          Tümünü Reddet
        </Button>
      </Stack>

      <Stack sx={styles.content}>
        <Stack sx={styles.preferenceCard}>
          <Stack direction="row" sx={styles.preferenceHeader}>
            <Stack direction="row" sx={styles.preferenceLeft}>
              <Typography component="h3" sx={styles.preferenceTitle}>
                Zorunlu Çerezler
              </Typography>
              <Box sx={styles.chevronButton} onClick={() => toggleSection('necessary')}>
                {expanded === 'necessary' ? (
                  <ChevronUp size={18} strokeWidth={2} />
                ) : (
                  <ChevronDown size={18} strokeWidth={2} />
                )}
              </Box>
            </Stack>
            <Chip label="Zorunlu" size="small" sx={styles.alwaysOnChip} />
          </Stack>
          {expanded === 'necessary' && (
            <Box sx={styles.preferenceBody}>
              <Typography sx={styles.preferenceText}>
                Bu çerezler sitenin güvenli ve sorunsuz çalışması için gereklidir. Sepet, oturum,
                güvenlik ve temel sayfa işlevleri bu kategoriye dahildir.
              </Typography>
            </Box>
          )}
        </Stack>

        <Stack sx={styles.preferenceCard}>
          <Stack direction="row" sx={styles.preferenceHeader}>
            <Stack direction="row" sx={styles.preferenceLeft}>
              <Typography component="h3" sx={styles.preferenceTitle}>
                Analitik Çerezler
              </Typography>
              <Box sx={styles.chevronButton} onClick={() => toggleSection('analytics')}>
                {expanded === 'analytics' ? (
                  <ChevronUp size={18} strokeWidth={2} />
                ) : (
                  <ChevronDown size={18} strokeWidth={2} />
                )}
              </Box>
            </Stack>
            <Switch
              checked={draft.analytics}
              onChange={(event) => onChange({ ...draft, analytics: event.target.checked })}
              sx={styles.switch}
            />
          </Stack>
          {expanded === 'analytics' && (
            <Box sx={styles.preferenceBody}>
              <Typography sx={styles.preferenceText}>
                Bu çerezleri ziyaretçi sayılarını ve trafiği anlamak için kullanırız. Böylece hangi
                içeriklerin daha çok ilgi gördüğünü anlayabilir, deneyimi ölçebilir ve zaman içinde
                iyileştirebiliriz. Toplanan veriler kişisel değil, toplu ve anonim olarak işlenir.
              </Typography>
            </Box>
          )}
        </Stack>

        <Stack sx={styles.preferenceCard}>
          <Stack direction="row" sx={styles.preferenceHeader}>
            <Stack direction="row" sx={styles.preferenceLeft}>
              <Typography component="h3" sx={styles.preferenceTitle}>
                Pazarlama Çerezleri
              </Typography>
              <Box sx={styles.chevronButton} onClick={() => toggleSection('marketing')}>
                {expanded === 'marketing' ? (
                  <ChevronUp size={18} strokeWidth={2} />
                ) : (
                  <ChevronDown size={18} strokeWidth={2} />
                )}
              </Box>
            </Stack>
            <Switch
              checked={draft.marketing}
              onChange={(event) => onChange({ ...draft, marketing: event.target.checked })}
              sx={styles.switch}
            />
          </Stack>
          {expanded === 'marketing' && (
            <Box sx={styles.preferenceBody}>
              <Typography sx={styles.preferenceText}>
                Pazarlama çerezleri, size daha ilgili kampanyalar, ürün önerileri ve iletişimler
                sunabilmemize yardımcı olur. Bu tercih kapalıyken daha genel içerikler görürsünüz.
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={styles.footer}>
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={onSave}
          sx={styles.saveButton}
        >
          Değişiklikleri Kaydet
        </Button>
      </Stack>
    </ModalCard>
  );
};

export default CookiePreferencesModal;
