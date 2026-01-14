import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: 'index.js',
			name: 'scrollama',
			fileName: (format) => (format === 'es' ? 'scrollama.js' : `scrollama.${format}.js`),
			formats: ['es'],
		},
		outDir: 'dist',
		emptyOutDir: true,
		minify: 'esbuild',
		sourcemap: true,
	},
});
