import { authClient } from "@/lib/auth-client";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
	ArrowRight,
	CheckCircle2,
	Lock,
	Package,
	ShieldCheck,
	Sparkles,
	Users,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
	const { data: session, isPending } = authClient.useSession();

	return (
		<main className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
			{/* Hero Section */}
			<section className="relative overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-8 sm:p-14 shadow-lg backdrop-blur-md">
				<div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

				<div className="max-w-3xl">
					<div className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3.5 py-1.5 text-xs font-bold text-primary shadow-xs mb-6">
						<Sparkles className="size-3.5" />
						<span>Kementerian Ekonomi Kreatif / Ekraf 2026</span>
					</div>

					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--sea-ink)] leading-tight">
						Platform Manajemen <span className="text-primary">Ekonomi Kreatif</span>
					</h1>

					<p className="mt-5 text-base sm:text-lg leading-relaxed text-[var(--sea-ink-soft)]">
						Sistem terpadu administrasi produk kriya, fesyen, dan kuliner nusantara yang aman,
						responsif, dan terintegrasi dengan otentikasi role-based.
					</p>

					{/* Action Buttons */}
					<div className="mt-8 flex flex-wrap items-center gap-4">
						{isPending ? (
							<div className="h-12 w-44 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
						) : session?.user ? (
							<div className="flex flex-wrap items-center gap-3">
								<Link
									to="/dashboard"
									className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.99] transition"
								>
									<span>Buka Dashboard</span>
									<ArrowRight className="size-4" />
								</Link>
								<div className="rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-4 py-3 text-xs font-medium text-[var(--sea-ink-soft)]">
									Masuk sebagai{" "}
									<strong className="text-[var(--sea-ink)]">{session.user.email}</strong>
								</div>
							</div>
						) : (
							<div className="flex flex-wrap items-center gap-3">
								<Link
									to="/login"
									className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.99] transition"
								>
									<span>Masuk ke Sistem</span>
									<ArrowRight className="size-4" />
								</Link>
								<Link
									to="/setup"
									className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] px-5 py-3.5 text-sm font-semibold text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] transition"
								>
									<span>Inisialisasi Data (/setup)</span>
								</Link>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Feature Highlights Grid */}
			<section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Feature 1 */}
				<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-sm">
					<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
						<Package className="size-5" />
					</div>
					<h3 className="text-lg font-bold text-[var(--sea-ink)]">Katalog Produk Ekraf</h3>
					<p className="mt-2 text-sm text-[var(--sea-ink-soft)] leading-relaxed">
						Pengelolaan data produk lokal secara real-time dengan pengunggahan gambar terkompresi
						hingga resolusi 512px.
					</p>
					<ul className="mt-4 space-y-2 text-xs text-[var(--sea-ink-soft)] font-medium">
						<li className="flex items-center gap-2">
							<CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
							<span>Pencarian & pengurutan cepat</span>
						</li>
						<li className="flex items-center gap-2">
							<CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
							<span>Input modal responsif tanpa freeze</span>
						</li>
					</ul>
				</div>

				{/* Feature 2 */}
				<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-sm">
					<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
						<Users className="size-5" />
					</div>
					<h3 className="text-lg font-bold text-[var(--sea-ink)]">Manajemen Hak Akses</h3>
					<p className="mt-2 text-sm text-[var(--sea-ink-soft)] leading-relaxed">
						Role-Based Access Control (RBAC) membatasi fungsi administrator dan pengguna biasa
						secara transparan dan aman.
					</p>
					<ul className="mt-4 space-y-2 text-xs text-[var(--sea-ink-soft)] font-medium">
						<li className="flex items-center gap-2">
							<CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
							<span>Perlindungan anti self-demotion</span>
						</li>
						<li className="flex items-center gap-2">
							<CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
							<span>Pencegahan penghapusan admin terakhir</span>
						</li>
					</ul>
				</div>

				{/* Feature 3 */}
				<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-sm">
					<div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
						<ShieldCheck className="size-5" />
					</div>
					<h3 className="text-lg font-bold text-[var(--sea-ink)]">Keamanan Berlapis</h3>
					<p className="mt-2 text-sm text-[var(--sea-ink-soft)] leading-relaxed">
						Validasi skema ketat menggunakan Zod di sisi server, rate-limiting proteksi brute force,
						dan password hashing terpercaya.
					</p>
					<ul className="mt-4 space-y-2 text-xs text-[var(--sea-ink-soft)] font-medium">
						<li className="flex items-center gap-2">
							<CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
							<span>Sanitasi input pencegah XSS & SSRF</span>
						</li>
						<li className="flex items-center gap-2">
							<CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
							<span>Rate limiting proteksi brute-force login</span>
						</li>
					</ul>
				</div>
			</section>
		</main>
	);
}
