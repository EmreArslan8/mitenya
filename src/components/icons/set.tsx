import BaseIcon, { type IconProps } from './BaseIcon';

/*
 * Yerel SVG ikon seti. Her ikon kendi bileşeni; ortak <svg> sarmalayıcısı
 * BaseIcon. Modül seviyesinde çağrı yok, bu yüzden paketleyici kullanılmayan
 * ikonları atar — bir sayfaya yalnızca import ettiği ikonlar girer.
 *
 * Kalınlık düzeni:
 *   1.25 — çift chevron (setin en incesi)
 *   1.5  — geri kalan bütün ikonlar (varsayılan)
 */

/* ---------- oklar ---------- */

export const ArrowLeft = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </BaseIcon>
);

export const ArrowRight = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M4 12h15" />
    <path d="m12.5 6 6.5 6-6.5 6" />
  </BaseIcon>
);

export const ArrowUpRight = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M6 18 18 6" />
    <path d="M10.5 6H18v7.5" />
  </BaseIcon>
);

export const ArrowUpDown = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M7 19.5v-15" />
    <path d="m3.5 8 3.5-3.5L10.5 8" />
    <path d="M17 4.5v15" />
    <path d="m13.5 16 3.5 3.5 3.5-3.5" />
  </BaseIcon>
);

/* ---------- chevron ---------- */

export const ChevronLeft = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m15 18-6-6 6-6" />
  </BaseIcon>
);
export const ChevronRight = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m9 18 6-6-6-6" />
  </BaseIcon>
);
export const ChevronUp = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m18 15-6-6-6 6" />
  </BaseIcon>
);
export const ChevronDown = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m6 9 6 6 6-6" />
  </BaseIcon>
);

export const DoubleChevronLeft = (props: IconProps) => (
  <BaseIcon strokeWidth={1.25} {...props}>
    <path d="m13 18-6-6 6-6" />
    <path d="m19 18-6-6 6-6" />
  </BaseIcon>
);

export const DoubleChevronRight = (props: IconProps) => (
  <BaseIcon strokeWidth={1.25} {...props}>
    <path d="m5 6 6 6-6 6" />
    <path d="m11 6 6 6-6 6" />
  </BaseIcon>
);

/* ---------- artı / eksi ---------- */

export const Plus = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 4.5v15" />
    <path d="M4.5 12h15" />
  </BaseIcon>
);

export const Minus = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M4.5 12h15" />
  </BaseIcon>
);

/* ---------- durum ---------- */

export const Check = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M20 6 9 17l-5-5" />
  </BaseIcon>
);

export const Heart = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
  </BaseIcon>
);

export const CloseIcon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M18 6 6 18M6 6l12 12" />
  </BaseIcon>
);

/* ---------- daire tabanlı ---------- */

export const CheckCircle2 = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </BaseIcon>
);

export const XCircle = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </BaseIcon>
);

export const AlertCircle = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </BaseIcon>
);

export const AlertTriangle = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M10.27 4.04a2 2 0 0 1 3.46 0l8 14A2 2 0 0 1 20 21H4a2 2 0 0 1-1.73-2.96z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </BaseIcon>
);

export const Info = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </BaseIcon>
);

export const Ban = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M4.929 4.929 19.07 19.071" />
  </BaseIcon>
);

export const Clock = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </BaseIcon>
);

export const Clock3 = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6h4" />
  </BaseIcon>
);

export const Search = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.34-4.34" />
  </BaseIcon>
);

export const SearchX = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m13.5 8.5-5 5" />
    <path d="m8.5 8.5 5 5" />
    <path d="m21 21-4.3-4.3" />
  </BaseIcon>
);

/* ---------- çizgi ve dikdörtgen tabanlı ---------- */

export const Asterisk = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 6v12" />
    <path d="M17.196 9 6.804 15" />
    <path d="m6.804 9 10.392 6" />
  </BaseIcon>
);

export const Menu = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M4 5h16" />
    <path d="M4 12h16" />
    <path d="M4 19h16" />
  </BaseIcon>
);

export const MoreVertical = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </BaseIcon>
);

export const TrendingDown = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M16 17h6v-6" />
    <path d="m22 17-8.5-8.5-5 5L2 7" />
  </BaseIcon>
);

export const CreditCard = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M2 10h20" />
  </BaseIcon>
);

export const Calendar = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </BaseIcon>
);

export const Copy = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2" />
  </BaseIcon>
);

/* ---------- tek yaylı ikonlar ---------- */

export const Lock = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </BaseIcon>
);

export const LockKeyhole = (props: IconProps) => (
  <BaseIcon {...props}>
    <rect width="18" height="12" x="3" y="10" rx="2" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    <circle cx="12" cy="16" r="1" />
  </BaseIcon>
);

export const BadgeCheck = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </BaseIcon>
);

export const CircleCheckBig = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
    <path d="m9 11 3 3L22 4" />
  </BaseIcon>
);

export const User = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="7" r="4" />
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
  </BaseIcon>
);

