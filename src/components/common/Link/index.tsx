"use client";

import NextLink, { LinkProps } from "next/link";
import { CSSProperties, ReactNode } from "react";
import { cn } from '@/lib/utils/cn';

type Props = Omit<LinkProps, "href"> & {
  href: string | null | undefined;
  children: ReactNode;
  target?: "_self" | "_blank";
  rel?: string;
  style?: CSSProperties;
  colored?: boolean;
  className?: string;
};

const Link = ({ href, children, colored, style, className, ...rest }: Props) => {
  if (!href) return <>{children}</>;

  return (
    <NextLink
      {...rest}
      href={href} // ❗ artı prefix yok, direkt real URL
      style={style}
      className={cn(
        'no-underline',
        colored ? 'text-primary visited:text-primary-dark hover:text-primary active:text-primary-dark' : 'text-inherit',
        className,
      )}
    >
      {children}
    </NextLink>
  );
};

export default Link;
