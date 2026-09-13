import { ReactNode } from 'react';

export default function InfluencerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pb-16 pt-4 md:pt-8">{children}</div>
  );
}
