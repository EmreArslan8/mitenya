import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CrossFadeProps {
  components: {
    in: boolean;
    component: ReactNode;
  }[];
}

const CrossFade = ({ components }: CrossFadeProps) => {
  return (
    <span className="relative block size-full">
      {components.map((component, index) => (
          <span
            key={index}
            aria-hidden={!component.in}
            className={cn('absolute inset-0 flex items-center justify-center transition-[opacity,visibility] duration-200', component.in ? 'visible opacity-100' : 'invisible opacity-0')}
          >
            {component.component}
          </span>
      ))}
    </span>
  );
};

export { CrossFade };
