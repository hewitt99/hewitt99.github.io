function slugify(text: string): string {
	return text
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w\u4e00-\u9fff-]/g, '')
		.replace(/-+/g, '-')
}

export function initToc(contentSelector = '.prose-custom', listSelector = '.toc-list'): void {
	const content = document.querySelector(contentSelector)
	const lists = document.querySelectorAll<HTMLElement>(listSelector)
	if (!content || lists.length === 0) return

	const headings = Array.from(content.querySelectorAll<HTMLElement>('h2, h3'))
	if (headings.length === 0) {
		lists.forEach((list) => {
			const empty = list.closest('[data-toc-wrap]')
			empty?.classList.add('hidden')
		})
		return
	}

	const usedIds = new Set<string>()
	const items = headings.map((heading) => {
		let id = heading.id || slugify(heading.textContent || 'section')
		let unique = id
		let i = 1
		while (usedIds.has(unique)) {
			unique = `${id}-${i++}`
		}
		usedIds.add(unique)
		heading.id = unique
		return { id: unique, text: heading.textContent?.trim() || '', level: heading.tagName.toLowerCase() }
	})

	const html = items
		.map(
			(item) =>
				`<a href="#${item.id}" class="toc-link${item.level === 'h3' ? ' pl-5' : ''}" data-toc-id="${item.id}">${item.text}</a>`
		)
		.join('')

	lists.forEach((list) => {
		list.innerHTML = html
	})

	const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.toc-link'))

	const setActive = (id: string) => {
		for (const link of links) {
			link.classList.toggle('toc-link-active', link.dataset.tocId === id)
		}
	}

	const observer = new IntersectionObserver(
		(entries) => {
			const visible = entries
				.filter((e) => e.isIntersecting)
				.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
			if (visible[0]?.target.id) {
				setActive(visible[0].target.id)
			}
		},
		{ rootMargin: '-20% 0px -70% 0px', threshold: [0, 1] }
	)

	for (const heading of headings) {
		observer.observe(heading)
	}

	if (items[0]) setActive(items[0].id)
}
