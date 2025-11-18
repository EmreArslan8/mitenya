
import { LinkProps } from 'next/link';
import { CSSProperties, ReactNode } from 'react';
import useStyles from './styles';

const Link = (
  props: Omit<LinkProps, 'href'> & {
    children: ReactNode;
    target?: '_self' | '_blank';
    style?: CSSProperties;
    colored?: boolean;
    href: string | null | undefined;
  }
) => {
  const styles = useStyles();

  return props.href ? (
    <Link
      {...props}
      href={props.href.startsWith('http') ? props.href : `/${props.href}`}
      style={{ ...styles.link(props.colored), ...props.style }}
    >
      {props.children}
    </Link>
  ) : (
    <>{props.children}</>
  );
};

export default Link;
