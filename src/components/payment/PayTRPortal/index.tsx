'use client';

import LoadingOverlay from '@/components/LoadingOverlay';
import { CloseIcon, Lock } from '@/components/icons';
import { Dialog } from '@/components/ui/Dialog';
import { Typography } from '@/components/ui/Typography';
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface PayTRPortalProps {
  token: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PayTRPortal = ({ token, open, onClose, onSuccess, onError }: PayTRPortalProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !token) return;

    // PayTR iframe mesajlarını dinle
    const handleMessage = (event: MessageEvent) => {
      // PayTR'dan gelen mesajları kontrol et
      if (event.origin !== 'https://www.paytr.com') return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        if (data.status === 'success') {
          onSuccess?.();
        } else if (data.status === 'failed' || data.status === 'error') {
          onError?.(data.reason || 'Ödeme başarısız');
        }
      } catch {
        // JSON parse hatası - mesaj PayTR'dan değil
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [open, token, onSuccess, onError]);

  if (!open || !token) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
      srTitle="Güvenli ödeme"
      className="flex h-full w-full max-w-[600px] flex-col overflow-hidden rounded-none sm:h-auto sm:max-h-[90vh] sm:w-[90%] sm:rounded-lg"
    >
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2 text-success">
            <Lock size={20} />
            <Typography variant="subtitle2" className="font-semibold text-text">
              Güvenli Ödeme
            </Typography>
          </div>
          <button type="button" className="flex h-8 w-8 items-center justify-center border-0 bg-transparent" onClick={onClose} aria-label="Ödeme penceresini kapat">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="relative min-h-[400px] flex-1">
          {loading && <LoadingOverlay loading />}
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${token}`}
            style={{
              width: '100%',
              height: '100%',
              minHeight: 400,
              border: 'none',
            }}
            onLoad={() => setLoading(false)}
            allow="payment"
          />
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50 px-4 py-2 text-success">
          <ShieldCheck size={16} />
          <Typography variant="caption" className="text-text-secondary">
            256-bit SSL ile şifrelenmiş güvenli bağlantı
          </Typography>
        </div>
    </Dialog>
  );
};

export default PayTRPortal;
