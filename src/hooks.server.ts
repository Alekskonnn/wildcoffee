//https://svelte.dev/docs/cli/devtools-json
import * as Sentry from '@sentry/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';

// The app ships as a static SPA (ssr=false); this server init only covers dev/prerender.
Sentry.init({
	dsn: 'https://904349acc34cd8ffbd84d2c1d5f7bfa7@o4512073563897856.ingest.de.sentry.io/4512073988833360',
	environment: dev ? 'development' : 'production',
	tracesSampleRate: dev ? 1.0 : 0.1,
});

export const handleError = Sentry.handleErrorWithSentry();

function devtoolsHandle({ event, resolve }) {
	if (dev && event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(undefined, { status: 404 });
	}

	return resolve(event);
}

export const handle = sequence(Sentry.sentryHandle(), devtoolsHandle);
