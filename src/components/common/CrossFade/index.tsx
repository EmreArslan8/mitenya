import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import { ReactNode } from 'react';

interface CrossFadeProps {
  components: {
    in: boolean;
    component: ReactNode;
  }[];
}

const CrossFade = ({ components }: CrossFadeProps) => {
  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      {components.map((component, index) => (
        <Fade key={index} in={component.in}>
          <Stack
            sx={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {component.component}
          </Stack>
        </Fade>
      ))}
    </Box>
  );
};

export { CrossFade };
