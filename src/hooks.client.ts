import * as Sentry from '@sentry/sveltekit';
import { dev } from '$app/environment';

// Sentry DSNs are public identifiers, safe to ship in the client bundle.
const SENTRY_DSN =
	'https://904349acc34cd8ffbd84d2c1d5f7bfa7@o4512073563897856.ingest.de.sentry.io/4512073988833360';

// /bet/event tracking calls fail by design in local/demo mode (rgs_url is a stub) —
// don't report those failures as errors.
function isBetEventFailure(event: Sentry.ErrorEvent, hint: Sentry.EventHint): boolean {
	const original = hint.originalException;
	const message = original instanceof Error ? original.message : String(original ?? '');
	if (message.includes('bet/event')) return true;

	const lastRequestCrumb = [...(event.breadcrumbs ?? [])]
		.reverse()
		.find((crumb) => crumb.category === 'fetch' || crumb.category === 'xhr');
	const url = lastRequestCrumb?.data?.url;
	return typeof url === 'string' && url.includes('bet/event');
}

Sentry.init({
	dsn: SENTRY_DSN,
	environment: import.meta.env.MODE,
	tracesSampleRate: dev ? 1.0 : 0.1,
	sendDefaultPii: false,
	beforeSend(event, hint) {
		if (isBetEventFailure(event, hint)) return null;
		return event;
	},
});

export const handleError = Sentry.handleErrorWithSentry();
