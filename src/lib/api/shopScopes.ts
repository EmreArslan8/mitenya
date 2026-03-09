import { SupabaseClient } from "@supabase/supabase-js";

type ResolveScopedProductIdsInput = {
  supabase: SupabaseClient;
  collectionSlug?: string;
  selectedConcernIds: string[];
  selectedBenefitIds: string[];
};

type ResolveScopedProductIdsResult = {
  collectionProductIds: string[] | null;
  concernProductIds: string[] | null;
  benefitProductIds: string[] | null;
  hasEmptyScope: boolean;
};

const getUniqueProductIds = (rows: { product_id: string | null }[] | null | undefined) =>
  Array.from(
    new Set((rows ?? []).map((row) => String(row.product_id)).filter(Boolean))
  );

export const resolveScopedProductIds = async ({
  supabase,
  collectionSlug,
  selectedConcernIds,
  selectedBenefitIds,
}: ResolveScopedProductIdsInput): Promise<ResolveScopedProductIdsResult> => {
  let collectionProductIds: string[] | null = null;
  let concernProductIds: string[] | null = null;
  let benefitProductIds: string[] | null = null;

  if (collectionSlug) {
    const { data: collectionData } = await supabase
      .from("collections")
      .select("id")
      .eq("slug", collectionSlug)
      .eq("is_active", true)
      .single();

    if (collectionData) {
      const { data: productCollections } = await supabase
        .from("product_collections")
        .select("product_id")
        .eq("collection_id", collectionData.id)
        .order("sort_order", { ascending: true });

      collectionProductIds = getUniqueProductIds(productCollections);
      if (collectionProductIds.length === 0) {
        return {
          collectionProductIds,
          concernProductIds,
          benefitProductIds,
          hasEmptyScope: true,
        };
      }
    }
  }

  if (selectedConcernIds.length > 0) {
    const { data: productConcerns } = await supabase
      .from("product_concerns")
      .select("product_id")
      .in("concern_id", selectedConcernIds);

    concernProductIds = getUniqueProductIds(productConcerns);
    if (concernProductIds.length === 0) {
      return {
        collectionProductIds,
        concernProductIds,
        benefitProductIds,
        hasEmptyScope: true,
      };
    }
  }

  if (selectedBenefitIds.length > 0) {
    const { data: productBenefits } = await supabase
      .from("product_benefits")
      .select("product_id")
      .in("benefit_id", selectedBenefitIds);

    benefitProductIds = getUniqueProductIds(productBenefits);
    if (benefitProductIds.length === 0) {
      return {
        collectionProductIds,
        concernProductIds,
        benefitProductIds,
        hasEmptyScope: true,
      };
    }
  }

  return {
    collectionProductIds,
    concernProductIds,
    benefitProductIds,
    hasEmptyScope: false,
  };
};
