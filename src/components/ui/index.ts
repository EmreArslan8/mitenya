/**
 * ⚠️ BU BARREL'I KULLANMA — bileşenleri DOĞRUDAN yolundan import et:
 *
 *     import { Stack } from '@/components/ui/Stack';   ✅
 *     import { Stack } from '@/components/ui';         ❌
 *
 * SEBEP (2026-09-08'de ölçüldü): barrel'dan tek bir bileşen almak, Next'in
 * modül grafiğinde tüm dosyayı canlı tutuyor ve `Navigation` yalnızca `Badge`
 * aldığı hâlde TÜM Radix paketleri paylaşılan chunk'a giriyordu:
 * First Load JS 227 kB -> 287 kB (+60 kB, her sayfada).
 *
 * `experimental.optimizePackageImports` denendi, iç alias'lara işlemiyor.
 *
 * Dosya yalnızca geriye dönük uyum için duruyor; yeni kod doğrudan yol kullanır.
 * Kural `eslint.config.mjs`'te mekanik olarak da engellenir.
 */
export { Stack, type StackProps, type SpacingToken } from './Stack';
export { Typography, type TypographyProps } from './Typography';
export { Button, type ButtonProps } from './Button';
export { Link, type LinkProps } from './Link';
export { Divider, type DividerProps } from './Divider';
export { Skeleton, type SkeletonProps } from './Skeleton';
export { Spinner, type SpinnerProps } from './Spinner';
export { Badge, type BadgeProps } from './Badge';
export { Chip, type ChipProps } from './Chip';
export { ProgressBar, type ProgressBarProps } from './ProgressBar';
export { Dialog, DialogTitle, DialogClose, type DialogProps } from './Dialog';
export { Accordion, AccordionItem, type AccordionProps, type AccordionItemProps } from './Accordion';
export { Select, SelectItem, type SelectProps, type SelectItemProps } from './Select';
export { DropdownMenu, DropdownMenuItem, type DropdownMenuProps, type DropdownMenuItemProps } from './DropdownMenu';
export { Popover, type PopoverProps } from './Popover';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Switch, type SwitchProps } from './Switch';
export { Slider, type SliderProps } from './Slider';
export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsProps } from './Tabs';
export { Toast, type ToastProps } from './Toast';
export { Rating, type RatingProps } from './Rating';
export { RatingInput, type RatingInputProps } from './Rating/RatingInput';
