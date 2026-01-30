import { Stack, Typography } from '@mui/material';
import { bannerHeight, headerHeight } from '@/theme/theme';
import type { LegalDocument } from './types';
import LegalDocumentContent from './LegalDocumentContent';

const LegalDocumentView = ({ document }: { document: LegalDocument }) => {
  return (
    <Stack
      gap={3}
      sx={{
        mt: { xs: `${headerHeight.xs + bannerHeight - 24}px`, sm: 0 },
        mb: 3,
        width: '100%',
        maxWidth: 900,
        mx: 'auto',
      }}
    >
      <Stack gap={1}>
        <Typography variant="h1">{document.title}</Typography>
        {document.updatedAt && (
          <Typography variant="body" sx={{ color: 'text.secondary', fontSize: 13 }}>
            Son Güncelleme: {document.updatedAt}
          </Typography>
        )}
      </Stack>
      <LegalDocumentContent html={document.html} />
    </Stack>
  );
};

export default LegalDocumentView;
