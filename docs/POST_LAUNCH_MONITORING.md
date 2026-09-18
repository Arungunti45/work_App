# POST LAUNCH MONITORING

During the first 72 hours of the Production Launch, the following dashboards and logs must be actively monitored by the Engineering team.

## Firebase Metrics
1. **Authentication Logs**: Look for anomalous spikes in Failed Login attempts or OTP rejections (indicating SMS spoofing/abuse).
2. **Cloud Function Logs**: Filter by `severity="ERROR"`. Any error in `handlePaymentWebhook` requires immediate manual inspection.
3. **Firestore Usage**: Monitor Read/Write graphs. A massive spike may indicate a missing index leading to unbounded queries or a memory leak in a React `onSnapshot` hook.

## Performance
- **Sentry / Error Tracking**: Ensure frontend crashes are mapped to source maps. Fix any frequent undefined pointer crashes.
- **Lighthouse**: Run a post-launch Lighthouse score on the live domain to ensure TTFB (Time to First Byte) is acceptable across regions.

## Security Alerts
- If Firebase App Check starts rejecting high volumes of requests, ensure legitimate users aren't being blocked by ReCaptcha thresholds.
