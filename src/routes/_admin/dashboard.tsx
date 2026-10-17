import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowRight, Eye, Lock, Package, ShieldCheck, TrendingUp, Users } from "lucide-react";

import { getServerSession } from "@/lib/server/auth";
import { getProducts } from "@/lib/server/products";
import { getUsers } from "@/lib/server/users";

export const Route = createFileRoute("/_admin/dashboard")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			return redirect({ to: "/login" }) as any;
		}
	},
	component: Dashboard,
});

function Dashboard() {
	const sessionQuery = useQuery({
		queryKey: ["serverSession"],
		queryFn: async () => getServerSession(),
	});

	const role = sessionQuery.data?.role ?? "user";
	const isAdmin = role === "admin";

	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: async () => getProducts(),
	});

	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: async () => getUsers(),
		enabled: isAdmin,
	});

	const products = productsQuery.data ?? [];
	const users = usersQuery.data ?? [];

	// Real-Data Metrics
	const totalProducts = products.length;
	const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
	const totalUsers = users.length;
	const adminCount = users.filter((u) => u.role === "admin").length;

	const recentProducts = products.slice(0, 5);

	return (
		<div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<div className="flex items-center gap-2 mb-1">
						<span className="island-kicker">Ikhtisar Ekraf</span>
						<span
							className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
								isAdmin
									? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
									: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
							}`}
						>
							{isAdmin ? "Mode Administrator" : "Mode Pengguna Terbatas"}
						</span>
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--sea-ink)]">
						{isAdmin ? "Ringkasan Manajemen" : "Katalog Produk & Dashboard"}
					</h1>
					<p className="text-sm text-[var(--sea-ink-soft)] mt-1">
						{isAdmin
							? "Pantau inventaris produk ekonomi kreatif dan administrasi akun pengguna secara real-time."
							: "Eksplorasi koleksi produk karya ekonomi kreatif nusantara dan informasi ketersediaan stok."}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Link
						to="/products"
						className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold shadow-xs hover:opacity-90 transition"
					>
						<Package className="size-4" />
						<span>{isAdmin ? "Kelola Produk" : "Buka Katalog"}</span>
					</Link>
				</div>
			</div>

			{/* User info banner when not admin */}
			{!isAdmin && (
				<div className="rounded-2xl border border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/30 p-4 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
					<Eye className="size-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
					<div className="leading-relaxed">
						<strong>Akses Pengguna Terbatas (Read-Only):</strong> Anda masuk dengan akun Pengguna.
						Anda dapat menelusuri katalog produk, melihat harga dan detail stok. Hak penambahan,
						pengubahan, penghapusan produk, serta manajemen akun dikhususkan bagi Administrator.
					</div>
				</div>
			)}

			{/* Real-Data Metrics Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<MetricCard
					title="Total Produk Terdaftar"
					value={totalProducts}
					subtitle="Koleksi karya Ekraf"
					icon={Package}
					color="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400"
				/>
				<MetricCard
					title="Total Stok Barang"
					value={totalStock.toLocaleString("id-ID")}
					subtitle="Unit tersedia untuk dijual"
					icon={TrendingUp}
					color="text-teal-600 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400"
				/>

				{isAdmin ? (
					<>
						<MetricCard
							title="Total Akun Pengguna"
							value={totalUsers}
							subtitle="Pengguna terdaftar"
							icon={Users}
							color="text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400"
						/>
						<MetricCard
							title="Administrator Aktif"
							value={adminCount}
							subtitle="Akses kontrol penuh"
							icon={ShieldCheck}
							color="text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400"
						/>
					</>
				) : (
					<>
						<MetricCard
							title="Status Akun Anda"
							value="Pengguna"
							subtitle="Terverifikasi"
							icon={Users}
							color="text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400"
						/>
						<MetricCard
							title="Izin Operasi"
							value="Read-Only"
							subtitle="Lihat katalog & detail"
							icon={Lock}
							color="text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400"
						/>
					</>
				)}
			</div>

			{/* Recent Products Table Section */}
			<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-xs backdrop-blur-xs">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h2 className="text-lg font-bold text-[var(--sea-ink)]">Produk Terakhir Ditambahkan</h2>
						<p className="text-xs text-[var(--sea-ink-soft)]">
							Daftar entri produk kreatif terbaru yang tersimpan dalam sistem
						</p>
					</div>
					<Link
						to="/products"
						className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--lagoon-deep)] hover:underline"
					>
						Lihat Semua <ArrowRight className="size-3" />
					</Link>
				</div>

				<div className="overflow-x-auto rounded-xl border border-[var(--line)]">
					<table className="w-full text-sm text-left border-collapse">
						<thead className="bg-[var(--chip-bg)] text-xs text-[var(--sea-ink-soft)] uppercase font-semibold">
							<tr>
								<th className="px-4 py-3">Produk</th>
								<th className="px-4 py-3">Harga Satuan</th>
								<th className="px-4 py-3">Stok</th>
								<th className="px-4 py-3">Tanggal Dibuat</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--line)] bg-[var(--surface)]">
							{recentProducts.map((p) => (
								<tr key={p.id} className="hover:bg-[var(--chip-bg)]/50 transition-colors">
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											{p.imageUrl ? (
												<img
													src={p.imageUrl}
													alt={p.name}
													className="size-10 rounded-lg object-cover border border-[var(--line)] shrink-0"
												/>
											) : (
												<div className="size-10 rounded-lg bg-[var(--chip-bg)] border border-[var(--line)] flex items-center justify-center shrink-0">
													<Package className="size-5 text-[var(--sea-ink-soft)]" />
												</div>
											)}
											<div>
												<p className="font-semibold text-[var(--sea-ink)]">{p.name}</p>
												<p className="text-xs text-[var(--sea-ink-soft)] line-clamp-1 max-w-xs">
													{p.description}
												</p>
											</div>
										</div>
									</td>
									<td className="px-4 py-3 font-semibold text-[var(--sea-ink)]">
										Rp{p.price.toLocaleString("id-ID")}
									</td>
									<td className="px-4 py-3">
										<span
											className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
												p.stock > 10
													? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
													: p.stock > 0
														? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
														: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
											}`}
										>
											{p.stock} unit
										</span>
									</td>
									<td className="px-4 py-3 text-xs text-[var(--sea-ink-soft)]">
										{new Date(p.createdAt).toLocaleDateString("id-ID", {
											day: "numeric",
											month: "short",
											year: "numeric",
										})}
									</td>
								</tr>
							))}
							{recentProducts.length === 0 && (
								<tr>
									<td colSpan={4} className="px-4 py-8 text-center text-xs text-muted-foreground">
										Belum ada produk yang didaftarkan.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function MetricCard({
	title,
	value,
	subtitle,
	icon: Icon,
	color,
}: {
	title: string;
	value: string | number;
	subtitle: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
}) {
	return (
		<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-xs backdrop-blur-xs">
			<div className="flex items-center justify-between">
				<span className="text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider">
					{title}
				</span>
				<div className={`flex size-9 items-center justify-center rounded-xl ${color}`}>
					<Icon className="size-5" />
				</div>
			</div>
			<div className="mt-3">
				<span className="text-2xl font-extrabold text-[var(--sea-ink)] tracking-tight">
					{value}
				</span>
				<p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{subtitle}</p>
			</div>
		</div>
	);
}
