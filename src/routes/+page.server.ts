import type { Cookies } from "@sveltejs/kit";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

import {
	registerUser,
	loginUserWithUsernameOrEmail,
} from "#lib/server/auth.ts";
import { createSession, deleteSession } from "#lib/server/session.ts";

export const load: PageServerLoad = ({ locals }) => ({ user: locals.user });

const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getString(formData: FormData, name: string): string {
	const value = formData.get(name);
	return typeof value === "string" ? value : "";
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
			const user = await registerUser(email, username, password);

			const sessionToken = await createSession(user.id);

			setSessionCookie(cookies, sessionToken);
		} catch (error: any) {
			// detect duplicate key error code
			if (error.message === "Duplicate email") {
				return fail(409, {
					form: "signup",
					message:
						"Email is already is already associated with an account. Try logging in.",
					email,
					username,
				});
			} else if (error.message === "Duplicate username") {
				return fail(409, {
					form: "signup",
					message: "Username taken!",
					email,
					username,
				});
			} else {
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
		}

		throw redirect(303, "/");
	},

	login: async ({ request, cookies }) => {
		const formData = await request.formData();

		const identifier = getString(formData, "identifier");
		const password = getString(formData, "password");

		try {
			const user = await loginUserWithUsernameOrEmail(identifier, password);

			const sessionToken = await createSession(user.id);

			setSessionCookie(cookies, sessionToken);
		} catch {
			// Keep login failures generic. Do not reveal whether the email exists.
			return fail(400, {
				form: "login",
				message: "Invalid email or password.",
				identifier,
			});
		}

		throw redirect(303, "/");
	},

	logout: async ({ cookies }) => {
		const token = cookies.get(SESSION_COOKIE_NAME);
		if (token) {
			await deleteSession(token);
		}
		cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
		throw redirect(303, "/");
	},
} satisfies Actions;
