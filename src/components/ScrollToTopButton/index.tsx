import useScrollPosition from '@/lib/hooks/useScrollPosition';
import { Stack } from '@mui/material';
import Icon from '../Icon';
import useStyles from './styles';

interface ScrollToTopButtonProps {
  threshold?: number;
}

const ScrollToTopButton = ({ threshold = 500 }: ScrollToTopButtonProps) => {
  const scrollPosition = useScrollPosition();
  const styles = useStyles()(scrollPosition > threshold);
  return (
    <Stack sx={styles.container} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      <Icon name="expand_less" color="tertiary" />
    </Stack>
  );
};

export default ScrollToTopButton;
