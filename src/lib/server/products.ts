import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { type Product, db } from "@/lib/db";
import { requireAdmin, requireAuth } from "@/lib/session";

/**
 * Image security validation:
 * Allows safe image URLs (http/https/data URLs)
 * Disallows javascript: or data:image/svg+xml to prevent Stored XSS
 */
const safeImageSchema = z
	.string()
	.max(500000, "Ukuran payload gambar terlalu besar") // Limit string size (especially base64 data URLs)
	.refine(
		(val) => {
			if (!val || val.trim() === "") return true;
			const trimmed = val.trim();
			// Reject active/executable SVG content
			if (trimmed.toLowerCase().includes("image/svg+xml")) {
				return false;
			}
			// Safe protocols
			if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
				return true;
			}
			// Safe base64 image data URLs (jpeg, png, webp)
			if (
				trimmed.startsWith("data:image/jpeg;base64,") ||
				trimmed.startsWith("data:image/png;base64,") ||
				trimmed.startsWith("data:image/webp;base64,")
			) {
				return true;
			}
			return false;
		},
		{
			message:
				"Format gambar tidak valid atau tidak aman. Gunakan URL http/https atau format JPG/PNG/WebP.",
		},
	)
	.optional()
	.nullable();

export const productSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Nama produk wajib diisi")
		.max(120, "Nama produk maksimal 120 karakter"),
	description: z
		.string()
		.trim()
		.min(1, "Deskripsi wajib diisi")
		.max(2000, "Deskripsi maksimal 2000 karakter"),
	price: z.coerce
		.number()
		.min(0, "Harga harus berupa angka positif")
		.max(1000000000, "Harga melebihi batas wajar"),
	stock: z.coerce
		.number()
		.int("Stok harus berupa bilangan bulat")
		.min(0, "Stok tidak boleh negatif")
		.max(1000000, "Stok melebihi batas wajar"),
	imageUrl: safeImageSchema,
});

export type ProductInput = z.infer<typeof productSchema>;

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
	await requireAuth();
	return [...db.product].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) as Product[];
});

export const createProduct = createServerFn({ method: "POST" })
	.validator(productSchema)
	.handler(async ({ data }) => {
		await requireAdmin();
		const now = new Date().toISOString();
		const product = {
			id: crypto.randomUUID(),
			name: data.name,
			description: data.description,
			price: data.price,
			stock: data.stock,
			imageUrl: data.imageUrl || null,
			createdAt: now,
			updatedAt: now,
		} as Product;
		db.product.push(product);
		return product;
	});

export const updateProduct = createServerFn({ method: "POST" })
	.validator(
		z.object({
			id: z.string().uuid("ID produk tidak valid"),
			name: productSchema.shape.name,
			description: productSchema.shape.description,
			price: productSchema.shape.price,
			stock: productSchema.shape.stock,
			imageUrl: productSchema.shape.imageUrl,
		}),
	)
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Produk tidak ditemukan") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		const now = new Date().toISOString();
		const updated = {
			...db.product[index],
			name: data.name,
			description: data.description,
			price: data.price,
			stock: data.stock,
			imageUrl: data.imageUrl !== undefined ? data.imageUrl : db.product[index].imageUrl,
			updatedAt: now,
		} as Product;
		db.product[index] = updated;
		return updated;
	});

export const deleteProduct = createServerFn({ method: "POST" })
	.validator(z.object({ id: z.string().uuid("ID produk tidak valid") }))
	.handler(async ({ data }) => {
		await requireAdmin();
		const index = db.product.findIndex((p) => p.id === data.id);
		if (index === -1) {
			const err = new Error("Produk tidak ditemukan") as Error & { status?: number };
			err.status = 404;
			throw err;
		}
		db.product.splice(index, 1);
		return { ok: true };
	});
