import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: 'index.js',
			name: 'scrolleo',
			fileName: (format) =>
				format === 'es' ? 'scrolleo.js' : `scrolleo.${format}.js`,
			formats: ['es'],
		},
		outDir: 'dist',
		emptyOutDir: true,
		minify: 'esbuild',
		sourcemap: true,
	},
});
