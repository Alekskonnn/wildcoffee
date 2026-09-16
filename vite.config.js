// @ts-ignore
import config from 'config-vite';
import { sentrySvelteKit } from '@sentry/sveltekit';

export default (() => {
	const baseConfig = config();

	// Source map upload only when an auth token is provided (e.g. CI).
	// sentrySvelteKit must run before the sveltekit() plugin from the shared config.
	if (process.env.SENTRY_AUTH_TOKEN) {
		baseConfig.plugins = [
			sentrySvelteKit({
				org: process.env.SENTRY_ORG,
				project: process.env.SENTRY_PROJECT,
				authToken: process.env.SENTRY_AUTH_TOKEN,
			}),
			...(baseConfig.plugins ?? []),
		];
	}

	return baseConfig;
})();
