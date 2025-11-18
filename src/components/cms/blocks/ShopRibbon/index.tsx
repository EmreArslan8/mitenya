import Button from '@/components/common/Button';
import Markdown from '@/components/common/Markdown';
import useScreen from '@/lib/hooks/useScreen';
import { Stack, Typography } from '@mui/material';
import { BlockComponentBaseProps } from '..';
import CMSImage from '../../shared/CMSImage';
import SectionBase, { SectionBaseProps } from '../../shared/SectionBase';
import { SharedButtonType, SharedImageType } from '../../shared/cmsTypes';
import useStyles from './styles';

export interface ShopRibbonProps extends BlockComponentBaseProps {
  section: SectionBaseProps;
  image?: SharedImageType;
  title: string;
  description: string;
  colorway: 'primary' | 'info' | 'success' | 'error' | 'warning';
  button?: SharedButtonType;
}

const ShopRibbon = ({ section, image, title, description, colorway, button }: ShopRibbonProps) => {
  const styles = useStyles()(colorway);
  const { smUp } = useScreen();

  return (
    <SectionBase {...section}>
      <Stack sx={styles.container}>
        {image?.data && (
          <CMSImage
            fill
            src={image.data.attributes.url}
            alt={image.data.attributes.alternativeText}
            style={styles.image}
            sizes="1200px"
          />
        )}
        <Stack sx={styles.content}>
          <Stack sx={styles.text}>
            <Typography component="h2" variant={smUp ? 'h1' : 'h2'}>
              {title}
            </Typography>
            <Markdown text={description} options={styles.markdownOptions} />
          </Stack>
          {button && (
            <Button color={colorway} {...button} size="small">
              {button.label}
            </Button>
          )}
        </Stack>
      </Stack>
    </SectionBase>
  );
};

export default ShopRibbon;
