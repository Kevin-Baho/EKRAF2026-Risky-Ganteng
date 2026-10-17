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
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/lib/db";
import { updateUserRole } from "@/lib/server/users";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

interface UserRoleModalProps {
	open: boolean;
	onClose: () => void;
	user: {
		id: string;
		email: string;
		name: string | null;
		role: Role;
	} | null;
	currentUserId?: string;
	onSuccess: () => void;
}

export function UserRoleModal({
	open,
	onClose,
	user,
	currentUserId,
	onSuccess,
}: UserRoleModalProps) {
	const updateRoleFn = useServerFn(updateUserRole);
	const [selectedRole, setSelectedRole] = useState<Role>("user");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (open && user) {
			setSelectedRole(user.role);
			setError(null);
		}
	}, [open, user]);

	if (!user) return null;

	const isSelf = currentUserId === user.id;

	const handleSave = async () => {
		if (isSelf && selectedRole === "user") {
			setError("Anda tidak dapat menurunkan hak akses (demote) akun Anda sendiri.");
			return;
		}

		setSubmitting(true);
		setError(null);
		try {
			await updateRoleFn({
				data: {
					userId: user.id,
					role: selectedRole,
				},
			});
			onSuccess();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gagal memperbarui peran pengguna.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(next) => !next && onClose()}>
			<DialogContent className="sm:max-w-[420px]">
				<DialogHeader>
					<DialogTitle>Ubah Peran Pengguna</DialogTitle>
					<DialogDescription>
						Ubah hak akses dan kewenangan untuk akun pengguna ini.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="rounded-lg border border-[var(--line)] bg-[var(--chip-bg)] p-3 text-sm space-y-1">
						<p className="text-xs text-[var(--sea-ink-soft)] font-medium">Pengguna:</p>
						<p className="font-semibold text-[var(--sea-ink)]">{user.name || "Tanpa Nama"}</p>
						<p className="text-xs text-[var(--sea-ink-soft)]">{user.email}</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="role-select">Pilih Peran Baru</Label>
						<Select
							value={selectedRole}
							onValueChange={(val) => {
								setSelectedRole(val as Role);
								setError(null);
							}}
						>
							<SelectTrigger id="role-select" className="w-full">
								<SelectValue placeholder="Pilih peran" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="user">User (Akses Standar)</SelectItem>
								<SelectItem value="admin">Administrator (Akses Penuh)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{isSelf && selectedRole === "user" && (
						<p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
							Perhatian: Anda adalah administrator saat ini. Sistem melarang demosi akun sendiri
							demi mencegah lockout.
						</p>
					)}

					{error && (
						<div className="rounded-lg p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
							{error}
						</div>
					)}
				</div>

				<DialogFooter className="gap-2">
					<Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
						Batal
					</Button>
					<Button
						type="button"
						onClick={handleSave}
						disabled={submitting || (isSelf && selectedRole === "user")}
					>
						{submitting ? "Menyimpan..." : "Simpan Perubahan"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
