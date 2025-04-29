import adapter from '@sveltejs/adapter-auto';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const dev = process.env.NODE_ENV === 'development';
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// In development, use adapter-auto for convenience.
		// In production (e.g., GitHub Pages), use adapter-static.
		adapter: dev ? adapter() : adapterStatic({
			fallback: 'index.html',   // SPA fallback for GitHub Pages
		}),
		paths: { base: dev ? '' : '/scanner' },
		prerender: {
			handleHttpError: 'warn', // allow 404s during prerender, don't crash build
			origin: dev ? 'http://localhost:5173' : 'https://aurora-bailey.github.io'
		},
		appDir: 'internal'
	}
};

export default config;
