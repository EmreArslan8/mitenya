type AnalyticsType = 'action' | 'alert';

type ActionEvent = 'crawl' | 'add_to_cart';
type AlertEvent = 'general' | 'easybuy_order_summary';
type AnalyticsEvent = ActionEvent | AlertEvent;

const useAnalytics = () => {
  const sendAnalyticsEvent = (_payload: {
    type: AnalyticsType;
    event: AnalyticsEvent;
    details: unknown;
  }) => {
    void _payload;
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
