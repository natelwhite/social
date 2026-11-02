import { db } from "#prisma/db.ts";

const findUserQuery = (id: string) => {
	return db.orm.users.where({ _id: id }).first();
};

export type User = Awaited<ReturnType<typeof findUserQuery>>;

export type PublicUser = {
	id: string;
	email: string;
	username: string;
};

// create a user w/out password data from user with password data
export function toPublicUser(user: User): PublicUser {
	if (!user) {
		throw new Error("toPublicUser failed");
	}
	return {
		id: user._id,
		email: user.email,
		username: user.username,
	};
}

export async function getUserById(id: string): Promise<PublicUser | null> {
	try {
		const user = await db.orm.users.where({ _id: id }).first();
		if (!user) {
			return null;
		} else {
			return toPublicUser(user);
		}
	} catch (err) {
		console.error("Failed to find user.", err);
		throw new Error("Database error.");
	}
}

// Server-side only!!
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

export async function getPublicUserByUsername(
	username: string,
): Promise<PublicUser | null> {
	const user = await getUserByUsername(username);
	if (!user) {
		return null;
	} else {
		return toPublicUser(user);
	}
}

// Server-side only!!
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

export async function getPublicUserByEmail(
	email: string,
): Promise<PublicUser | null> {
	const user = await getUserByEmail(email);
	if (!user) {
		return null;
	} else {
		return toPublicUser(user);
	}
}

export async function newUser(
	email: string,
	username: string,
	passwordHash: string,
): Promise<PublicUser | null> {
	try {
		const user = await db.orm.users.create({
			email,
			username,
			passwordHash,
		});
		return toPublicUser(user);
	} catch (err: any) {
		console.error("Failed to create user", err);
		throw new Error("Unable to create user. Please try again.");
	}
}
