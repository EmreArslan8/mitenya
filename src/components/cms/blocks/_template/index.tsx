// import styles from './styles';

import { BlockComponentBaseProps } from '..';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';

export interface TemplateBlockComponentProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
}

const TemplateBlockComponent = ({ section }: TemplateBlockComponentProps) => {
  return <SectionBase {...section}>Stuff goes here</SectionBase>;
};

export default TemplateBlockComponent;
