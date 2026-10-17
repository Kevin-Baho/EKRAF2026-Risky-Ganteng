import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { LogIn, LogOut } from "lucide-react";

export default function BetterAuthHeader() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />;
	}

	if (session?.user) {
		const initial = (session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase();
		return (
			<div className="flex items-center gap-2">
				<div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
					{initial}
				</div>
				<button
					type="button"
					onClick={() => {
						void authClient.signOut().then(() => {
							window.location.href = "/login";
						});
					}}
					className="h-8 px-3 text-xs font-semibold rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] transition flex items-center gap-1.5 cursor-pointer"
					title="Keluar dari akun"
				>
					<LogOut className="size-3.5" />
					<span>Keluar</span>
				</button>
			</div>
		);
	}

	return (
		<Link
			to="/login"
			className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition inline-flex items-center gap-1.5 shadow-xs"
		>
			<LogIn className="size-3.5" />
			<span>Masuk</span>
		</Link>
	);
}
