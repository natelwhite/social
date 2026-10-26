import { db } from "#prisma/db.ts";
import type { PublicUser } from "./auth";
import { toPublicUser } from "./auth";

export function getUserById(id: string): Promise<PublicUser | null> {
	return db.orm.users
		.where({ _id: id })
		.first()
		.then((user) => {
			console.log(user);
			return user ? toPublicUser(user) : null;
		});
}
