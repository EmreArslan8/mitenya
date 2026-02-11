"use client";

import BlockManager from "@/components/cms/blocks";
import { CMSPageData } from "@/lib/api/cms";
import { Box, Stack } from "@mui/material";

const gapValues = {
  small: { xs: 3, sm: 5 },
  medium: { xs: 5, sm: 8 },
  large: { xs: 8, sm: 12 },
};  

const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
} as const;

const HomePageView = ({ data }: { data?: CMSPageData }) => {
  if (!data) {
    console.warn("⚠️ [HomePageView] data yok!");
    return <p style={{ color: "red" }}>Veri bulunamadı (data undefined)</p>;
  }

  return (
    <Stack
      gap={gapValues[data?.gap ?? "medium"]}
    >
      <Box component="h1" sx={srOnly}>
        Kore Kozmetik ve Cilt Bakım Ürünleri - Mitenya
      </Box>
      {data?.blocks && <BlockManager blocks={data.blocks} />}
    </Stack>
  );
};

export default HomePageView;
