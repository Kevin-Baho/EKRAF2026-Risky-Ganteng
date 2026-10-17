import { createServerFn } from "@tanstack/react-start";

import { auth } from "@/lib/auth";
import { type Product, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, db } from "@/lib/db";
import { getCurrentSession } from "@/lib/session";

/**
 * Server-only session lookup. Safe to call from TanStack Router `beforeLoad`
 * (which runs on the client during client navigation) because server
 * functions always execute on the server.
 */
export const getServerSession = createServerFn({ method: "GET" }).handler(async () => {
	return getCurrentSession();
});

/**
 * One-time development seed: creates the administrator account (password
 * hashed by Better Auth) and seeds sample Ekraf products. Idempotent — calling
 * /setup multiple times does not crash or duplicate data.
 *
 * Called from the client via `useServerFn(seedAdmin)` on the /setup page.
 */
export const seedAdmin = createServerFn({ method: "POST" }).handler(async () => {
	const hasAdmin = db.user.some((u) => {
		const role = db.userRole.find((r) => r.userId === u.id)?.role;
		return role === "admin";
	});
	if (hasAdmin) {
		return { ok: true, alreadySeeded: true, admin: SEED_ADMIN_EMAIL };
	}

	await auth.api.signUpEmail({
		body: {
			email: SEED_ADMIN_EMAIL,
			password: SEED_ADMIN_PASSWORD,
			name: "Administrator",
		},
		headers: new Headers(),
	});

	const adminUser = db.user.find((u) => u.email === SEED_ADMIN_EMAIL);
	if (adminUser) {
		const existing = db.userRole.find((r) => r.userId === adminUser.id);
		if (existing) {
			existing.role = "admin";
		} else {
			db.userRole.push({ userId: adminUser.id, role: "admin" });
		}
	}

	// Seed sample Indonesian Creative Economy (Ekraf) products if none exist
	if (db.product.length === 0) {
		const now = new Date().toISOString();
		const sampleProducts: Product[] = [
			{
				id: crypto.randomUUID(),
				name: "Kain Tenun Ikat Flores",
				description:
					"Kain tenun ikat tradisional buatan tangan pengrajin Flores dengan pewarna alami khas Nusa Tenggara Timur.",
				price: 750000,
				stock: 15,
				imageUrl:
					"https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=512&auto=format&fit=crop&q=80",
				createdAt: now,
				updatedAt: now,
			},
			{
				id: crypto.randomUUID(),
				name: "Kopi Arabika Gayo Single Origin 250g",
				description:
					"Biji kopi pilihan roasted medium dark dari dataran tinggi Aceh Gayo, aroma floral dengan citarasa fruity khas nusantara.",
				price: 95000,
				stock: 45,
				imageUrl:
					"https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=512&auto=format&fit=crop&q=80",
				createdAt: now,
				updatedAt: now,
			},
			{
				id: crypto.randomUUID(),
				name: "Kerajinan Gerabah Kasongan Yogyakarta",
				description:
					"Vas keramik dekoratif bermotif etnik kontemporer hasil karya seniman gerabah Kasongan Bantul.",
				price: 185000,
				stock: 20,
				imageUrl:
					"https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=512&auto=format&fit=crop&q=80",
				createdAt: now,
				updatedAt: now,
			},
		];
		db.product.push(...sampleProducts);
	}

	return { ok: true, alreadySeeded: false, admin: SEED_ADMIN_EMAIL };
});
