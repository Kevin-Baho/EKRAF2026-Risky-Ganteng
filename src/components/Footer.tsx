export default function Footer() {
	const year = new Date().getFullYear();

	return (
		<footer className="mt-16 border-t border-[var(--line)] px-4 py-8 text-[var(--sea-ink-soft)] bg-[var(--surface)]">
			<div className="max-w-6xl mx-auto flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
				<p className="m-0 text-xs sm:text-sm">
					&copy; {year} <strong>Ekraf Dashboard</strong> — Platform Manajemen Ekonomi Kreatif
					Nusantara.
				</p>
				<p className="m-0 text-xs text-muted-foreground">
					TanStack Start • Better Auth • Tailwind CSS
				</p>
			</div>
		</footer>
	);
}
