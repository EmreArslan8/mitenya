import { keyframes } from '@mui/system';

const fadeInOut = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-25px);
  }
  15% {
    opacity: 1;
    transform: translateY(0);
  }
  85% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(25px);
  }
`;

const styles = {
  content: {
    opacity: 0,
    animation: `${fadeInOut} 5s ease-in-out infinite`,
    display: 'flex',
    justifyContent: 'center',
  },
  hiddenContent: {
    display: 'none',
  },
  visibleContent: {
    display: 'flex',
    justifyContent: 'center',
  },
};

export default styles;
