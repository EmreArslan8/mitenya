import { AuthContext } from '@/contexts/AuthContext';
import { useContext } from 'react';

type AnalyticsType = 'action' | 'alert';

type ActionEvent = 'crawl' | 'add_to_cart';
type AlertEvent = 'general' | 'easybuy_order_summary';
type AnalyticsEvent = ActionEvent | AlertEvent;

const baseUrl = '/api/analytics';

const useAnalytics = () => {
  useContext(AuthContext);

  const sendAnalyticsEvent = ({
    type,
    event,
    details,
  }: {
    type: AnalyticsType;
    event: AnalyticsEvent;
    details: unknown;
  }) => {
    let url = `${baseUrl}?type=${type}&event=${event}`;
    if (details) url += `&details=${encodeURIComponent(JSON.stringify(details).substring(0, 1024))}`;
    fetch(url, { method: 'POST' });
  };

  const sendAlert = ({ event, details }: { event: AlertEvent; details: unknown }) => {
    sendAnalyticsEvent({ type: 'alert', event, details });
  };

  const sendAction = ({ event, details }: { event: ActionEvent; details: unknown }) => {
    sendAnalyticsEvent({ type: 'action', event, details });
  };

  return { sendAlert, sendAction };
};

export default useAnalytics;
