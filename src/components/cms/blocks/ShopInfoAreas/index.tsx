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
  const columns = infoAreas.length || 1;
  return (
    <SectionBase {...section} className="-mt-6 p-0 md:-mt-14">
      <div
        style={{ '--info-columns': columns } as CSSProperties}
        className="grid w-full grid-flow-col auto-cols-[136px] gap-x-1 gap-y-5 overflow-x-auto md:auto-cols-[160px] md:gap-0 lg:grid-flow-row lg:auto-cols-auto lg:grid-cols-[repeat(var(--info-columns),minmax(0,1fr))] lg:overflow-x-visible"
      >
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
