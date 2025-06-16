export interface BlogPost {
	slug: string
	title: string
	description: string
	publishDate: Date
	updatedDate?: Date
	heroImage?: string
	category: string
	tags: string[]
	draft?: boolean
	author?: string
	readingTime?: number
}

export interface Category {
	name: string
	slug: string
	description?: string
	count: number
}

export interface Tag {
	name: string
	slug: string
	count: number
}

export interface SiteConfig {
	title: string
	description: string
	author: string
	url: string
	social: {
		github?: string
		twitter?: string
		email?: string
	}
	postsPerPage: number
}
