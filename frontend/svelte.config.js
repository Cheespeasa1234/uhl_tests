import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			// pages: 'build',
			// assets: 'build',
			// fallback: undefined,
			// precompress: false,
			// strict: true,

			out: 'build',
			precompress: false,
			envPrefix: 'FRONTEND_',
		}),
	},
	debug: true,
	paths: {
		origin: "./",
	}
};

export default config;
