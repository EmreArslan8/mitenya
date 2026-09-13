import { ReactNode } from 'react';

const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex min-h-[calc(100vh-146px)] w-full flex-col gap-2 bg-bg px-2 pb-4 text-bg-contrast-text sm:gap-6">
      <div className="w-full max-w-[1340px] self-center">{children}</div>
    </main>
  );
};

export default MainLayout;
