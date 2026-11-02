import type { ServerInit, Handle } from "@sveltejs/kit/hooks";
import { building } from "$app/env";
import { connectDatabase } from "#prisma/db.ts";
import {
	deleteSession,
	getPublicUserBySessionToken,
} from "#lib/server/session.ts";

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
	const user = await getPublicUserBySessionToken(token);
	if (!user) {
		event.cookies.delete("session", { path: "/" });
		deleteSession(token);
		return resolve(event);
	}
	event.locals.user = user;
	return resolve(event);
};