export const UserRound = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </BaseIcon>
);

export const History = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </BaseIcon>
);

export const Undo2 = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5H11" />
  </BaseIcon>
);

export const List = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M3 5h.01" />
    <path d="M3 12h.01" />
    <path d="M3 19h.01" />
    <path d="M8 5h13" />
    <path d="M8 12h13" />
    <path d="M8 19h13" />
  </BaseIcon>
);

/* ---------- arayüz ikonları (Lucide çizimleriyle aynı geometri) ---------- */

export const Bell = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
  </BaseIcon>
);

export const BookUser = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M15 13a3 3 0 1 0-6 0" />
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
    <circle cx="12" cy="8" r="2" />
  </BaseIcon>
);

export const CircleHelp = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </BaseIcon>
);

export const Cookie = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
    <path d="M8.5 8.5v.01" />
    <path d="M16 15.5v.01" />
    <path d="M12 12v.01" />
    <path d="M11 17v.01" />
    <path d="M7 14v.01" />
  </BaseIcon>
);

export const Droplets = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
  </BaseIcon>
);

export const ExternalLink = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </BaseIcon>
);

export const Eye = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

export const EyeOff = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
    <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
    <path d="m2 2 20 20" />
  </BaseIcon>
);

export const Hand = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
    <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
    <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </BaseIcon>
);

export const Headset = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
    <path d="M21 16v2a4 4 0 0 1-4 4h-5" />
  </BaseIcon>
);

export const Home = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
    <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </BaseIcon>
);

export const LogIn = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m10 17 5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
  </BaseIcon>
);

export const LogOut = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
  </BaseIcon>
);

export const MapPin = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </BaseIcon>
);

export const MapPinPlus = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M19.914 11.105A7.298 7.298 0 0 0 20 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32 32 0 0 0 .824-.738" />
    <circle cx="12" cy="10" r="3" />
    <path d="M16 18h6" />
    <path d="M19 15v6" />
  </BaseIcon>
);

export const MapPinned = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
    <circle cx="12" cy="8" r="2" />
    <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
  </BaseIcon>
);

export const MessageSquareText = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
    <path d="M7 11h10" />
    <path d="M7 15h6" />
    <path d="M7 7h8" />
  </BaseIcon>
);

export const Moon = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
  </BaseIcon>
);

export const Package = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <path d="m7.5 4.27 9 5.15" />
  </BaseIcon>
);

export const PackageCheck = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="m16 16 2 2 4-4" />
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
    <path d="m7.5 4.27 9 5.15" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" x2="12" y1="22" y2="12" />
  </BaseIcon>
);

export const PackageSearch = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
    <path d="m7.5 4.27 9 5.15" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" x2="12" y1="22" y2="12" />
    <circle cx="18.5" cy="15.5" r="2.5" />
    <path d="M20.27 17.27 22 19" />
  </BaseIcon>
);

export const Pencil = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
    <path d="m15 5 4 4" />
  </BaseIcon>
);

export const ReceiptText = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M13 16H8" />
    <path d="M14 8H8" />
    <path d="M16 12H8" />
    <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
  </BaseIcon>
);

export const RefreshCw = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </BaseIcon>
);

export const RulerDimensionLine = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M10 15v-3" />
    <path d="M14 15v-3" />
    <path d="M18 15v-3" />
    <path d="M2 8V4" />
    <path d="M22 6H2" />
    <path d="M22 8V4" />
    <path d="M6 15v-3" />
    <rect x="2" y="12" width="20" height="8" rx="2" />
  </BaseIcon>
);

export const Send = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </BaseIcon>
);

export const Settings = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
    <circle cx="12" cy="12" r="3" />
  </BaseIcon>
);

export const Share = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M12 2v13" />
    <path d="m16 6-4-4-4 4" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
  </BaseIcon>
);

export const Shield = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  </BaseIcon>
);

export const ShieldCheck = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </BaseIcon>
);

export const ShoppingBag = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M16 10a4 4 0 0 1-8 0" />
    <path d="M3.103 6.034h17.794" />
    <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z" />
  </BaseIcon>
);

export const SlidersHorizontal = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M10 5H3" />
    <path d="M12 19H3" />
    <path d="M14 3v4" />
    <path d="M16 17v4" />
    <path d="M21 12h-9" />
    <path d="M21 19h-5" />
    <path d="M21 5h-7" />
    <path d="M8 10v4" />
    <path d="M8 12H3" />
  </BaseIcon>
);

export const Sparkles = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </BaseIcon>
);

export const SquareArrowOutUpRight = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
    <path d="m21 3-9 9" />
    <path d="M15 3h6v6" />
  </BaseIcon>
);

export const Star = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  </BaseIcon>
);

export const Stars = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </BaseIcon>
);

export const Sun = (props: IconProps) => (
  <BaseIcon {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </BaseIcon>
);

export const Trash = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </BaseIcon>
);

export const Truck = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </BaseIcon>
);

export const UserPlus = (props: IconProps) => (
  <BaseIcon {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </BaseIcon>
);
