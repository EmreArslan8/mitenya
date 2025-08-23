import localFont from "next/font/local";

const plusJakartaSans = localFont({
  src: [
    { path: "./PlusJakartaSans-Light.woff2", weight: "300", style: "normal" },
    { path: "./PlusJakartaSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./PlusJakartaSans-Medium.woff2", weight: "500", style: "normal" },
    {
      path: "./PlusJakartaSans-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    { path: "./PlusJakartaSans-Bold.woff2", weight: "700", style: "normal" },
    {
      path: "./PlusJakartaSans-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export default plusJakartaSans;
