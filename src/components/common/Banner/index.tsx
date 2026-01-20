import Icon, { IconProps } from '@/components/Icon';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  SxProps,
  Typography,
} from '@mui/material';
import { ReactNode, forwardRef, useEffect, useState } from 'react';
import Button from '../Button';
import useStyles from './styles';
import { ChevronDown } from 'lucide-react';

export type BannerVariant =
  | 'primary'
  | 'primaryDark'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'neutral';
type BannerVariantProps = {
  [K in BannerVariant]: { IconProps: IconProps };
};

const BannerVariants: BannerVariantProps = {
  primary: { IconProps: { name: 'sparkles', fontSize: 20 } },      // stars -> sparkles
  primaryDark: { IconProps: { name: 'sparkles', fontSize: 20 } },
  info: { IconProps: { name: 'info', fontSize: 20 } },             // info -> info
  warning: { IconProps: { name: 'alert-triangle', fontSize: 20 } },// warning -> alert-triangle
  error: { IconProps: { name: 'alert-circle', fontSize: 20 } },    // error için alert-circle daha uygundur
  success: { IconProps: { name: 'check-circle-2', fontSize: 20 } },// task_alt -> check-circle-2
  neutral: { IconProps: { name: 'check-circle-2', fontSize: 20 } },
};

export interface BannerProps {
  variant?: BannerVariant;
  title?: ReactNode;
  icon?: ReactNode;
  IconProps?: IconProps;
  noIcon?: boolean;
  border?: boolean;
  buttonLabel?: ReactNode;
  buttonProps?: any;
  horizontal?: boolean;
  withWhiteBg?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  action?: ReactNode;
  children?: ReactNode;
  sx?: SxProps;
}

const Banner = forwardRef<HTMLDivElement, BannerProps>(
  (
    {
      variant = 'primary',
      title,
      icon: customIcon,
      IconProps,
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
    sx,
  },
  ref
) => {
  const props = BannerVariants[variant];
  const styles = useStyles()(variant, horizontal, withWhiteBg, border);
  const [expanded, setExpanded] = useState(!defaultCollapsed);

    useEffect(() => {
      if (!collapsible) setExpanded(true);
      else setExpanded(!defaultCollapsed);
    }, [collapsible, defaultCollapsed]);

    const icon =
      !noIcon &&
      (customIcon || <Icon sx={styles.icon} {...props.IconProps} {...IconProps} />);
    const button = buttonLabel && (
      <Button
        size="small"
        variant="outlined"
        color={variant}
        {...buttonProps}
        sx={{ ...styles.button, ...buttonProps?.sx } as SxProps}
      >
        {buttonLabel}
      </Button>
    );

    return (
      <Stack sx={{ ...styles.banner, ...sx } as SxProps} ref={ref}>
        {horizontal && icon}
        <Accordion
          disableGutters
          expanded={expanded}
          onChange={() => collapsible && setExpanded((prev) => !prev)}
          elevation={0}
          sx={styles.accordion}
        >
          {(title || (!horizontal && icon) || action) && (
            <AccordionSummary
              expandIcon={
                !horizontal &&
                collapsible && (
                  <Stack
                    sx={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronDown style={styles.icon} />
                  </Stack>
                )
              }
              style={{ cursor: !horizontal && collapsible ? 'pointer' : 'default' }}
              sx={styles.accordionSummary}
            >
              <Stack sx={styles.header}>
                {!horizontal && icon}
                <Typography variant="cardTitle">{title}</Typography>
              </Stack>
              {action}
            </AccordionSummary>
          )}

          {(children || (!horizontal && button)) && (
            <AccordionDetails sx={styles.accordionDetails}>
              {title && <div style={{ height: 8 }} />}
              {children}
              {!horizontal && button}
            </AccordionDetails>
          )}
        </Accordion>
        {horizontal && button}
      </Stack>
    );
  }
);

export default Banner;
