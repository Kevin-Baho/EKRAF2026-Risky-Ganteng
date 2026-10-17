"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/db";
import {
	type ProductInput,
	createProduct,
	deleteProduct,
	updateProduct,
} from "@/lib/server/products";
import { useServerFn } from "@tanstack/react-start";
import { Image, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductFormModalProps {
	open: boolean;
	onClose: () => void;
	product?: Product | null;
	onSuccess: () => void;
	readOnly?: boolean;
}

const MAX_IMAGE_SIZE_BYTES = 512 * 1024; // 512 KB
const MAX_DIMENSION_PX = 512; // 512 px

export function ProductFormModal({
	open,
	onClose,
	product,
	onSuccess,
	readOnly = false,
}: ProductFormModalProps) {
	const isEdit = !!product;
	const createFn = useServerFn(createProduct);
	const updateFn = useServerFn(updateProduct);
	const deleteFn = useServerFn(deleteProduct);

	// Dedicated stable local form state to ensure reliable typing without keystroke rejection
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const [stock, setStock] = useState("");
	const [imageUrl, setImageUrl] = useState("");

	const [imageMode, setImageMode] = useState<"file" | "url">("file");
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);

	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);

	// Synchronize initial state when modal opens or editing product changes
	useEffect(() => {
		if (open) {
			if (product) {
				setName(product.name || "");
				setDescription(product.description || "");
				setPrice(String(product.price ?? ""));
				setStock(String(product.stock ?? ""));
				setImageUrl(product.imageUrl || "");
				setImagePreview(product.imageUrl || null);
			} else {
				setName("");
				setDescription("");
				setPrice("");
				setStock("");
				setImageUrl("");
				setImagePreview(null);
			}
			setImageError(null);
			setSubmitError(null);
			setConfirmDelete(false);
		}
	}, [open, product]);

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate MIME type
		const validTypes = ["image/jpeg", "image/png", "image/webp"];
		if (!validTypes.includes(file.type)) {
			setImageError("Format file tidak didukung. Harap pilih JPG, PNG, atau WebP.");
			return;
		}

		if (file.size > MAX_IMAGE_SIZE_BYTES) {
			setImageError("Ukuran file melebihi 512 KB.");
			return;
		}

		setImageError(null);

		// Read and resize image client-side if dimensions exceed 512px
		const reader = new FileReader();
		reader.onload = (event) => {
			const dataUrl = event.target?.result as string;
			const img = new window.Image();
			img.onload = () => {
				let { width, height } = img;
				if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
					const scale = Math.min(MAX_DIMENSION_PX / width, MAX_DIMENSION_PX / height);
					width = Math.round(width * scale);
					height = Math.round(height * scale);

					const canvas = document.createElement("canvas");
					canvas.width = width;
					canvas.height = height;
					const ctx = canvas.getContext("2d");
					if (ctx) {
						ctx.drawImage(img, 0, 0, width, height);
						const resizedDataUrl = canvas.toDataURL(file.type, 0.9);
						setImageUrl(resizedDataUrl);
						setImagePreview(resizedDataUrl);
						return;
					}
				}
				setImageUrl(dataUrl);
				setImagePreview(dataUrl);
			};
			img.onerror = () => {
				setImageError("Gagal memproses gambar.");
			};
			img.src = dataUrl;
		};
		reader.readAsDataURL(file);
	};

	const handleUrlChange = (val: string) => {
		setImageUrl(val);
		if (val.trim()) {
			// Validate format
			if (val.toLowerCase().includes("image/svg+xml")) {
				setImageError("Format SVG tidak diizinkan untuk keamanan.");
				setImagePreview(null);
				return;
			}
			setImageError(null);
			setImagePreview(val.trim());
		} else {
			setImagePreview(null);
			setImageError(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitError(null);

		const numPrice = Number(price);
		const numStock = Number(stock);

		if (!name.trim()) {
			setSubmitError("Nama produk wajib diisi.");
			return;
		}
		if (!description.trim()) {
			setSubmitError("Deskripsi produk wajib diisi.");
			return;
		}
		if (Number.isNaN(numPrice) || numPrice < 0) {
			setSubmitError("Harga harus berupa angka positif.");
			return;
		}
		if (Number.isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
			setSubmitError("Stok harus berupa bilangan bulat tidak negatif.");
			return;
		}

		setSubmitting(true);
		try {
			if (isEdit && product) {
				await updateFn({
					data: {
						id: product.id,
						name: name.trim(),
						description: description.trim(),
						price: numPrice,
						stock: numStock,
						imageUrl: imageUrl.trim() || null,
					},
				});
			} else {
				await createFn({
					data: {
						name: name.trim(),
						description: description.trim(),
						price: numPrice,
						stock: numStock,
						imageUrl: imageUrl.trim() || null,
					},
				});
			}
			onSuccess();
			onClose();
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async () => {
		if (!product) return;
		setSubmitting(true);
		try {
			await deleteFn({ data: { id: product.id } });
			onSuccess();
			onClose();
		} catch (err) {
			setSubmitError(err instanceof Error ? err.message : "Gagal menghapus produk.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(next) => !next && onClose()}>
			<DialogContent className="sm:max-w-[540px]">
				<DialogHeader>
					<DialogTitle>
						{readOnly
							? "Detail Produk Ekraf"
							: isEdit
								? "Edit Produk Ekraf"
								: "Tambah Produk Ekraf Baru"}
					</DialogTitle>
					<DialogDescription>
						{readOnly
							? "Informasi detail produk ekonomi kreatif (Mode Lihat Saja)."
							: isEdit
								? "Perbarui detail produk ekonomi kreatif di katalog dashboard."
								: "Masukkan informasi lengkap produk ekonomi kreatif ke dalam sistem."}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4 pt-2">
					<div className="space-y-2">
						<Label htmlFor="product-name">Nama Produk</Label>
						<Input
							id="product-name"
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder="Contoh: Kain Batik Tulis Solo Eksklusif"
							required
							disabled={submitting || readOnly}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="product-desc">Deskripsi</Label>
						<Textarea
							id="product-desc"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Deskripsikan keunikan, bahan, atau latar budaya produk..."
							rows={3}
							required
							disabled={submitting || readOnly}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="product-price">Harga (Rp)</Label>
							<Input
								id="product-price"
								type="number"
								min="0"
								step="1000"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
								placeholder="250000"
								required
								disabled={submitting || readOnly}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="product-stock">Stok Unit</Label>
							<Input
								id="product-stock"
								type="number"
								min="0"
								step="1"
								value={stock}
								onChange={(e) => setStock(e.target.value)}
								placeholder="25"
								required
								disabled={submitting || readOnly}
							/>
						</div>
					</div>

					{/* Image Input Section */}
					<div className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--chip-bg)]/40 p-4">
						<div className="flex items-center justify-between">
							<Label className="flex items-center gap-1.5 font-semibold text-xs">
								<Image className="size-4" />
								Foto Produk (Maks 512px / 512KB)
							</Label>
							{!readOnly && (
								<div className="flex gap-1 text-xs">
									<button
										type="button"
										onClick={() => setImageMode("file")}
										className={`px-2 py-0.5 rounded-md transition ${
											imageMode === "file"
												? "bg-[var(--sea-ink)] text-white font-medium"
												: "text-[var(--sea-ink-soft)] hover:bg-[var(--line)]"
										}`}
									>
										Upload File
									</button>
									<button
										type="button"
										onClick={() => setImageMode("url")}
										className={`px-2 py-0.5 rounded-md transition ${
											imageMode === "url"
												? "bg-[var(--sea-ink)] text-white font-medium"
												: "text-[var(--sea-ink-soft)] hover:bg-[var(--line)]"
										}`}
									>
										URL Gambar
									</button>
								</div>
							)}
						</div>

						{!readOnly &&
							(imageMode === "file" ? (
								<div>
									<Input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										onChange={handleFileSelect}
										disabled={submitting}
										className="cursor-pointer text-xs file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-[var(--line)] hover:file:bg-[var(--line)]/80"
									/>
									<p className="text-[11px] text-[var(--sea-ink-soft)] mt-1">
										File akan otomatis di-resize ke maksimal 512x512px.
									</p>
								</div>
							) : (
								<div>
									<Input
										type="url"
										value={imageUrl}
										onChange={(e) => handleUrlChange(e.target.value)}
										placeholder="https://example.com/foto-produk.jpg"
										disabled={submitting}
										className="text-xs"
									/>
									<p className="text-[11px] text-[var(--sea-ink-soft)] mt-1">
										Mendukung URL https/http. File SVG tidak diperkenankan demi keamanan.
									</p>
								</div>
							))}

						{imageError && <p className="text-xs text-red-600 font-medium">{imageError}</p>}

						{imagePreview ? (
							<div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] p-2">
								<img
									src={imagePreview}
									alt="Preview Produk"
									className="size-16 rounded-md object-cover border border-[var(--line)]"
									onError={() => setImageError("Gagal memuat pratinjau gambar.")}
								/>
								<div className="flex-1 min-w-0 text-xs">
									<p className="font-medium text-[var(--sea-ink)] truncate">
										{name || "Foto Produk"}
									</p>
									<p className="text-[11px] text-[var(--sea-ink-soft)]">
										{readOnly ? "Foto katalog tersimpan" : "Siap disimpan dalam katalog"}
									</p>
								</div>
								{!readOnly && (
									<Button
										type="button"
										variant="ghost"
										size="icon-xs"
										onClick={() => {
											setImageUrl("");
											setImagePreview(null);
											setImageError(null);
										}}
										title="Hapus foto"
									>
										<Trash2 className="size-4 text-red-500" />
									</Button>
								)}
							</div>
						) : readOnly ? (
							<p className="text-xs text-muted-foreground italic py-1">
								Tidak ada foto produk terlampir.
							</p>
						) : null}
					</div>

					{submitError && (
						<div className="rounded-lg p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
							{submitError}
						</div>
					)}

					<DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
						{readOnly ? (
							<Button type="button" onClick={onClose} className="w-full sm:w-auto">
								Tutup
							</Button>
						) : (
							<>
								{isEdit && !confirmDelete && (
									<Button
										type="button"
										variant="destructive"
										onClick={() => setConfirmDelete(true)}
										disabled={submitting}
										className="sm:mr-auto"
									>
										Hapus
									</Button>
								)}
								{isEdit && confirmDelete && (
									<div className="flex items-center gap-2 sm:mr-auto">
										<Button
											type="button"
											variant="destructive"
											size="sm"
											onClick={handleDelete}
											disabled={submitting}
										>
											{submitting ? "Menghapus..." : "Yakin Hapus?"}
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setConfirmDelete(false)}
											disabled={submitting}
										>
											Batal
										</Button>
									</div>
								)}

								<Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
									Batal
								</Button>
								<Button type="submit" disabled={submitting}>
									{submitting ? "Menyimpan..." : isEdit ? "Perbarui Produk" : "Tambah Produk"}
								</Button>
							</>
						)}
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
