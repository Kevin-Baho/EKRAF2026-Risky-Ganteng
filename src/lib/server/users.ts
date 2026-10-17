import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { db, getUserRole, removeUserRole, setUserRole } from "@/lib/db";
import { getCurrentSession, requireAdmin } from "@/lib/session";

export const userRoleSchema = z.object({
	userId: z.string(),
	role: z.enum(["admin", "user"]),
});

export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	await requireAdmin();
	return db.user.map((u) => ({
		id: u.id,
		email: u.email,
		name: u.name,
		role: getUserRole(u.id),
		emailVerified: !!u.emailVerified,
		createdAt: u.createdAt.toISOString(),
	}));
});

export const updateUserRole = createServerFn({ method: "POST" })
	.validator(userRoleSchema)
	.handler(async ({ data }) => {
		const { user } = await getCurrentSession();
		await requireAdmin();

		// Prevent self-demotion: an admin cannot revoke their own admin role.
		if (data.role === "user" && data.userId === user?.id) {
			const err = new Error("Tidak dapat mengubah role sendiri ke user") as Error & {
				status?: number;
			};
			err.status = 400;
			throw err;
		}

		setUserRole(data.userId, data.role);
		return { ok: true };
	});

export const deleteUser = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data }) => {
		const { user } = await getCurrentSession();
		await requireAdmin();

		// Prevent self-deletion.
		if (data.userId === user?.id) {
			const err = new Error("Tidak dapat menghapus akun sendiri") as Error & {
				status?: number;
			};
			err.status = 400;
			throw err;
		}

		// Prevent removing the last administrator so the app never locks itself out.
		const role = getUserRole(data.userId);
		if (role === "admin") {
			const adminCount = db.userRole.filter((r) => r.role === "admin").length;
			if (adminCount <= 1) {
				const err = new Error("Tidak dapat menghapus administrator terakhir") as Error & {
					status?: number;
				};
				err.status = 400;
				throw err;
			}
		}
		db.user = db.user.filter((u) => u.id !== data.userId);
		removeUserRole(data.userId);
		return { ok: true };
	});
