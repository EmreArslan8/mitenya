"use client";

import BlockManager from "@/components/cms/blocks";
import { CMSPageData } from "@/lib/api/cms";
import { Stack } from "@mui/material";

const gapValues = {
  small: { xs: 3, sm: 5 },
  medium: { xs: 5, sm: 8 },
  large: { xs: 8, sm: 12 },
};

const HomePageView = ({ data }: { data?: CMSPageData }) => {
  if (!data) {
    console.warn("⚠️ [HomePageView] data yok!");
    return <p style={{ color: "red" }}>Veri bulunamadı (data undefined)</p>;
  }



  return (
    <Stack gap={gapValues[data?.gap ?? "medium"]}>
      {/* <Banner variant="warning" title={t('navAlert')} sx={{ mb: { xs: -2, sm: -4 } }} /> */}
      {data?.blocks && <BlockManager blocks={data.blocks} />}
    </Stack>
  );
};

export default HomePageView;
