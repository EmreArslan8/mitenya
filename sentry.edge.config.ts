import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://d862e8a31e0505134512475b6349ee33@o4511304055455744.ingest.de.sentry.io/4511304102838352',
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === 'production',
});
