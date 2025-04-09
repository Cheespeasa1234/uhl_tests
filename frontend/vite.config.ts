import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
	],
	server: {
		allowedHosts: ["localhost"],
		strictPort: true, // Ensures that the server will exit if the port is already in use
		port: 8082,
		host: "0.0.0.0",
		proxy: {
			"/api": 'http://localhost:8081'
		}
	},
});
