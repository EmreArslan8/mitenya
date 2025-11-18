"use client";

import NextLink, { LinkProps } from "next/link";
import { CSSProperties, ReactNode } from "react";
import useStyles from "./styles";

type Props = Omit<LinkProps, "href"> & {
  href: string | null | undefined;
  children: ReactNode;
  target?: "_self" | "_blank";
  style?: CSSProperties;
  colored?: boolean;
};

const Link = ({ href, children, colored, style, ...rest }: Props) => {
  const styles = useStyles();

  if (!href) return <>{children}</>;

  return (
    <NextLink
      {...rest}
      href={href} // ❗ artı prefix yok, direkt real URL
      style={{ ...styles.link(colored), ...style }}
    >
      {children}
    </NextLink>
  );
};

export default Link;
