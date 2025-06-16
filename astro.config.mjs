import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'
import vercel from '@astrojs/vercel/static'

export default defineConfig({
	site: 'https://hewitt99.vercel.app',
	output: 'static',
	adapter: vercel(),
	integrations: [
		tailwind({
			applyBaseStyles: false
		}),
		sitemap(),
		mdx()
	],
	markdown: {
		shikiConfig: {
			theme: 'github-dark',
			wrap: true
		}
	},
	prefetch: true
})
