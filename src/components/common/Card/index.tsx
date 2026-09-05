
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Stack,
  SxProps,
  Typography,
  TypographyProps,
} from '@mui/material';
import { ReactNode, forwardRef, useEffect, useState } from 'react';
import { ChevronDown } from '@/components/icons';
import useStyles from './styles';

export interface CardProps {
  /** Başlık ikonu; doğrudan bileşen olarak verilir. */
  customIcon?: ReactNode;
  title?: ReactNode;
  titleProps?: Partial<TypographyProps>;
  children?: ReactNode;
  sx?: SxProps & { header?: SxProps };
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  stickyHeader?: boolean;
  /** Yalnızca açılır kartın gövde üstü çizgisini kapatır. */
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
      titleProps,
      collapsible,
      defaultCollapsed,
      children,
      stickyHeader = false,
      noDivider = false,
      border = false,
      action,
      onClick,
      sx,
    }: CardProps,
    ref
  ) => {
    const [expanded, setExpanded] = useState(!(collapsible && defaultCollapsed));
    const styles = useStyles()(border, stickyHeader, expanded);
    const icon = customIcon;

    useEffect(() => {
      if (!collapsible) setExpanded(true);
      else setExpanded(!defaultCollapsed);
    }, [collapsible, defaultCollapsed]);

    return (
      <Stack
        sx={{
          ...styles.card,
          cursor: onClick || collapsible ? 'pointer' : 'unset',
          ...sx,
        }}
        onClick={onClick}
        ref={ref}
      >
        {(icon || title || action) && (
          <Stack sx={styles.cardHeaderContainer} onClick={() => setExpanded((prev) => !prev)}>
            <Stack sx={{ ...styles.cardHeader, ...sx?.header }}>
              <Stack sx={styles.iconAndTitle}>
                {icon}
                <Typography variant="cardTitle" {...titleProps} width="100%">
                  {title}
                </Typography>
              </Stack>
              <Stack sx={styles.actionArea}>
                {action}
                {collapsible && (
                  <Stack component="span" sx={styles.expandIcon}>
                    <ChevronDown size={24} />
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
        )}
        {collapsible ? (
          <Accordion expanded={expanded} disableGutters elevation={0} sx={styles.accordion}>
            <AccordionSummary sx={styles.accordionSummary} />
            <AccordionDetails sx={styles.accordionDetails(noDivider)}>{children}</AccordionDetails>
          </Accordion>
        ) : (
          <>{children}</>
        )}
      </Stack>
    );
  }
);

export default Card;
