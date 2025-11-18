import Banner from '@/components/common/Banner';
import Card from '@/components/common/Card';
import { ShopProductRating, ShopProductReview } from '@/lib/api/types';
import { Divider, Rating, Stack, Typography } from '@mui/material';
import Image from 'next/image';
import useStyles from './styles';

const ProductReviews = ({
  reviews,
  rating,
}: {
  reviews: ShopProductReview[];
  rating: ShopProductRating;
}) => {
  const styles = useStyles();
  return (
    <Stack gap={1}>
      <Typography variant="h2">{('reviews')}</Typography>
      <Card
        border
        titleProps={{ textTransform: 'none' }}
        title={
          <Stack>
            <Stack sx={{ ...styles.rating, gap: 1 }}>
              <Typography variant="h3">{rating.averageRating}</Typography>
              <Rating
                readOnly
                precision={0.1}
                value={rating.averageRating}
                sx={{ fontSize: { xs: 18, sm: 22 } }}
              />
              <Typography variant="warningSemibold">({rating.totalCount})</Typography>
            </Stack>
          </Stack>
        }
      >
        <Banner
          icon={
            <Image
              src="/static/images/google_translate.png"
              width={22}
              height={22}
              alt="google translate"
            />
          }
          variant="neutral"
          title={('shop.translationBanner')}
          sx={{ borderRadius: 0, px: 2 }}
        />
        {reviews.map((e, i) => (
          <Stack gap={0.5} key={e.text}>
            <Stack sx={styles.review}>
              <Stack sx={styles.review.header}>
                {e.rating && <Rating readOnly sx={{ fontSize: 14 }} value={e.rating} />}
                <Typography variant="caption">{e.name}</Typography>
                <Typography variant="caption">|</Typography>
                <Typography variant="caption">{e.date}</Typography>
              </Stack>
              <Typography variant="body">{e.text}</Typography>
            </Stack>
            {i < reviews.length - 1 && <Divider />}
          </Stack>
        ))}
      </Card>
    </Stack>
  );
};

export default ProductReviews;
