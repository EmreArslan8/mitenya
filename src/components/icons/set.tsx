import { createIcon } from './BaseIcon';

/*
 * Yerel SVG ikon seti. Hepsi BaseIcon üstünden çizilir; buradaki her giriş
 * yalnızca kendi çizim düğümlerini ve varsayılan çizgi kalınlığını tanımlar.
 *
 * Kalınlık düzeni:
 *   1.25 — çift chevron (setin en incesi)
 *   1.5  — oklar, artı/eksi, daire ve glif ikonları (varsayılan)
 *   2    — chevron, ArrowLeft, Check, Heart (mevcut arayüzde kalın duruyorlar)
 */

/* ---------- oklar ---------- */

export const ArrowLeft = createIcon(
  'ArrowLeft',
  <>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </>,
  2,
);

export const ArrowRight = createIcon(
  'ArrowRight',
  <>
    <path d="M4 12h15" />
    <path d="m12.5 6 6.5 6-6.5 6" />
  </>,
);

export const ArrowUpRight = createIcon(
  'ArrowUpRight',
  <>
    <path d="M6 18 18 6" />
    <path d="M10.5 6H18v7.5" />
  </>,
);

export const ArrowUpDown = createIcon(
  'ArrowUpDown',
  <>
    <path d="M7 19.5v-15" />
    <path d="m3.5 8 3.5-3.5L10.5 8" />
    <path d="M17 4.5v15" />
    <path d="m13.5 16 3.5 3.5 3.5-3.5" />
  </>,
);

/* ---------- chevron ---------- */

export const ChevronLeft = createIcon('ChevronLeft', <path d="m15 18-6-6 6-6" />, 2);
export const ChevronRight = createIcon('ChevronRight', <path d="m9 18 6-6-6-6" />, 2);
export const ChevronUp = createIcon('ChevronUp', <path d="m18 15-6-6-6 6" />, 2);
export const ChevronDown = createIcon('ChevronDown', <path d="m6 9 6 6 6-6" />, 2);

export const DoubleChevronLeft = createIcon(
  'DoubleChevronLeft',
  <>
    <path d="m13 18-6-6 6-6" />
    <path d="m19 18-6-6 6-6" />
  </>,
  1.25,
);

export const DoubleChevronRight = createIcon(
  'DoubleChevronRight',
  <>
    <path d="m5 6 6 6-6 6" />
    <path d="m11 6 6 6-6 6" />
  </>,
  1.25,
);

/* ---------- artı / eksi ---------- */

export const Plus = createIcon(
  'Plus',
  <>
    <path d="M12 4.5v15" />
    <path d="M4.5 12h15" />
  </>,
);

export const Minus = createIcon('Minus', <path d="M4.5 12h15" />);

/* ---------- durum ---------- */

export const Check = createIcon('Check', <path d="M20 6 9 17l-5-5" />, 2);

export const Heart = createIcon(
  'Heart',
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />,
  2,
);

export const CloseIcon = createIcon('CloseIcon', <path d="M18 6 6 18M6 6l12 12" />);

/* ---------- daire tabanlı ---------- */

export const CheckCircle2 = createIcon(
  'CheckCircle2',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

export const XCircle = createIcon(
  'XCircle',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </>,
);

export const AlertCircle = createIcon(
  'AlertCircle',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
);

export const Info = createIcon(
  'Info',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </>,
);

export const Ban = createIcon(
  'Ban',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M4.929 4.929 19.07 19.071" />
  </>,
);

export const Clock = createIcon(
  'Clock',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </>,
);

export const Clock3 = createIcon(
  'Clock3',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6h4" />
  </>,
);

export const Search = createIcon(
  'Search',
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.34-4.34" />
  </>,
);

export const SearchX = createIcon(
  'SearchX',
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="m13.5 8.5-5 5" />
    <path d="m8.5 8.5 5 5" />
    <path d="m21 21-4.3-4.3" />
  </>,
);

/* ---------- çizgi ve dikdörtgen tabanlı ---------- */

export const Asterisk = createIcon(
  'Asterisk',
  <>
    <path d="M12 6v12" />
    <path d="M17.196 9 6.804 15" />
    <path d="m6.804 9 10.392 6" />
  </>,
);

export const Menu = createIcon(
  'Menu',
  <>
    <path d="M4 5h16" />
    <path d="M4 12h16" />
    <path d="M4 19h16" />
  </>,
);

export const MoreVertical = createIcon(
  'MoreVertical',
  <>
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="19" r="1" />
  </>,
);

export const TrendingDown = createIcon(
  'TrendingDown',
  <>
    <path d="M16 17h6v-6" />
    <path d="m22 17-8.5-8.5-5 5L2 7" />
  </>,
);

export const CreditCard = createIcon(
  'CreditCard',
  <>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <path d="M2 10h20" />
  </>,
);

export const Calendar = createIcon(
  'Calendar',
  <>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </>,
);

/* ---------- tek yaylı ikonlar ---------- */

export const Lock = createIcon(
  'Lock',
  <>
    <rect width="18" height="11" x="3" y="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
);

export const LockKeyhole = createIcon(
  'LockKeyhole',
  <>
    <rect width="18" height="12" x="3" y="10" rx="2" />
    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    <circle cx="12" cy="16" r="1" />
  </>,
);

export const BadgeCheck = createIcon(
  'BadgeCheck',
  <>
    <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

export const CircleCheckBig = createIcon(
  'CircleCheckBig',
  <>
    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
    <path d="m9 11 3 3L22 4" />
  </>,
);

export const User = createIcon(
  'User',
  <>
    <circle cx="12" cy="7" r="4" />
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
  </>,
);

export const UserRound = createIcon(
  'UserRound',
  <>
    <circle cx="12" cy="8" r="5" />
    <path d="M20 21a8 8 0 0 0-16 0" />
  </>,
);

export const History = createIcon(
  'History',
  <>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </>,
);

export const Undo2 = createIcon(
  'Undo2',
  <>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5H11" />
  </>,
);

export const List = createIcon(
  'List',
  <>
    <path d="M3 5h.01" />
    <path d="M3 12h.01" />
    <path d="M3 19h.01" />
    <path d="M8 5h13" />
    <path d="M8 12h13" />
    <path d="M8 19h13" />
  </>,
);
