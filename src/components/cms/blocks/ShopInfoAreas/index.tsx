import type { CSSProperties } from 'react';
import { BlockComponentBaseProps } from '..';
import InfoArea from '../../shared/InfoArea';
import { SharedImageType } from '../../shared/cmsTypes';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';

export interface InfoAreasProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  infoAreas: { label?: string; description: string; url?: string; icon?: SharedImageType }[];
}

const ShopInfoAreas = ({ section, infoAreas }: InfoAreasProps) => {
  const columns = Math.min(infoAreas.length || 1, 4);
  return (
    <SectionBase {...section} className="-mt-6 p-0 md:-mt-14">
      <div style={{ '--info-columns': columns } as CSSProperties} className="grid grid-cols-[repeat(var(--info-columns),minmax(0,1fr))] gap-x-1 gap-y-5 md:gap-0">
        {infoAreas.map((infoArea, index) => (
          <div key={`${infoArea.label ?? 'info'}-${index}`} className="relative flex w-full items-center justify-center">
            <InfoArea {...infoArea} index={index} />
          </div>
        ))}
      </div>
    </SectionBase>
  );
};

export default ShopInfoAreas;
