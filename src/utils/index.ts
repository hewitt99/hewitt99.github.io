import type { BlogPost, Category, Tag } from '../types'

// 格式化日期
export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date)
}

// 生成 slug
export function slugify(text: string): string {
	if (!text || !text.trim()) {
		return ''
	}

	return (
		text
			.toString()
			.toLowerCase()
			.trim()
			// 处理中文字符，将空格替换为连字符
			.replace(/\s+/g, '-')
			// 保留中文字符、英文字母、数字和连字符
			.replace(/[^\u4e00-\u9fa5\w\-]+/g, '')
			// 合并多个连字符
			.replace(/\-\-+/g, '-')
			// 移除开头和结尾的连字符
			.replace(/^-+/, '')
			.replace(/-+$/, '') || 'untitled'
	)
}

// 计算阅读时间
export function calculateReadingTime(content: string): number {
	const wordsPerMinute = 200
	const words = content.trim().split(/\s+/).length
	return Math.ceil(words / wordsPerMinute)
}

// 计算字数统计
export function calculateWordCount(content: string): number {
	if (!content || !content.trim()) {
		return 0
	}

	// 移除 HTML 标签
	const cleanContent = content.replace(/<[^>]*>/g, '')

	// 统计中文字符数量
	const chineseChars = (cleanContent.match(/[\u4e00-\u9fa5]/g) || []).length

	// 统计英文单词数量（按空格分割）
	const englishWords = cleanContent
		.replace(/[\u4e00-\u9fa5]/g, '') // 移除中文字符
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length

	// 中文字符 + 英文单词总数
	return chineseChars + englishWords
}

// 分页
export function paginate<T>(items: T[], page: number, perPage: number) {
	const totalPages = Math.ceil(items.length / perPage)
	const startIndex = (page - 1) * perPage
	const endIndex = startIndex + perPage

	return {
		data: items.slice(startIndex, endIndex),
		currentPage: page,
		totalPages,
		hasNext: page < totalPages,
		hasPrev: page > 1,
		nextPage: page < totalPages ? page + 1 : null,
		prevPage: page > 1 ? page - 1 : null
	}
}

// 处理文章数据的辅助函数
export function processPostData(posts: any[]): BlogPost[] {
	return posts
		.map((post) => {
			const content = post.compiledContent()
			return {
				slug:
					post.file
						.split('/')
						.pop()
						?.replace(/\.(md|mdx)$/, '') || '',
				title: post.frontmatter.title,
				description: post.frontmatter.description,
				publishDate: new Date(post.frontmatter.publishDate),
				updatedDate: post.frontmatter.updatedDate
					? new Date(post.frontmatter.updatedDate)
					: undefined,
				heroImage: post.frontmatter.heroImage,
				category: post.frontmatter.category,
				tags: post.frontmatter.tags || [],
				draft: post.frontmatter.draft || false,
				author: post.frontmatter.author,
				readingTime: calculateReadingTime(content),
				wordCount: calculateWordCount(content)
			}
		})
		.filter((post) => !post.draft)
		.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
}

// 获取分类统计
export function getCategoriesFromPosts(posts: BlogPost[]): Category[] {
	const categoryMap = new Map<string, number>()

	posts.forEach((post) => {
		if (post.category && post.category.trim()) {
			const count = categoryMap.get(post.category) || 0
			categoryMap.set(post.category, count + 1)
		}
	})

	return Array.from(categoryMap.entries())
		.filter(([name]) => name && name.trim())
		.map(([name, count]) => ({
			name,
			slug: slugify(name),
			count
		}))
}

// 获取标签统计
export function getTagsFromPosts(posts: BlogPost[]): Tag[] {
	const tagMap = new Map<string, number>()

	posts.forEach((post) => {
		if (post.tags && Array.isArray(post.tags)) {
			post.tags.forEach((tag) => {
				if (tag && tag.trim()) {
					const count = tagMap.get(tag) || 0
					tagMap.set(tag, count + 1)
				}
			})
		}
	})

	return Array.from(tagMap.entries())
		.filter(([name]) => name && name.trim())
		.map(([name, count]) => ({
			name,
			slug: slugify(name),
			count
		}))
}
