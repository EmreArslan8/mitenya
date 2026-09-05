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
import { AlertCircle, CheckCircle2, ChevronDown, Info } from '@/components/icons';
import { AlertTriangle, Sparkles } from 'lucide-react';

export type BannerVariant =
  | 'primary'
  | 'info'
  | 'warning'
  | 'error'
  | 'success'
  | 'neutral';
/** Varyantın kendi ikonu; çağıran `icon` verirse bu kullanılmaz. */
const BannerVariantIcons: Record<BannerVariant, ReactNode> = {
  primary: <Sparkles size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
  error: <AlertCircle size={20} />,
  success: <CheckCircle2 size={20} />,
  neutral: <CheckCircle2 size={20} />,
};

export interface BannerProps {
  variant?: BannerVariant;
  title?: ReactNode;
  icon?: ReactNode;
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
  const styles = useStyles()(variant, horizontal, withWhiteBg, border);
  const [expanded, setExpanded] = useState(!defaultCollapsed);

    useEffect(() => {
      if (!collapsible) setExpanded(true);
      else setExpanded(!defaultCollapsed);
    }, [collapsible, defaultCollapsed]);

    const icon =
      !noIcon &&
      (customIcon || <Stack sx={styles.icon}>{BannerVariantIcons[variant]}</Stack>);
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
