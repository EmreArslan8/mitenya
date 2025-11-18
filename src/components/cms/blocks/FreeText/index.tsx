'use client'

import Markdown from '@/components/common/Markdown';
import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';

export interface FreeTextProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  text?: string;
}

const FreeText = ({ section, text }: FreeTextProps) => {

  return (
    <SectionBase {...section}>
      <Markdown text={text} />
    </SectionBase>
  );
};

export default FreeText;
