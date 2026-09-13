'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * Modal / yan panel — MUI `<Dialog>`, `<Modal>` ve `<Drawer>`'ın tek karşılığı.
 *
 * `'use client'` GEREKÇESİ: Radix açık/kapalı durumunu, focus tuzağını ve
 * scroll kilidini çalışma zamanında yönetiyor.
 *
 * Radix'in getirdikleri (elle yazılmayacak, geçersiz kılınmayacak):
 *   focus trap · Escape ile kapanma · dışarı tıklama · scroll lock
 *   aria-modal / role=dialog · açılışta focus, kapanışta focus'u geri verme
 *
 * `position` görünümü değil YERLEŞİMİ adlandırır:
 *   center      ortalanmış klasik dialog          (MUI Dialog/Modal)
 *   top         viewport'un tepesine yapışık tam genişlik şerit
 *               (MUI `<Modal><LinearProgress/></Modal>` karşılığı)
 *   bottom      alttan gelen sayfa (bottom sheet) (MUI Drawer anchor="bottom")
 *   left        soldan gelen panel                (MUI Drawer anchor="left")
 *   right       sağdan gelen panel                (MUI Drawer anchor="right")
 *   responsive  md altında bottom, üstünde center — eskiden `useScreen` ile
 *               JS'te yapılan dallanmanın CSS karşılığı (ADR-0002 §11)
 *
 * Erişilebilirlik: Radix her dialog'da bir başlık ister. Görsel başlık
 * istenmiyorsa `srTitle` verilir; ekran okuyucuya okunur, ekranda görünmez.
 */

const POSITION = {
  center:
    'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-h-[90vh] w-[calc(100%-32px)] max-w-lg rounded-lg ' +
    'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out',
  top:
    'left-0 right-0 top-0 w-full ' +
    'data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out',
  bottom:
    'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl ' +
    'data-[state=open]:animate-sheet-up data-[state=closed]:animate-sheet-down',
  left:
    'bottom-0 left-0 top-0 w-[85vw] max-w-sm ' +
    'data-[state=open]:animate-sheet-left-in data-[state=closed]:animate-sheet-left-out',
  right:
    'bottom-0 right-0 top-0 w-[85vw] max-w-sm ' +
    'data-[state=open]:animate-sheet-right-in data-[state=closed]:animate-sheet-right-out',
  responsive:
    'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl ' +
    'data-[state=open]:animate-sheet-up data-[state=closed]:animate-sheet-down ' +
    'sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100%-32px)] sm:max-w-lg ' +
    'sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-lg ' +
    'sm:data-[state=open]:animate-dialog-in sm:data-[state=closed]:animate-dialog-out',
} as const;

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  position?: keyof typeof POSITION;
  /** Görsel başlık yoksa ekran okuyucu için zorunlu. */
  srTitle?: string;
  /** Panelin kendisine uygulanır. */
  className?: string;
  overlayClassName?: string;
  /** Dışarı tıklayınca / Escape ile kapanmayı engeller (ör. zorunlu akışlar). */
  dismissible?: boolean;
  keepMounted?: boolean;
  disableAutoFocus?: boolean;
  style?: CSSProperties;
  overlayStyle?: CSSProperties;
};

export function Dialog({
  open,
  onOpenChange,
  children,
  position = 'center',
  srTitle,
  className,
  overlayClassName,
  dismissible = true,
  keepMounted = false,
  disableAutoFocus = false,
  style,
  overlayStyle,
}: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} modal={open}>
      <RadixDialog.Portal forceMount={keepMounted ? true : undefined}>
        <RadixDialog.Overlay
          forceMount={keepMounted ? true : undefined}
          style={overlayStyle}
          className={cn(
            'fixed inset-0 z-[1300] bg-black/50',
            'data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out',
            keepMounted && 'data-[state=closed]:invisible',
            overlayClassName,
          )}
        />
        <RadixDialog.Content
          forceMount={keepMounted ? true : undefined}
          style={style}
          className={cn(
            'fixed z-[1300] overflow-y-auto bg-white shadow-xl outline-none',
            POSITION[position],
            keepMounted && 'data-[state=closed]:invisible',
            className,
          )}
          onInteractOutside={(e) => {
            if (!dismissible) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (!dismissible) e.preventDefault();
          }}
          onOpenAutoFocus={(e) => {
            if (disableAutoFocus) e.preventDefault();
          }}
        >
          {srTitle && (
            <RadixDialog.Title className="sr-only">{srTitle}</RadixDialog.Title>
          )}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

/** Görsel başlık — verildiğinde `srTitle`a gerek kalmaz. */
export const DialogTitle = RadixDialog.Title;
/** Kapatma düğmesini sarmalar; tıklandığında dialog kapanır. */
export const DialogClose = RadixDialog.Close;

export default Dialog;
