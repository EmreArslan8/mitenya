import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const useScreen = () => {
  const theme = useTheme();
  const ssrOptions = { noSsr: true };
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'), ssrOptions);
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'), ssrOptions);

  const xsDown = useMediaQuery(theme.breakpoints.down('xs'), ssrOptions);
  const smDown = useMediaQuery(theme.breakpoints.down('sm'), ssrOptions);
  const mdDown = useMediaQuery(theme.breakpoints.down('md'), ssrOptions);
  const lgDown = useMediaQuery(theme.breakpoints.down('lg'), ssrOptions);
  const xlDown = useMediaQuery(theme.breakpoints.down('xl'), ssrOptions);

  const xsUp = useMediaQuery(theme.breakpoints.up('xs'), ssrOptions);
  const smUp = useMediaQuery(theme.breakpoints.up('sm'), ssrOptions);
  const mdUp = useMediaQuery(theme.breakpoints.up('md'), ssrOptions);
  const lgUp = useMediaQuery(theme.breakpoints.up('lg'), ssrOptions);
  const xlUp = useMediaQuery(theme.breakpoints.up('xl'), ssrOptions);

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
