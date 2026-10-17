import { seedAdmin } from "@/lib/server/auth";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
	ArrowRight,
	CheckCircle2,
	Database,
	Info,
	Loader2,
	ShieldCheck,
	Sparkles,
	Users,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/setup")({ component: Setup });

function Setup() {
	const seedAdminFn = useServerFn(seedAdmin);
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState("");
	const [alreadySeeded, setAlreadySeeded] = useState(false);

	const handleSeed = async () => {
		setStatus("loading");
		setMessage("");
		try {
			const result = await seedAdminFn();
			setStatus("success");
			setAlreadySeeded(result.alreadySeeded);
			setMessage(
				result.alreadySeeded
					? "Akun administrator dan data sampel sudah tersedia dalam memori server."
					: "Akun administrator berhasil dibuat dan produk sampel ekonomi kreatif telah dimuat.",
			);
		} catch (err) {
			setStatus("error");
			setMessage(err instanceof Error ? err.message : "Inisialisasi akun gagal.");
		}
	};

	return (
		<main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
			<section className="rounded-3xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 sm:p-10 shadow-lg backdrop-blur-md">
				<div className="flex items-center gap-2.5 text-xs font-bold text-primary mb-3">
					<Database className="size-4" />
					<span>Inisialisasi Data (In-Memory)</span>
				</div>

				<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--sea-ink)]">
					Setup Akun Administrator
				</h1>

				<p className="mt-3 text-sm sm:text-base leading-relaxed text-[var(--sea-ink-soft)] max-w-2xl">
					Sistem ini menggunakan penyimpanan memori (in-memory) tanpa basis data fisik permanen.
					Jalankan proses ini untuk membuat akun administrator terenkripsi serta memuat katalog
					produk awal. Operasi ini bersifat idempoten (aman dijalankan berulang kali).
				</p>

				<div className="mt-8">
					<button
						type="button"
						onClick={handleSeed}
						disabled={status === "loading"}
						className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50 cursor-pointer"
					>
						{status === "loading" ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								<span>Memproses Inisialisasi...</span>
							</>
						) : (
							<>
								<Sparkles className="size-4" />
								<span>Inisialisasi Akun Admin & Produk</span>
							</>
						)}
					</button>

					{status !== "idle" && (
						<div
							className={`mt-6 rounded-2xl border p-4.5 ${
								status === "success"
									? "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200"
									: status === "error"
										? "border-red-200 bg-red-50/80 dark:border-red-900/50 dark:bg-red-950/40 text-red-900 dark:text-red-200"
										: "border-[var(--line)] bg-[var(--chip-bg)] text-[var(--sea-ink)]"
							}`}
						>
							<div className="flex items-start gap-3">
								<CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
								<div>
									<h4 className="text-sm font-bold">
										{alreadySeeded ? "Informasi Akun" : "Inisialisasi Sukses"}
									</h4>
									<p className="mt-1 text-xs leading-relaxed opacity-90">{message}</p>
									<div className="mt-3 flex items-center gap-3">
										<Link
											to="/login"
											className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs hover:opacity-90 transition"
										>
											<span>Buka Halaman Masuk</span>
											<ArrowRight className="size-3.5" />
										</Link>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Admin Account */}
						<div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-[var(--chip-bg)] p-4 sm:p-5">
							<div className="flex items-start gap-3">
								<ShieldCheck className="size-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
								<div className="text-xs text-[var(--sea-ink-soft)] space-y-1">
									<div className="flex items-center gap-1.5 mb-1">
										<p className="font-bold text-[var(--sea-ink)]">Akun Administrator</p>
										<span className="text-[9px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.2 rounded font-semibold">
											Penuh
										</span>
									</div>
									<p>
										Email:{" "}
										<code className="font-mono font-semibold text-[var(--sea-ink)]">
											admin@example.com
										</code>
									</p>
									<p>
										Kata Sandi:{" "}
										<code className="font-mono font-semibold text-[var(--sea-ink)]">
											admin12345
										</code>
									</p>
									<p className="text-[11px] text-muted-foreground pt-1">
										Izin: CRUD Produk penuh + Manajemen Pengguna & Hak Akses
									</p>
								</div>
							</div>
						</div>

						{/* Standard User Account */}
						<div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-[var(--chip-bg)] p-4 sm:p-5">
							<div className="flex items-start gap-3">
								<Users className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
								<div className="text-xs text-[var(--sea-ink-soft)] space-y-1">
									<div className="flex items-center gap-1.5 mb-1">
										<p className="font-bold text-[var(--sea-ink)]">Akun Pengguna (User)</p>
										<span className="text-[9px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-semibold">
											Terbatas
										</span>
									</div>
									<p>
										Email:{" "}
										<code className="font-mono font-semibold text-[var(--sea-ink)]">
											user@example.com
										</code>
									</p>
									<p>
										Kata Sandi:{" "}
										<code className="font-mono font-semibold text-[var(--sea-ink)]">user12345</code>
									</p>
									<p className="text-[11px] text-muted-foreground pt-1">
										Izin: Lihat Katalog & Detail Produk (Read-Only, tanpa akses pengguna)
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="mt-6 flex items-center gap-2 text-xs text-[var(--sea-ink-soft)]">
						<span>Sudah memiliki akses?</span>
						<Link to="/login" className="font-semibold text-primary hover:underline transition">
							Masuk ke Dashboard &rarr;
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
