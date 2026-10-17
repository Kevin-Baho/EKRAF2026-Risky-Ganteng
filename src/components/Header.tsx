import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import BetterAuthHeader from "../integrations/better-auth/header-user";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
			<nav className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3 sm:py-4">
				<div className="flex items-center gap-6">
					<Link
						to="/"
						className="inline-flex items-center gap-2 rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-bold text-[var(--sea-ink)] no-underline shadow-xs hover:opacity-90 transition"
					>
						<div className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<Sparkles className="size-3.5" />
						</div>
						<span>Ekraf Dashboard</span>
					</Link>

					<div className="hidden md:flex items-center gap-1 text-sm font-semibold">
						<Link
							to="/"
							className="rounded-lg px-3 py-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] transition"
							activeProps={{
								className:
									"rounded-lg px-3 py-1.5 bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-xs",
							}}
						>
							Beranda
						</Link>
						<Link
							to="/setup"
							className="rounded-lg px-3 py-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] transition"
							activeProps={{
								className:
									"rounded-lg px-3 py-1.5 bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-xs",
							}}
						>
							Setup
						</Link>
						<Link
							to="/dashboard"
							className="rounded-lg px-3 py-1.5 text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] transition"
							activeProps={{
								className:
									"rounded-lg px-3 py-1.5 bg-[var(--chip-bg)] text-[var(--sea-ink)] shadow-xs",
							}}
						>
							Dashboard
						</Link>
					</div>
				</div>

				<div className="flex items-center gap-2 sm:gap-3">
					<BetterAuthHeader />
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
