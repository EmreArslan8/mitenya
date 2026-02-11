'use client';

import { ShopOrderStatus } from '@/lib/api/types';
import { Box, Stack, Typography } from '@mui/material';
import SupportButton from '../../SupportButtonSimple';
import Button from '../../common/Button';
import {
  Clock,
  PackageCheck,
  Truck,
  XCircle,
  CheckCircle2,
  SquareArrowOutUpRight,
} from 'lucide-react';
import { ReactNode } from 'react';

/* ── Status pipeline config ── */

const steps: { key: ShopOrderStatus; label: string; icon: ReactNode }[] = [
  { key: 'processing', label: 'Sipariş Alındı', icon: <Clock size={16} strokeWidth={2.2} /> },
  { key: 'preparing', label: 'Hazırlanıyor', icon: <PackageCheck size={16} strokeWidth={2.2} /> },
  { key: 'shipped', label: 'Kargoda', icon: <Truck size={16} strokeWidth={2.2} /> },
];

const statusIndex: Record<ShopOrderStatus, number> = {
  processing: 0,
  preparing: 1,
  shipped: 2,
  cancelled: -1,
};

const statusDescriptions: Record<ShopOrderStatus, string> = {
  processing: 'Siparişiniz başarıyla alındı ve işleme alınmaktadır.',
  preparing: 'Siparişiniz özenle hazırlanıyor. En kısa sürede kargoya verilecektir.',
  shipped: 'Siparişiniz kargoya verildi! Kargo takip numaranızla sürecini takip edebilirsiniz.',
  cancelled: 'Siparişiniz iptal edilmiştir. Detaylı bilgi için destek ekibimizle iletişime geçebilirsiniz.',
};

/* ── Component ── */

const OrderStatusCard = ({
  status,
  trackingNumber,
  orderId,
}: {
  status: ShopOrderStatus;
  trackingNumber?: string;
  orderId: string;
}) => {
  const isCancelled = status === 'cancelled';
  const activeIdx = statusIndex[status];

  return (
    <Stack
      sx={{
        borderRadius: '12px',
        border: (theme) =>
          isCancelled
            ? `1px solid ${theme.palette.error.light}`
            : `1px solid ${theme.palette.gray[100]}`,
        bgcolor: isCancelled ? 'error.light' : 'white.main',
        overflow: 'hidden',
      }}
    >
      {/* Header with order number */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          borderBottom: (theme) =>
            `1px solid ${isCancelled ? theme.palette.error.main + '20' : theme.palette.gray[100]}`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 0,
              color: isCancelled ? 'error.dark' : 'text.medium',
            }}
          >
            Sipariş No
          </Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: isCancelled ? 'error.dark' : 'text.main' }}>
            #{orderId}
          </Typography>
        </Stack>
      </Stack>

      {/* Status content */}
      <Stack sx={{ px: { xs: 2, sm: 2.5 }, py: 2.5, gap: 2.5 }}>
        {/* Cancelled state */}
        {isCancelled ? (
          <Stack gap={2} alignItems="flex-start">
            <Stack direction="row" alignItems="center" gap={1}>
              <XCircle size={20} strokeWidth={2} color="#C1121F" />
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'error.main' }}>
                İptal Edildi
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'error.dark', lineHeight: 1.6 }}>
              {statusDescriptions.cancelled}
            </Typography>
            <SupportButton size="small" />
          </Stack>
        ) : (
          <>
            {/* Timeline stepper */}
            <Stack
              direction="row"
              alignItems="flex-start"
              sx={{ gap: 0, width: '100%' }}
            >
              {steps.map((step, i) => {
                const isCompleted = i < activeIdx;
                const isActive = i === activeIdx;
                const isPending = i > activeIdx;

                return (
                  <Stack
                    key={step.key}
                    alignItems="center"
                    sx={{ flex: 1, position: 'relative' }}
                  >
                    {/* Connector line (before the circle) */}
                    {i > 0 && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 14,
                          right: '50%',
                          width: '100%',
                          height: 2,
                          bgcolor: isCompleted || isActive ? 'text.main' : 'gray.100',
                          transition: 'background-color 0.3s ease',
                        }}
                      />
                    )}

                    {/* Step circle */}
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        position: 'relative',
                        zIndex: 1,
                        bgcolor: isActive
                          ? 'text.main'
                          : isCompleted
                            ? 'text.main'
                            : 'bg.dark',
                        color: isActive || isCompleted ? 'white.main' : 'text.disabled',
                        transition: 'all 0.3s ease',
                        ...(isActive && {
                          boxShadow: '0 0 0 4px rgba(28,28,30,0.1)',
                        }),
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                      ) : (
                        step.icon
                      )}
                    </Box>

                    {/* Step label */}
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 12,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'text.main' : isPending ? 'text.disabled' : 'text.medium',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Stack>
                );
              })}
            </Stack>

            {/* Description */}
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 500,
                color: 'text.mediumLight',
                lineHeight: 1.6,
              }}
            >
              {statusDescriptions[status]}
            </Typography>

            {/* Tracking info for shipped */}
            {status === 'shipped' && trackingNumber && (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                gap={1.5}
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  bgcolor: 'bg.dark',
                }}
              >
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'text.light',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    Takip No:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'text.main',
                      fontFamily: 'monospace',
                      letterSpacing: 0.5,
                    }}
                  >
                    {trackingNumber}
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  color="neutral"
                  variant="outlined"
                  href={`https://my.fargo.uz/track?id=${trackingNumber}`}
                  target="_blank"
                  endIcon={<SquareArrowOutUpRight size={14} />}
                  sx={{ fontSize: 12 }}
                >
                  Kargoyu Takip Et
                </Button>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default OrderStatusCard;
