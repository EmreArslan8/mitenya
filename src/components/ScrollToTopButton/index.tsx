import useScrollPosition from '@/lib/hooks/useScrollPosition';
import { Stack } from '@mui/material';
import useStyles from './styles';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  threshold?: number;
}

const ScrollToTopButton = ({ threshold = 500 }: ScrollToTopButtonProps) => {
  const scrollPosition = useScrollPosition();
  const styles = useStyles()(scrollPosition > threshold);
  return (
    <Stack sx={styles.container} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <ChevronUp color={styles.iconColor} />
    </Stack>
  );
};

export default ScrollToTopButton;
