export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'

export function getStoredTheme(): ThemePreference {
	if (typeof localStorage === 'undefined') return 'system'
	const stored = localStorage.getItem(STORAGE_KEY)
	if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
	return 'system'
}

export function resolveIsDark(preference: ThemePreference): boolean {
	if (preference === 'dark') return true
	if (preference === 'light') return false
	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(preference: ThemePreference): void {
	const isDark = resolveIsDark(preference)
	document.documentElement.classList.toggle('dark', isDark)
	localStorage.setItem(STORAGE_KEY, preference)
}

export function cycleTheme(current: ThemePreference): ThemePreference {
	const order: ThemePreference[] = ['system', 'light', 'dark']
	const next = order[(order.indexOf(current) + 1) % order.length]
	applyTheme(next)
	return next
}

export function initThemeListener(onChange: () => void): () => void {
	const mq = window.matchMedia('(prefers-color-scheme: dark)')
	const handler = () => {
		if (getStoredTheme() === 'system') {
			document.documentElement.classList.toggle('dark', mq.matches)
			onChange()
		}
	}
	mq.addEventListener('change', handler)
	return () => mq.removeEventListener('change', handler)
}
