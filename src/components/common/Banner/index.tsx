'use client';

import { ReactNode, forwardRef, useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, Info, Sparkles } from '@/components/icons';
import Button, { ButtonProps } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export type BannerVariant = 'primary' | 'info' | 'warning' | 'error' | 'success' | 'neutral';

const VARIANT_ICONS: Record<BannerVariant, ReactNode> = {
  primary: <Sparkles size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
  error: <AlertCircle size={20} />,
  success: <CheckCircle2 size={20} />,
  neutral: <CheckCircle2 size={20} />,
};

const VARIANT_STYLES: Record<BannerVariant, { surface: string; text: string; border: string }> = {
  primary: { surface: 'bg-bg-light', text: 'text-text', border: 'border-tertiary-light' },
  info: { surface: 'bg-info-light', text: 'text-info', border: 'border-info' },
  warning: { surface: 'bg-warning-light', text: 'text-warning', border: 'border-warning' },
  error: { surface: 'bg-error-light', text: 'text-error', border: 'border-error' },
  success: { surface: 'bg-success-light', text: 'text-success', border: 'border-success' },
  neutral: { surface: 'bg-neutral-light', text: 'text-neutral', border: 'border-neutral' },
};

export interface BannerProps {
  variant?: BannerVariant;
  title?: ReactNode;
  icon?: ReactNode;
  noIcon?: boolean;
  border?: boolean;
  buttonLabel?: ReactNode;
  buttonProps?: Omit<ButtonProps, 'children'>;
  horizontal?: boolean;
  withWhiteBg?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const Banner = forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      variant = 'primary',
      title,
      icon: customIcon,
      noIcon = false,
      border = false,
      buttonLabel,
      buttonProps,
      horizontal = false,
      withWhiteBg = false,
      collapsible = false,
      defaultCollapsed = false,
      action,
      children,
      className,
    },
    ref,
  ) => {
    const [expanded, setExpanded] = useState(!defaultCollapsed);
    const colors = VARIANT_STYLES[variant];
    const buttonColor: ButtonProps['color'] =
      variant === 'primary' || variant === 'error' || variant === 'neutral'
        ? variant
        : 'neutral';

    useEffect(() => {
      setExpanded(collapsible ? !defaultCollapsed : true);
    }, [collapsible, defaultCollapsed]);

    const icon = !noIcon && (
      <span className={cn('inline-flex shrink-0', colors.text)}>
        {customIcon || VARIANT_ICONS[variant]}
      </span>
    );
    const button = buttonLabel ? (
      <Button
        size="small"
        variant="outlined"
        color={buttonColor}
        {...buttonProps}
        className={cn(
          horizontal ? 'w-max shrink-0' : 'mt-4 w-full',
          buttonProps?.className,
        )}
      >
        {buttonLabel}
      </Button>
    ) : null;

    return (
      <div
        ref={ref}
        className={cn(
          'flex h-fit gap-4 rounded-lg p-2',
          horizontal ? 'flex-row items-center' : 'flex-col items-start',
          withWhiteBg ? 'bg-white' : colors.surface,
          border && ['border', colors.border],
          className,
        )}
      >
        {horizontal && icon}
        <div className="w-full bg-transparent">
          {(title || (!horizontal && icon) || action) && (
            <div
              role={collapsible ? 'button' : undefined}
              tabIndex={collapsible ? 0 : undefined}
              aria-expanded={collapsible ? expanded : undefined}
              onClick={() => collapsible && setExpanded((current) => !current)}
              onKeyDown={(event) => {
                if (!collapsible || (event.key !== 'Enter' && event.key !== ' ')) return;
                event.preventDefault();
                setExpanded((current) => !current);
              }}
              className={cn(
                'flex min-h-0 w-full items-center gap-4',
                collapsible && 'cursor-pointer',
              )}
            >
              <div className={cn('flex w-full flex-row items-center gap-3', colors.text)}>
                {!horizontal && icon}
                <div className="text-sm font-bold leading-[16.8px]">{title}</div>
              </div>
              {action}
              {!horizontal && collapsible && (
                <ChevronDown
                  size={20}
                  className={cn('shrink-0 transition-transform duration-150', colors.text, expanded && 'rotate-180')}
                />
              )}
            </div>
          )}

          {(children || (!horizontal && button)) && (
            <div hidden={!expanded} className="flex flex-col">
              {title && <div className="h-2" />}
              {children}
              {!horizontal && button}
            </div>
          )}
        </div>
        {horizontal && button}
      </div>
    );
  },
);

Banner.displayName = 'Banner';

export default Banner;
