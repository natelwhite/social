import type { ServerInit, Handle } from "@sveltejs/kit/hooks";
import { building } from "$app/env";
import { connectDatabase } from "#prisma/db.ts";
import { getUserById } from "#lib/server/user.ts";
import { deleteSession, getUserIdBySessionToken } from "#lib/server/session.ts";

function startJobs() {
	connectDatabase();
}

export const init: ServerInit = async () => {
	if (!building) {
		startJobs();
	}
};

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get("session");
	if (!token) {
		return resolve(event);
	}
	const user_id = await getUserIdBySessionToken(token);
	if (!user_id) {
		event.cookies.delete("session", { path: "/" });
		deleteSession(token);
		return resolve(event);
	}
	const user = await getUserById(user_id);
	if (!user) {
		event.cookies.delete("session", { path: "/" });
		deleteSession(token);
		return resolve(event);
	}
	event.locals.user = user;
	return resolve(event);
};
