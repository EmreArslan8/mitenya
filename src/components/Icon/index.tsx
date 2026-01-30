'use client';

import { usePalette } from '@/theme/ThemeRegistry';
import { Box, SxProps } from '@mui/material';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  Baby,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Clock,
  Copy,
  CreditCard,
  Gift,
  Handshake,
  Heart,
  Info,
  List,
  Lock,
  MapPin,
  MapPinPlus,
  Package,
  Pencil,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  TrendingDown,
  Trash,
  Truck,
  User,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export interface IconProps {
  name: string;
  fill?: boolean;
  weight?: number;
  fontSize?: number;
  size?: number;
  color?: string;
  sx?: SxProps;
  onClick?: () => void;
  href?: string;
  target?: '_self' | '_blank';
}

const iconMap: Record<string, LucideIcon> = {
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  truck: Truck,
  'clock-4': Clock,
  'badge-percent': BadgePercent,
  'credit-card': CreditCard,
  shopping_bag: ShoppingBag,
  delete: Trash,
  chevron_right: ChevronRight,
  content_copy: Copy,
  expand_more: ChevronDown,
  info: Info,
  sparkles: Sparkles,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  'check-circle-2': CheckCircle2,
  female: User,
  male: User,
  child_care: Baby,
  local_mall: ShoppingBag,
  directions_run: Activity,
  store: Store,
  verified_user: BadgeCheck,
  autorenew: RefreshCw,
  workspace_premium: BadgeCheck,
  local_shipping: Truck,
  receipt_long: ReceiptText,
  list: List,
  edit: Pencil,
  menu_book: BookOpen,
  lock: Lock,
  tune: SlidersHorizontal,
  add_location_alt: MapPinPlus,
  distance: MapPin,
  payment: CreditCard,
  redeem: Gift,
  handshake: Handshake,
  volunteer_activism: Heart,
  pending: Clock,
  deployed_code_account: Package,
  cancel: XCircle,
  trending_down: TrendingDown,
  default: Info,
};

const weightToStrokeWidth = (weight?: number) => {
  if (!weight) return 2;
  if (weight >= 700) return 2.5;
  if (weight >= 500) return 2.25;
  if (weight >= 400) return 2;
  if (weight >= 300) return 1.75;
  return 1.5;
};

const Icon = ({
  name,
  fill = false,
  weight = 400,
  fontSize,
  size,
  color = 'inherit',
  sx,
  onClick,
  href,
  target = '_self',
}: IconProps) => {
  const palette = usePalette();
  const cleanName = name?.toString().trim();
  const IconComponent =
    iconMap[cleanName] ||
    iconMap[cleanName?.toLowerCase()] ||
    iconMap[cleanName?.replace(/-/g, '_')] ||
    iconMap.default;
  const strokeWidth = weightToStrokeWidth(weight);
  const resolvedSize = fontSize ?? size ?? 24;
  const resolvedColor = (palette as any)[color]?.main ?? color;

  return (
    <Box
      component={href ? 'a' : 'span'}
      href={href}
      target={target}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        userSelect: 'none',
        color: resolvedColor,
        cursor: onClick || href ? 'pointer' : 'unset',
        textDecoration: 'none',
        ...sx,
      }}
      onClick={onClick}
    >
      <IconComponent
        size={resolvedSize}
        strokeWidth={strokeWidth}
        color="currentColor"
        fill={fill ? 'currentColor' : 'none'}
      />
    </Box>
  );
};

export default Icon;
