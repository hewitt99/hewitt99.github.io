import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import tailwind from '@astrojs/tailwind'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
	site: 'https://hewitt99.vercel.app',
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
