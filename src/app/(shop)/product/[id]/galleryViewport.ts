import { cookies, headers } from 'next/headers';

export const GALLERY_VIEWPORT_COOKIE = 'gallery_viewport';

const MOBILE_USER_AGENT_PATTERN =
  /Android.+Mobile|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export const getInitialGalleryMode = ({
  viewportCookie,
  viewportWidthHint,
  mobileHint,
  userAgent,
}: {
  viewportCookie?: string;
  viewportWidthHint?: string;
  mobileHint?: string;
  userAgent: string;
}) => {
  if (viewportCookie === 'desktop') return true;
  if (viewportCookie === 'mobile') return false;

  const hintedViewportWidth = Number.parseInt(viewportWidthHint ?? '', 10);
  if (Number.isFinite(hintedViewportWidth)) {
    return hintedViewportWidth >= 600;
  }

  if (mobileHint === '?1') return false;
  if (mobileHint === '?0') return true;

  return !MOBILE_USER_AGENT_PATTERN.test(userAgent);
};

export async function resolveInitialGalleryIsDesktop() {
  const requestHeaders = await headers();
  const cookieStore = await cookies();

  return getInitialGalleryMode({
    viewportCookie: cookieStore.get(GALLERY_VIEWPORT_COOKIE)?.value,
    viewportWidthHint: requestHeaders.get('sec-ch-viewport-width') ?? undefined,
    mobileHint: requestHeaders.get('sec-ch-ua-mobile') ?? undefined,
    userAgent: requestHeaders.get('user-agent') ?? '',
  });
}
