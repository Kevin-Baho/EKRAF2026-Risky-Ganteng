import { auth, checkRateLimit } from "@/lib/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: ({ request }) => auth.handler(request),
			POST: async ({ request }) => {
				const url = new URL(request.url);
				// If signing in via email/password, apply rate limiting
				if (url.pathname.includes("/sign-in") || url.pathname.includes("/sign-in/email")) {
					// Extract client IP safely (or fallback to unknown-client)
					const forwarded = request.headers.get("x-forwarded-for");
					const ip = forwarded ? forwarded.split(",")[0].trim() : "client-ip";
					const rateCheck = checkRateLimit(ip);
					if (!rateCheck.allowed) {
						return new Response(
							JSON.stringify({
								message: "Terlalu banyak percobaan masuk. Silakan coba lagi beberapa saat.",
							}),
							{
								status: 429,
								headers: {
									"Content-Type": "application/json",
									"Retry-After": "60",
								},
							},
						);
					}
				}
				return auth.handler(request);
			},
		},
	},
});
