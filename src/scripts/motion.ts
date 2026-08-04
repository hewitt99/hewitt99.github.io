export function initReveals(root: ParentNode = document): void {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		root.querySelectorAll('.reveal').forEach((el) => el.classList.add('reveal-visible'))
		return
	}

	const elements = Array.from(root.querySelectorAll<HTMLElement>('.reveal:not(.reveal-visible)'))
	if (elements.length === 0) return

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add('reveal-visible')
					observer.unobserve(entry.target)
				}
			}
		},
		// threshold 0: any pixel visible — avoids tall reveal targets (e.g. full article) never firing
		{ rootMargin: '0px 0px -4% 0px', threshold: 0 }
	)

	for (const el of elements) {
		observer.observe(el)
	}
}
