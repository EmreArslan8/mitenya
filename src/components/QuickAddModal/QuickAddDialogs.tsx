'use client';

import QuickAddModal from '@/components/QuickAddModal';
import AddedToCartModal from '@/components/ShoppingCart/AddedToCartModal';
import type { QuickAddDialogState } from '@/lib/hooks/useQuickAdd';

/** `useQuickAdd` akışının modalları: varyant seçimi ve "sepete eklendi". */
const QuickAddDialogs = ({ state }: { state: QuickAddDialogState }) => (
  <>
    <QuickAddModal
      open={Boolean(state.variantProduct)}
      onClose={state.closeVariant}
      product={state.variantProduct}
      loading={state.loading}
      onAdded={state.setAddedProduct}
    />
    <AddedToCartModal
      open={Boolean(state.addedProduct)}
      onClose={state.closeAdded}
      product={state.addedProduct ?? undefined}
    />
  </>
);

export default QuickAddDialogs;
