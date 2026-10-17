import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { createColumnHelper, flexRender, tableFeatures, useTable } from "@tanstack/react-table";
import { Edit, Shield, Trash2, User, Users as UsersIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { UserRoleModal } from "@/components/UserRoleModal";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/db";
import { getServerSession } from "@/lib/server/auth";
import { deleteUser, getUsers } from "@/lib/server/users";

type UserRow = {
	id: string;
	email: string;
	name: string | null;
	role: Role;
	emailVerified: boolean;
	createdAt: string;
};

export const Route = createFileRoute("/_admin/users/")({
	beforeLoad: async () => {
		const { session, role } = await getServerSession();
		if (!session) {
			return redirect({ to: "/login" }) as any;
		}
		if (role !== "admin") {
			return redirect({ to: "/dashboard" }) as any;
		}
	},
	component: UsersPage,
});

function UsersPage() {
	const queryClient = useQueryClient();
	const deleteFn = useServerFn(deleteUser);

	const [editingUser, setEditingUser] = useState<UserRow | null>(null);
	const [modalOpen, setModalOpen] = useState(false);

	const usersQuery = useQuery({
		queryKey: ["users"],
		queryFn: async () => getUsers(),
	});

	const sessionQuery = useQuery({
		queryKey: ["session"],
		queryFn: async () => getServerSession(),
	});

	const currentUserId = sessionQuery.data?.user?.id;
	const users = usersQuery.data ?? [];

	const adminCount = useMemo(() => users.filter((u) => u.role === "admin").length, [users]);

	const features = tableFeatures({});
	const columnHelper = createColumnHelper<typeof features, UserRow>();

	const columns = useMemo(
		() => [
			columnHelper.accessor("name", {
				header: () => (
					<span className="text-xs font-semibold tracking-wider uppercase text-[var(--sea-ink-soft)]">
						Nama & Email
					</span>
				),
				cell: (info) => {
					const user = info.row.original as UserRow;
					const isSelf = currentUserId === user.id;
					return (
						<div className="flex items-center gap-3">
							<div className="size-9 rounded-full bg-[var(--chip-bg)] border border-[var(--line)] flex items-center justify-center font-bold text-xs text-[var(--sea-ink)] shrink-0">
								{(user.name?.[0] || user.email[0] || "U").toUpperCase()}
							</div>
							<div>
								<div className="flex items-center gap-2">
									<p className="font-semibold text-sm text-[var(--sea-ink)] leading-snug">
										{user.name || "Tanpa Nama"}
									</p>
									{isSelf && (
										<span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
											Anda
										</span>
									)}
								</div>
								<p className="text-xs text-[var(--sea-ink-soft)]">{user.email}</p>
							</div>
						</div>
					);
				},
			}),
			columnHelper.accessor("role", {
				header: () => (
					<span className="text-xs font-semibold tracking-wider uppercase text-[var(--sea-ink-soft)]">
						Peran (Role)
					</span>
				),
				cell: (info) => {
					const role = info.getValue() as Role;
					return (
						<span
							className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
								role === "admin"
									? "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
									: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
							}`}
						>
							{role === "admin" ? (
								<>
									<Shield className="size-3" /> Administrator
								</>
							) : (
								<>
									<User className="size-3" /> Pengguna
								</>
							)}
						</span>
					);
				},
			}),
			columnHelper.accessor("createdAt", {
				header: () => (
					<span className="text-xs font-semibold tracking-wider uppercase text-[var(--sea-ink-soft)]">
						Bergabung
					</span>
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
					const user = info.row.original as UserRow;
					const isSelf = currentUserId === user.id;
					const isLastAdmin = user.role === "admin" && adminCount <= 1;

					return (
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={() => {
									setEditingUser(user);
									setModalOpen(true);
								}}
								className="h-8 px-2 text-xs text-[var(--sea-ink)] hover:bg-[var(--chip-bg)]"
							>
								<Edit className="size-3.5 mr-1" />
								Ubah Peran
							</Button>

							{isSelf ? (
								<span className="text-[11px] text-muted-foreground italic px-2">Akun Aktif</span>
							) : isLastAdmin ? (
								<span className="text-[11px] text-muted-foreground italic px-2">
									Admin Terakhir
								</span>
							) : (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									onClick={async () => {
										if (
											window.confirm(
												`Apakah Anda yakin ingin menghapus akun ${user.email}? Tindakan ini tidak dapat dibatalkan.`,
											)
										) {
											try {
												await deleteFn({ data: { userId: user.id } });
												await queryClient.invalidateQueries({ queryKey: ["users"] });
											} catch (err) {
												window.alert(
													err instanceof Error ? err.message : "Gagal menghapus pengguna",
												);
											}
										}
									}}
									className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
								>
									<Trash2 className="size-3.5 mr-1" />
									Hapus
								</Button>
							)}
						</div>
					);
				},
			}),
		],
		[columnHelper, currentUserId, adminCount, deleteFn, queryClient],
	);

	const table = useTable({
		features,
		columns,
		data: users,
	});

	return (
		<div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
			{/* Page Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div>
					<p className="island-kicker mb-1">Akses & Keamanan</p>
					<h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--sea-ink)]">
						Manajemen Pengguna & Peran
					</h1>
					<p className="text-sm text-[var(--sea-ink-soft)] mt-1">
						Kelola hak akses pengguna, delegasikan hak administrator, dan cegah lockout sistem.
					</p>
				</div>
			</div>

			{/* Users Table */}
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
										Belum ada data pengguna yang terdaftar.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* User Role Modal Dialog */}
			<UserRoleModal
				open={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setEditingUser(null);
				}}
				user={editingUser}
				currentUserId={currentUserId}
				onSuccess={() => {
					void queryClient.invalidateQueries({ queryKey: ["users"] });
				}}
			/>
		</div>
	);
}
