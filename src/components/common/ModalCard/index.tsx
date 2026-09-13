'use client';

import { ReactNode } from 'react';
import { CloseIcon } from '@/components/icons';
import Dialog from '@/components/ui/Dialog';
import { cn } from '@/lib/utils/cn';
import Card, { CardProps } from '../Card';

type ModalCardLayout = 'dialog' | 'bottom-sheet' | 'center';

export interface ModalCardProps extends CardProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  showCloseIcon?: boolean;
  fullWidth?: boolean;
  layout?: ModalCardLayout;
  bottomOffset?: number | string;
  keepMounted?: boolean;
  disableAutoFocus?: boolean;
  dialogClassName?: string;
  overlayClassName?: string;
  layer?: number;
}

const ModalCard = ({
  open,
  onClose,
  children,
  showCloseIcon = false,
  fullWidth = false,
  layout = 'dialog',
  bottomOffset = 0,
  keepMounted = false,
  disableAutoFocus = false,
  dialogClassName,
  overlayClassName,
  layer,
  customIcon,
  className,
  bodyClassName,
  title,
  ...cardProps
}: ModalCardProps) => {
  const isBottomSheet = layout === 'bottom-sheet';
  const position = isBottomSheet ? 'bottom' : layout === 'center' ? 'center' : 'responsive';
  const offset = typeof bottomOffset === 'number' ? `${bottomOffset}px` : bottomOffset;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose?.();
      }}
      position={position}
      srTitle={typeof title === 'string' ? title : 'Pencere'}
      keepMounted={keepMounted}
      disableAutoFocus={disableAutoFocus}
      className={cn(
        'max-h-[calc(100%-16px)] overflow-visible bg-transparent p-0',
        layout === 'center' &&
          !fullWidth &&
          'w-fit max-w-[calc(100%-8px)] sm:max-w-[calc(100%-32px)]',
        layout === 'dialog' &&
          !fullWidth &&
          'sm:w-fit sm:max-w-[calc(100%-32px)]',
        isBottomSheet && 'w-full max-w-full rounded-t-2xl',
        fullWidth && 'w-full max-w-full',
        dialogClassName,
      )}
      overlayClassName={overlayClassName}
      style={{ marginBottom: isBottomSheet ? offset : undefined, zIndex: layer }}
      overlayStyle={{ bottom: isBottomSheet ? offset : undefined, zIndex: layer }}
    >
      <Card
        {...cardProps}
        title={title}
        customIcon={customIcon}
        stickyHeader
        className={cn(
          'max-h-full w-full bg-bg sm:w-fit sm:max-w-[600px]',
          (fullWidth || isBottomSheet) && 'max-w-full sm:w-full sm:max-w-full',
          isBottomSheet && 'rounded-t-2xl',
          className,
        )}
        headerClassName={cn('bg-bg', cardProps.headerClassName)}
        action={
          showCloseIcon ? (
            <button
              type="button"
              aria-label="Pencereyi kapat"
              onClick={onClose}
              className="inline-flex cursor-pointer text-text [&_svg]:size-5 sm:[&_svg]:size-7"
            >
              <CloseIcon size={28} />
            </button>
          ) : cardProps.action
        }
      >
        <div
          className={cn(
            'flex max-w-full flex-col gap-6 overflow-y-auto p-4 sm:p-6',
            bodyClassName,
          )}
        >
          {children}
        </div>
      </Card>
    </Dialog>
  );
};

export default ModalCard;
