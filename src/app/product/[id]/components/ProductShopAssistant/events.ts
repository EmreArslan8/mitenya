export const PRODUCT_QA_OPEN_EVENT = 'product-qa:open';

export function openProductQA() {
  if (typeof window === 'undefined') return;
  const trigger = document.getElementById('product-qa-trigger');
  if (trigger instanceof HTMLButtonElement) {
    trigger.click();
    return;
  }
  window.dispatchEvent(new CustomEvent(PRODUCT_QA_OPEN_EVENT));
}
