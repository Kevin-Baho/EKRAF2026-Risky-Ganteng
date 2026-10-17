import ThemeToggle from "@/components/ThemeToggle";
import { authClient } from "@/lib/auth-client";
import { getServerSession } from "@/lib/server/auth";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (session) {
			return redirect({ to: "/dashboard" }) as any;
		}
	},
	component: LoginPage,
});

function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			setErrorMessage("Silakan masukkan alamat email.");
			return;
		}

		if (!password) {
			setErrorMessage("Silakan masukkan kata sandi.");
			return;
		}

		setLoading(true);

		try {
			const res = await authClient.signIn.email({
				email: trimmedEmail,
				password,
			});

			if (res.error) {
				setErrorMessage(
					res.error.message || "Gagal masuk. Periksa kembali email dan kata sandi Anda.",
				);
				setLoading(false);
				return;
			}

			// Successful sign in -> navigate to dashboard
			window.location.href = "/dashboard";
		} catch (err) {
			setErrorMessage(err instanceof Error ? err.message : "Terjadi kesalahan saat masuk.");
			setLoading(false);
		}
	};

	const fillAdminCredentials = () => {
		setEmail("admin@example.com");
		setPassword("admin12345");
		setErrorMessage(null);
	};

	return (
		<div className="min-h-screen flex flex-col justify-between bg-[var(--bg-base)] text-[var(--sea-ink)] px-4 py-8 sm:px-6">
			{/* Top Bar with brand and theme toggle */}
			<header className="flex items-center justify-between max-w-5xl mx-auto w-full">
				<Link
					to="/"
					className="flex items-center gap-2.5 font-bold text-sm tracking-tight text-[var(--sea-ink)] no-underline"
				>
					<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
						<Sparkles className="size-4" />
					</div>
					<span>Ekraf Dashboard</span>
				</Link>
				<ThemeToggle />
			</header>

			{/* Centered Login Card */}
			<main className="flex-1 flex items-center justify-center my-6">
				<div className="w-full max-w-md">
					<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 sm:p-8 shadow-xl backdrop-blur-md">
						<div className="text-center mb-6">
							<div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
								<Sparkles className="size-6" />
							</div>
							<h1 className="text-2xl font-bold tracking-tight text-[var(--sea-ink)]">
								Masuk ke Dashboard
							</h1>
							<p className="mt-1 text-sm text-[var(--sea-ink-soft)]">
								Sistem Manajemen Ekonomi Kreatif Indonesia
							</p>
						</div>

						{/* Error notification banner */}
						{errorMessage && (
							<div
								role="alert"
								className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/40 p-3.5 text-xs text-red-800 dark:text-red-300 animate-in fade-in duration-200"
							>
								<AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
								<div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4" noValidate>
							{/* Email field */}
							<div>
								<label
									htmlFor="login-email"
									className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider mb-1.5"
								>
									Alamat Email
								</label>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
										<Mail className="size-4" />
									</div>
									<input
										id="login-email"
										name="email"
										type="email"
										autoComplete="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={loading}
										placeholder="admin@example.com"
										className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] py-2.5 pl-10 pr-3 text-sm text-[var(--sea-ink)] placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
									/>
								</div>
							</div>

							{/* Password field */}
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<label
										htmlFor="login-password"
										className="block text-xs font-semibold text-[var(--sea-ink)] uppercase tracking-wider"
									>
										Kata Sandi
									</label>
								</div>
								<div className="relative">
									<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
										<Lock className="size-4" />
									</div>
									<input
										id="login-password"
										name="password"
										type={showPassword ? "text" : "password"}
										autoComplete="current-password"
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										disabled={loading}
										placeholder="••••••••"
										className="w-full rounded-xl border border-[var(--line)] bg-[var(--chip-bg)] py-2.5 pl-10 pr-10 text-sm text-[var(--sea-ink)] placeholder:text-muted-foreground focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition disabled:opacity-50"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-[var(--sea-ink)] transition focus:outline-hidden"
										aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
									>
										{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
									</button>
								</div>
							</div>

							{/* Submit button */}
							<button
								type="submit"
								disabled={loading}
								className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										<span>Memverifikasi...</span>
									</>
								) : (
									<>
										<span>Masuk ke Dashboard</span>
										<ArrowRight className="size-4" />
									</>
								)}
							</button>
						</form>

						{/* Demo quick fill helper */}
						<div className="mt-6 pt-5 border-t border-[var(--line)]">
							<div className="rounded-xl border border-[var(--chip-line)] bg-[var(--chip-bg)] p-3 text-center">
								<p className="text-xs font-medium text-[var(--sea-ink-soft)]">
									Akun Administrator Default:
								</p>
								<p className="mt-1 font-mono text-[11px] text-[var(--sea-ink)]">
									admin@example.com • admin12345
								</p>
								<div className="mt-2.5 flex items-center justify-center gap-2">
									<button
										type="button"
										onClick={fillAdminCredentials}
										className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] transition cursor-pointer"
									>
										Isi Otomatis
									</button>
									<Link
										to="/setup"
										className="inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-primary hover:underline transition"
									>
										Halaman Setup
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="text-center text-xs text-[var(--sea-ink-soft)]">
				<p>&copy; {new Date().getFullYear()} Ekraf Dashboard • Kementerian Ekonomi Kreatif</p>
			</footer>
		</div>
	);
}
