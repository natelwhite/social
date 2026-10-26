import type { ServerInit, Handle } from '@sveltejs/kit/hooks';
import { building } from "$app/env";
import { connectDatabase } from "#prisma/db.ts";
import { getUserById } from '#lib/server/user.ts';
import { deleteSession, getUserIdFromSession } from '#lib/server/session.ts';

function startJobs() {
	connectDatabase();
}

export const init: ServerInit = async () => {
	if (!building) {
		startJobs();
	}
}

export const handle: Handle = async ({event, resolve}) => {
	const token = event.cookies.get("session");
	return getUserIdFromSession(token)
		.then((userId) => {
			return userId ? getUserById(userId) : null;
		})
		.then((user) => {
			event.locals.user = user;
			if (token && user === undefined) {
				return deleteSession(token).then(() => {
					event.cookies.delete("session", {path: "/"});
				})
			}
		})
		.then(() => resolve(event));
}
