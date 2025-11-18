// global.d.ts
export {};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}
