import { authClient } from "@/lib/auth-client";
import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	LogOut,
	Menu,
	Package,
	Sparkles,
	Users,
} from "lucide-react";
import { useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { getServerSession } from "@/lib/server/auth";

export const Route = createFileRoute("/_admin")({
	beforeLoad: async () => {
		const { session } = await getServerSession();
		if (!session) {
			return redirect({ to: "/login" }) as any;
		}
	},
	component: DashboardShell,
});

const NAV_ITEMS = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/products", label: "Produk Ekraf", icon: Package },
	{ href: "/users", label: "Pengguna & Hak Akses", icon: Users },
];

function DashboardShell() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [collapsed, setCollapsed] = useState(false);
	const { data: session } = authClient.useSession();

	const userEmail = session?.user?.email ?? "admin@example.com";
	const userName = session?.user?.name ?? "Administrator";
	const userInitial = (userName?.[0] || userEmail?.[0] || "A").toUpperCase();

	return (
		<div className="flex h-screen overflow-hidden bg-[var(--background)]">
			{/* Mobile backdrop */}
			{sidebarOpen && (
				<button
					type="button"
					aria-label="Tutup sidebar"
					className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs sm:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`
					fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]
					transition-all duration-300 ease-in-out
					${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
					sm:static sm:translate-x-0
					${collapsed ? "sm:w-20" : "sm:w-64"}
					w-64
				`}
			>
				{/* Brand */}
				<div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--sidebar-border)] px-4">
					<div className="flex items-center gap-3 overflow-hidden">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-xs">
							<Sparkles className="size-5" />
						</div>
						{!collapsed && (
							<div className="flex flex-col">
								<span className="text-sm font-bold tracking-tight text-[var(--sidebar-foreground)]">
									Ekraf Admin
								</span>
								<span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">
									Ekonomi Kreatif
								</span>
							</div>
						)}
					</div>

					{/* Desktop collapse toggle */}
					<button
						type="button"
						onClick={() => setCollapsed(!collapsed)}
						className="hidden sm:flex size-7 items-center justify-center rounded-lg border border-[var(--sidebar-border)] text-muted-foreground hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)] transition"
						title={collapsed ? "Perluas menu" : "Ciutkan menu"}
					>
						{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
					</button>
				</div>

				{/* Nav Links */}
				<nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
					{NAV_ITEMS.map((item) => {
						const Icon = item.icon;
						return (
							<Link
								key={item.href}
								to={item.href}
								onClick={() => setSidebarOpen(false)}
								activeProps={{
									className:
										"flex items-center gap-3 rounded-xl bg-[var(--sidebar-accent)] px-3 py-2.5 text-sm font-semibold text-[var(--sidebar-accent-foreground)] shadow-xs",
								}}
								className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
							>
								<Icon className="size-5 shrink-0" />
								{!collapsed && <span className="truncate">{item.label}</span>}
							</Link>
						);
					})}
				</nav>

				{/* User Profile & Sign Out Footer */}
				<div className="shrink-0 border-t border-[var(--sidebar-border)] p-3 space-y-2">
					<div
						className={`flex items-center gap-3 rounded-xl p-2 ${collapsed ? "justify-center" : ""}`}
					>
						<div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
							{userInitial}
						</div>
						{!collapsed && (
							<div className="flex flex-col overflow-hidden">
								<span className="text-xs font-semibold text-[var(--sidebar-foreground)] truncate">
									{userName}
								</span>
								<span className="text-[11px] text-muted-foreground truncate">{userEmail}</span>
							</div>
						)}
					</div>

					<button
						type="button"
						onClick={() => {
							void authClient.signOut().then(() => {
								window.location.href = "/login";
							});
						}}
						className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40 ${
							collapsed ? "justify-center" : ""
						}`}
						title="Keluar dari sistem"
					>
						<LogOut className="size-4 shrink-0" />
						{!collapsed && <span>Keluar</span>}
					</button>
				</div>
			</aside>

			{/* Main App Layout */}
			<div className="flex flex-1 flex-col overflow-hidden">
				{/* Top bar */}
				<header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[var(--line)] bg-[var(--header-bg)]/85 px-4 backdrop-blur sm:px-8">
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setSidebarOpen(true)}
							className="sm:hidden rounded-lg p-2 text-muted-foreground hover:bg-[var(--chip-bg)] transition"
							aria-label="Buka menu navigasi"
						>
							<Menu className="size-5" />
						</button>
						<div>
							<h1 className="text-sm font-semibold tracking-tight text-[var(--sea-ink)]">
								Dashboard Manajemen Ekraf
							</h1>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<ThemeToggle />
						<div className="hidden sm:flex size-8 items-center justify-center rounded-full bg-[var(--chip-bg)] border border-[var(--chip-line)] text-xs font-bold text-[var(--sea-ink)] shadow-xs">
							{userInitial}
						</div>
					</div>
				</header>

				{/* Page Content Viewport */}
				<main className="flex-1 overflow-y-auto">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
