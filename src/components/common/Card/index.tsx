'use client';

import { ReactNode, forwardRef, useEffect, useState } from 'react';
import { ChevronDown } from '@/components/icons';
import { cn } from '@/lib/utils/cn';

export interface CardProps {
  customIcon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  stickyHeader?: boolean;
  noDivider?: boolean;
  border?: boolean;
  action?: ReactNode;
  onClick?: () => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      customIcon,
      title,
      collapsible = false,
      defaultCollapsed = false,
      children,
      stickyHeader = false,
      noDivider = false,
      border = false,
      action,
      onClick,
      className,
      headerClassName,
      titleClassName,
      bodyClassName,
    },
    ref,
  ) => {
    const [expanded, setExpanded] = useState(!(collapsible && defaultCollapsed));

    useEffect(() => {
      setExpanded(collapsible ? !defaultCollapsed : true);
    }, [collapsible, defaultCollapsed]);

    const toggle = () => {
      if (collapsible) setExpanded((current) => !current);
    };

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'flex flex-col rounded-none',
          border && 'border border-gray-100',
          (onClick || collapsible) && 'cursor-pointer',
          className,
        )}
      >
        {(customIcon || title || action) && (
          <div className={cn('w-full', stickyHeader && 'sticky top-0 z-1')}>
            <div
              role={collapsible ? 'button' : undefined}
              tabIndex={collapsible ? 0 : undefined}
              aria-expanded={collapsible ? expanded : undefined}
              onClick={toggle}
              onKeyDown={(event) => {
                if (!collapsible || (event.key !== 'Enter' && event.key !== ' ')) return;
                event.preventDefault();
                toggle();
              }}
              className={cn(
                'flex w-full flex-row items-center justify-between gap-2 px-4 py-3 uppercase',
                headerClassName,
              )}
            >
              <div className="flex w-full min-w-0 flex-row items-center gap-2">
                {customIcon}
                <div className={cn('w-full text-sm font-bold leading-[16.8px]', titleClassName)}>
                  {title}
                </div>
              </div>
              <div className="flex shrink-0 flex-row items-center gap-2">
                {action}
                {collapsible && (
                  <span
                    className={cn(
                      'inline-flex transition-transform duration-150',
                      expanded && 'rotate-180',
                    )}
                  >
                    <ChevronDown size={24} />
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {collapsible ? (
          <div
            hidden={!expanded}
            className={cn(!noDivider && 'border-t border-gray-100', bodyClassName)}
          >
            {children}
          </div>
        ) : (
          children
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;
