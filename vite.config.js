import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: 'index.js',
			name: 'scrolleo',
			fileName: (format) => `scrolleo.${format === 'es' ? 'js' : format}.js`,
			formats: ['es'],
		},
		outDir: 'dist',
		emptyOutDir: true,
		minify: 'esbuild',
		sourcemap: true,
	},
});
