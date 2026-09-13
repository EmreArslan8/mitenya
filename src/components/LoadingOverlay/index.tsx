'use client';

import { Dialog } from '@/components/ui/Dialog';
import { ProgressBar } from '@/components/ui/ProgressBar';

/**
 * Tam ekran yükleme örtüsü — MUI `<Modal>` + `<LinearProgress>` yerine.
 *
 * `'use client'`: `ui/Dialog` (Radix) client bileşeni.
 *
 * Örtü rengi eskiden `#FFFFFF70` (beyaz, %44 opaklık) idi — hard-coded hex
 * yerine token: `bg-white/[44%]` (konvansiyon.md §3).
 *
 * `dismissible={false}`: yükleme sırasında Escape veya dışarı tıklamayla
 * kapanmamalı. MUI'de bu, `onClose` verilmeyerek sağlanıyordu.
 *
 * `position="top"`: MUI `<Modal>` cocugunu ortalamiyordu; `<LinearProgress>`
 * viewport'un tepesinde tam genislikte bir serit olarak duruyordu. Migration
 * sirasinda `center` + 420px genislik verilince cubuk sayfanin ortasinda
 * kalmisti; orijinal yerlesime donuldu.
 */
interface LoadingOverlayProps {
  loading: boolean;
}

const LoadingOverlay = ({ loading }: LoadingOverlayProps) => (
  <Dialog
    open={loading}
    onOpenChange={() => {}}
    dismissible={false}
    srTitle="Yükleniyor"
    position="top"
    overlayClassName="bg-white/[44%]"
    className="bg-transparent shadow-none"
  >
    <ProgressBar />
  </Dialog>
);

export default LoadingOverlay;
