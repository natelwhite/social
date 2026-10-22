import type { Cookies } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";

import { createUser, loginUser } from "#lib/server/auth.ts";
import { createSession } from "#lib/server/session.ts";

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getString(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value : "";
}

function isDuplicateKeyError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}

	const message = error.message.toLowerCase();

	return (
		message.includes("duplicate") ||
		message.includes("unique") ||
		message.includes("already exists")
	);
}

function setSessionCookie(cookies: Cookies, token: string) {
	cookies.set(SESSION_COOKIE_NAME, token, {
		path: "/",
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: SESSION_DURATION_SECONDS,
	});
}

export const actions = {
	signup: async ({ request, cookies }) => {
		const formData = await request.formData();

		const email = getString(formData, "email");
		const username = getString(formData, "username");
		const password = getString(formData, "password");

		try {
			const user = await createUser({
				email,
				username,
				password,
			});

			const sessionToken = await createSession(user.id);

			setSessionCookie(cookies, sessionToken);
		} catch (error) {
			if (isDuplicateKeyError(error)) {
				return fail(409, {
					form: "signup",
					message: "That email or username is already in use.",
					email,
					username,
				});
			}

			const message =
				error instanceof Error
					? error.message
					: "Unable to create your account.";

			return fail(400, {
				form: "signup",
				message,
				email,
				username,
			});
		}

		throw redirect(303, "/");
	},

	login: async ({ request, cookies }) => {
		const formData = await request.formData();

		const email = getString(formData, "email");
		const password = getString(formData, "password");

		try {
			const user = await loginUser({
				email,
				password,
			});

			const sessionToken = await createSession(user.id);

			setSessionCookie(cookies, sessionToken);
		} catch {
			// Keep login failures generic. Do not reveal whether the email exists.
			return fail(400, {
				form: "login",
				message: "Invalid email or password.",
				email,
			});
		}

		throw redirect(303, "/");
	},
} satisfies Actions;
