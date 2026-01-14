import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: 'index.js',
			name: 'scrollama',
			fileName: (format) => `scrollama.${format === 'es' ? 'js' : format}.js`,
			formats: ['es'],
		},
		outDir: 'dist',
		emptyOutDir: true,
		minify: 'esbuild',
		sourcemap: true,
	},
});
