import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type ColumnProps = { children: ReactNode; className?: string };

export const PrimaryColumn = ({ children, className }: ColumnProps) => {
  return <div className={cn('flex w-full flex-col gap-4 md:gap-6', className)}>{children}</div>;
};

export const SecondaryColumn = ({ children, className }: ColumnProps) => {
  return (
    <aside
      className={cn(
        'flex w-full flex-col gap-4 sm:w-[340px] sm:max-w-[340px] md:w-[400px] md:min-w-[400px] md:gap-6',
        className,
      )}
    >
      {children}
    </aside>
  );
};

const TwoColumnLayout = ({
  children,
  reverseColsOnMobile = false,
  className,
}: {
  children: ReactNode;
  reverseColsOnMobile?: boolean;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'flex w-full gap-4 md:gap-6',
        reverseColsOnMobile ? 'flex-col-reverse sm:flex-row' : 'flex-col sm:flex-row',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default TwoColumnLayout;
