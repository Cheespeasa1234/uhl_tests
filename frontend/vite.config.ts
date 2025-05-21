import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
	const isDev = mode === "development";
	return {
		plugins: [
			sveltekit(),
		],
		server: {
			allowedHosts: [
				"localhost",
				"hcst.natelevison.com"
			],
			strictPort: true,
			port: 8082,
			host: "0.0.0.0",
			proxy: {
				"/api": {
					target: "http://localhost:8081",
				}
			}
		},
	}
});
