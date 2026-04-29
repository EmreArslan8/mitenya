import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://d862e8a31e0505134512475b6349ee33@o4511304055455744.ingest.de.sentry.io/4511304102838352',
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  enabled: process.env.NODE_ENV === 'production',
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
