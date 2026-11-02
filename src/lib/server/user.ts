import { db } from "#prisma/db.ts";

const findUserQuery = (id: string) => {
	return db.orm.users.where({ _id: id }).first();
};

export type User = Awaited<ReturnType<typeof findUserQuery>>;

export async function getUserById(id: string): Promise<User | null> {
	try {
		const user = await db.orm.users.where({ _id: id }).first();
		if (!user) {
			return null;
		} else {
			return user;
		}
	} catch (err) {
		console.error("Failed to find user.", err);
		throw new Error("Database error.");
	}
}

export async function getUserByEmail(email: string): Promise<User | null> {
	try {
		const user = await db.orm.users.where({ email: email }).first();
		if (!user) {
			return null;
		} else {
			return user;
		}
	} catch (err) {
		console.error("getUserByEmail failed", err);
		throw new Error("Database error");
	}
}

export async function getUserByUsername(
	username: string,
): Promise<User | null> {
	try {
		const user = await db.orm.users.where({ username: username }).first();
		if (!user) {
			return null;
		} else {
			return user;
		}
	} catch (err) {
		console.error("getUserByUsername failed", err);
		throw new Error("Database error");
	}
}

export async function newUser(
	email: string,
	username: string,
	passwordHash: string,
): Promise<User | null> {
	try {
		const user = await db.orm.users.create({
			email,
			username,
			passwordHash,
		});
		return user;
	} catch (err: any) {
		console.error("Failed to create user", err);
		throw new Error("Unable to create user. Please try again.");
	}
}
