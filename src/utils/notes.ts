export type NoteVisibility = 'private' | 'public'

export interface NoteFrontmatter {
	postSlug: string
	title?: string
	visibility?: NoteVisibility
	updatedDate?: string
}

export interface NoteModule {
	file: string
	frontmatter: NoteFrontmatter
	Content: unknown
	compiledContent?: () => Promise<string>
}

function slugFromNoteFile(file: string): string {
	return file.split('/').pop()?.replace(/\.(md|mdx)$/, '') || ''
}

/** Dev (or NOTE_VISIBILITY=all) can preview private notes; production only builds public. */
export function includePrivateNotes(): boolean {
	if (import.meta.env.DEV) return true
	// Optional override for preview builds: NOTE_VISIBILITY=all pnpm build
	if (typeof process !== 'undefined' && process.env?.NOTE_VISIBILITY === 'all') return true
	return false
}

export function normalizeVisibility(value?: string): NoteVisibility {
	return value === 'public' ? 'public' : 'private'
}

export function isNotePubliclyBuildable(frontmatter: NoteFrontmatter): boolean {
	const visibility = normalizeVisibility(frontmatter.visibility)
	if (visibility === 'public') return true
	return includePrivateNotes()
}

export function loadAllNotes(): NoteModule[] {
	const modules = import.meta.glob('../content/notes/*.{md,mdx}', { eager: true }) as Record<
		string,
		NoteModule
	>
	return Object.values(modules)
}

export function getNoteByPostSlug(postSlug: string): NoteModule | undefined {
	return loadAllNotes().find((note) => {
		const fromFm = note.frontmatter?.postSlug
		const fromFile = slugFromNoteFile(note.file)
		return fromFm === postSlug || fromFile === postSlug
	})
}

export function getBuildableNotes(): NoteModule[] {
	const notes = loadAllNotes()
	const blogSlugs = new Set(
		Object.keys(import.meta.glob('../content/blog/*.{md,mdx}', { eager: true })).map(
			(path) => path.split('/').pop()?.replace(/\.(md|mdx)$/, '') || ''
		)
	)

	for (const note of notes) {
		const slug = note.frontmatter?.postSlug || slugFromNoteFile(note.file)
		if (!blogSlugs.has(slug) && import.meta.env.DEV) {
			console.warn(`[notes] orphan note (no matching blog post): ${slug}`)
		}
	}

	return notes.filter((note) => isNotePubliclyBuildable(note.frontmatter || {}))
}

export function noteSlug(note: NoteModule): string {
	return note.frontmatter?.postSlug || slugFromNoteFile(note.file)
}
