'use client';

import { ShopOrderStatus } from '@/lib/api/types';
import { Box, Stack, Typography } from '@mui/material';
import SupportButton from '../../SupportButtonSimple';
import Button from '../../common/Button';
import { CheckCircle2, Clock, XCircle } from '@/components/icons';
import { PackageCheck, Truck, SquareArrowOutUpRight } from 'lucide-react';
import { ReactNode } from 'react';

/* ── Status pipeline config ── */

const steps: { key: ShopOrderStatus; label: string; icon: ReactNode }[] = [
  { key: 'processing', label: 'Sipariş Alındı', icon: <Clock size={16} strokeWidth={2.2} /> },
  { key: 'preparing', label: 'Hazırlanıyor', icon: <PackageCheck size={16} strokeWidth={2.2} /> },
  { key: 'shipped', label: 'Kargoda', icon: <Truck size={16} strokeWidth={2.2} /> },
  { key: 'delivered', label: 'Teslim Edildi', icon: <CheckCircle2 size={16} strokeWidth={2.2} /> },
];

const statusIndex: Record<ShopOrderStatus, number> = {
  processing: 0,
  preparing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

const statusDescriptions: Record<ShopOrderStatus, string> = {
  processing: 'Siparişiniz başarıyla alındı ve işleme alınmaktadır.',
  preparing: 'Siparişiniz özenle hazırlanıyor. En kısa sürede kargoya verilecektir.',
  shipped: 'Siparişiniz kargoya verildi! Kargo takip numaranızla sürecini takip edebilirsiniz.',
  delivered: 'Siparişiniz teslim edildi. İyi günlerde kullanın.',
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
        borderRadius: { xs: '14px', sm: '16px' },
        border: (theme) =>
          isCancelled
            ? `1px solid ${theme.palette.error.light}`
            : `1px solid ${theme.palette.gray[100]}CC`,
        bgcolor: isCancelled ? 'error.light' : 'white.main',
        boxShadow: isCancelled ? 'none' : '0 10px 30px rgba(17, 24, 39, 0.06)',
        overflow: 'hidden',
      }}
    >
      {/* Header with order number */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: { xs: 2.25, sm: 2.75 },
          py: { xs: 1.4, sm: 1.6 },
          borderBottom: (theme) =>
            `1px solid ${isCancelled ? theme.palette.error.main + '22' : theme.palette.gray[100]}`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.35,
              color: isCancelled ? 'error.dark' : 'text.medium',
            }}
          >
            Sipariş No
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 14, sm: 15 },
              fontWeight: 800,
              letterSpacing: 0.2,
              color: isCancelled ? 'error.dark' : 'text.main',
            }}
          >
            #{orderId}
          </Typography>
        </Stack>
      </Stack>

      {/* Status content */}
      <Stack sx={{ px: { xs: 2.25, sm: 2.75 }, py: { xs: 2.4, sm: 2.8 }, gap: { xs: 2.25, sm: 2.6 } }}>
        {/* Cancelled state */}
        {isCancelled ? (
          <Stack gap={2.1} alignItems="flex-start">
            <Stack direction="row" alignItems="center" gap={1.1}>
              <XCircle size={20} strokeWidth={2} color="#C1121F" />
              <Typography sx={{ fontSize: { xs: 16, sm: 17 }, fontWeight: 750, color: 'error.main' }}>
                İptal Edildi
              </Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: 'error.dark', lineHeight: 1.75 }}>
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
                          top: { xs: 15, sm: 16 },
                          right: '50%',
                          width: '100%',
                          height: 1.5,
                          bgcolor: isCompleted || isActive ? 'gray.300' : 'gray.100',
                          transition: 'background-color 0.25s ease',
                        }}
                      />
                    )}

                    {/* Step circle */}
                    <Box
                      sx={{
                        width: { xs: 30, sm: 32 },
                        height: { xs: 30, sm: 32 },
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        position: 'relative',
                        zIndex: 1,
                        bgcolor: isActive ? '#F4F5F7' : isCompleted ? '#F8F9FB' : '#FCFCFD',
                        border: '1px solid',
                        borderColor: isActive ? 'text.main' : isCompleted ? 'gray.300' : 'gray.100',
                        color: 'text.main',
                        transition: 'all 0.25s ease',
                        boxShadow: isActive ? '0 0 0 3px rgba(17, 24, 39, 0.08)' : 'none',
                        '& svg': {
                          color: 'text.main',
                        },
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
                        mt: { xs: 1, sm: 1.1 },
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
                lineHeight: 1.75,
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
                  p: { xs: 1.4, sm: 1.6 },
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid',
                  borderColor: 'gray.100',
                }}
              >
                <Stack direction="row" alignItems="center" gap={0.75}>
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'text.medium',
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
                  sx={{
                    fontSize: 12,
                    borderColor: 'gray.200',
                    bgcolor: 'white.main',
                    '&:hover': {
                      borderColor: 'text.main',
                      bgcolor: 'white.main',
                    },
                  }}
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
