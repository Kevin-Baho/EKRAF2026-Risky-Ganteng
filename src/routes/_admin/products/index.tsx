import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	type SortingState,
	createColumnHelper,
	flexRender,
	rowSortingFeature,
	tableFeatures,
	useTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit, Package, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ProductFormModal } from "@/components/ProductFormModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/db";
import { getServerSession } from "@/lib/server/auth";
import { deleteProduct, getProducts } from "@/lib/server/products";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_admin/products/")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			return redirect({ to: "/login" }) as any;
		}
	},
	component: ProductsPage,
});

function ProductsPage() {
	const queryClient = useQueryClient();
	const deleteFn = useServerFn(deleteProduct);

	const [searchQuery, setSearchQuery] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [sorting, setSorting] = useState<SortingState>([]);

	const productsQuery = useQuery({
		queryKey: ["products"],
		queryFn: async () => getProducts(),
	});

	const products = productsQuery.data ?? [];

	// Filter products based on search term (name & description)
	const filteredProducts = useMemo(() => {
		if (!searchQuery.trim()) return products;
		const q = searchQuery.toLowerCase();
		return products.filter(
			(p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
		);
	}, [products, searchQuery]);

	const features = tableFeatures({ rowSortingFeature });
	const columnHelper = createColumnHelper<typeof features, Product>();

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: ({ column }) => (
					<button
						type="button"
						onClick={column.getToggleSortingHandler()}
						className="flex items-center gap-1 font-semibold text-xs tracking-wider uppercase text-[var(--sea-ink-soft)]"
					>
						Produk
						<ArrowUpDown className="size-3" />
					</button>
				),
				cell: (info) => {
					const product = info.row.original as Product;
					return (
						<div className="flex items-center gap-3">
							{product.imageUrl ? (
								<img
									src={product.imageUrl}
									alt={product.name}
									className="size-12 rounded-lg object-cover border border-[var(--line)] shrink-0"
								/>
							) : (
								<div className="size-12 rounded-lg bg-[var(--chip-bg)] border border-[var(--line)] flex items-center justify-center shrink-0 text-muted-foreground">
									<Package className="size-6 text-[var(--sea-ink-soft)]" />
								</div>
							)}
							<div className="min-w-0">
								<p className="font-semibold text-sm text-[var(--sea-ink)] leading-snug">
									{product.name}
								</p>
								<p className="text-xs text-[var(--sea-ink-soft)] line-clamp-2 max-w-sm">
									{product.description}
								</p>
							</div>
						</div>
					);
				},
			}),
			columnHelper.accessor("price", {
				header: ({ column }) => (
					<button
						type="button"
						onClick={column.getToggleSortingHandler()}
						className="flex items-center gap-1 font-semibold text-xs tracking-wider uppercase text-[var(--sea-ink-soft)]"
					>
						Harga
						<ArrowUpDown className="size-3" />
					</button>
				),
				cell: (info) => (
					<span className="font-semibold text-sm text-[var(--sea-ink)]">
						Rp{(info.getValue() as number).toLocaleString("id-ID")}
					</span>
				),
			}),
			columnHelper.accessor("stock", {
				header: ({ column }) => (
					<button
						type="button"
						onClick={column.getToggleSortingHandler()}
						className="flex items-center gap-1 font-semibold text-xs tracking-wider uppercase text-[var(--sea-ink-soft)]"
					>
						Stok
						<ArrowUpDown className="size-3" />
					</button>
				),
				cell: (info) => {
					const stock = info.getValue() as number;
					return (
						<span
							className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
								stock > 10
									? "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300"
									: stock > 0
										? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
										: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
							}`}
						>
							{stock} unit
						</span>
					);
				},
			}),
			columnHelper.accessor("createdAt", {
				header: ({ column }) => (
					<button
						type="button"
						onClick={column.getToggleSortingHandler()}
						className="flex items-center gap-1 font-semibold text-xs tracking-wider uppercase text-[var(--sea-ink-soft)]"
					>
						Terdaftar
						<ArrowUpDown className="size-3" />
					</button>
				),
				cell: (info) => (
					<span className="text-xs text-[var(--sea-ink-soft)]">
						{new Date(info.getValue() as string).toLocaleDateString("id-ID", {
							day: "numeric",
							month: "short",
							year: "numeric",
						})}
					</span>
				),
			}),
			columnHelper.display({
				id: "actions",
				header: () => (
					<span className="text-xs font-semibold tracking-wider uppercase text-[var(--sea-ink-soft)]">
						Aksi
					</span>
				),
				cell: (info) => {
					const product = info.row.original as Product;
					return (
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => {
									setEditingProduct(product);
									setModalOpen(true);
								}}
								className="h-8 px-2 text-xs text-[var(--sea-ink)] hover:bg-[var(--chip-bg)]"
							>
								<Edit className="size-3.5 mr-1" />
								Edit
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={async () => {
									if (window.confirm(`Hapus produk "${product.name}" secara permanen?`)) {
										try {
											await deleteFn({ data: { id: product.id } });
											await queryClient.invalidateQueries({ queryKey: ["products"] });
										} catch (err) {
											window.alert(err instanceof Error ? err.message : "Gagal menghapus produk");
										}
									}
								}}
								className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
							>
								<Trash2 className="size-3.5 mr-1" />
								Hapus
							</Button>
						</div>
					);
				},
			}),
		],
		[columnHelper, deleteFn, queryClient],
	);

	const table = useTable({
		features,
		columns,
		data: filteredProducts,
		state: {
			sorting,
		},
		onSortingChange: setSorting,
	});

	return (
		<div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<p className="island-kicker mb-1">Katalog Produk</p>
					<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--sea-ink)]">
						Manajemen Produk Ekraf
					</h1>
					<p className="text-sm text-[var(--sea-ink-soft)] mt-1">
						Kelola data komoditas kreatif, harga, jumlah stok, dan foto representatif.
					</p>
				</div>
				<Button
					type="button"
					onClick={() => {
						setEditingProduct(null);
						setModalOpen(true);
					}}
					className="bg-[var(--sea-ink)] text-white hover:bg-[#0f282c] shadow-xs"
				>
					<Plus className="size-4 mr-2" />
					Tambah Produk Baru
				</Button>
			</div>

			{/* Filter & Search Bar */}
			<div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-3 shadow-xs">
				<Search className="size-4 text-[var(--sea-ink-soft)] ml-2" />
				<Input
					type="search"
					placeholder="Cari berdasarkan nama atau deskripsi produk..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="border-none shadow-none focus-visible:ring-0 bg-transparent text-sm"
				/>
				{searchQuery && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => setSearchQuery("")}
						className="text-xs h-7 px-2"
					>
						Reset
					</Button>
				)}
			</div>

			{/* Products Table */}
			<div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] shadow-xs overflow-hidden backdrop-blur-xs">
				<div className="overflow-x-auto">
					<table className="w-full text-sm text-left border-collapse">
						<thead className="bg-[var(--chip-bg)] border-b border-[var(--line)]">
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th key={header.id} className="px-4 py-3.5">
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</th>
									))}
								</tr>
							))}
						</thead>
						<tbody className="divide-y divide-[var(--line)] bg-[var(--surface)]">
							{table.getRowModel().rows.map((row) => (
								<tr key={row.id} className="hover:bg-[var(--chip-bg)]/50 transition-colors">
									{row.getAllCells().map((cell) => (
										<td key={cell.id} className="px-4 py-3.5">
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))}

							{table.getRowModel().rows.length === 0 && (
								<tr>
									<td
										colSpan={columns.length}
										className="px-4 py-12 text-center text-[var(--sea-ink-soft)]"
									>
										{searchQuery ? (
											<p>Tidak ada produk yang sesuai dengan kata kunci pencarian.</p>
										) : (
											<div className="space-y-3">
												<p>Belum ada produk yang terdaftar dalam inventaris.</p>
												<Button
													type="button"
													size="sm"
													onClick={() => {
														setEditingProduct(null);
														setModalOpen(true);
													}}
												>
													<Plus className="size-4 mr-1" />
													Tambah Produk Pertama
												</Button>
											</div>
										)}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Form Modal for Create & Edit */}
			<ProductFormModal
				open={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setEditingProduct(null);
				}}
				product={editingProduct}
				onSuccess={() => {
					void queryClient.invalidateQueries({ queryKey: ["products"] });
				}}
			/>
		</div>
	);
}
