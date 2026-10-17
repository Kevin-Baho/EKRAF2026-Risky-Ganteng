import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { adapter } from "./db";

/**
 * Simple in-memory rate-limiter store (resets on server restart).
 * Key: identifier (IP or userId) -> { count, windowStart }
 */
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // max requests per window

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
	const now = Date.now();
	const record = rateLimitStore.get(identifier);

	if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
		rateLimitStore.set(identifier, { count: 1, windowStart: now });
		return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
	}

	if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
		return { allowed: false, remaining: 0 };
	}

	record.count += 1;
	return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

export function resetRateLimit(identifier: string) {
	rateLimitStore.delete(identifier);
}

export const auth = betterAuth({
	database: adapter,
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // 1 day
		cookieCache: {
			enabled: true,
			maxAge: 60 * 15,
		},
	},
	plugins: [tanstackStartCookies()],
});

export default auth;
