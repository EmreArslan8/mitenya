import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const xsDown = useMediaQuery(theme.breakpoints.down('xs'));
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const mdDown = useMediaQuery(theme.breakpoints.down('md'));
  const lgDown = useMediaQuery(theme.breakpoints.down('lg'));
  const xlDown = useMediaQuery(theme.breakpoints.down('xl'));

  const xsUp = useMediaQuery(theme.breakpoints.up('xs'));
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const xlUp = useMediaQuery(theme.breakpoints.up('xl'));

  return {
    isMobile,
    isTablet,
    xsDown,
    smDown,
    mdDown,
    lgDown,
    xlDown,
    xsUp,
    smUp,
    mdUp,
    lgUp,
    xlUp,
  };
};
export default useScreen;
