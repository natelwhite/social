import {
	MongoFieldFilter,
	MongoOrExpr,
} from "@prisma/orm-mongo/query-ast/execution";
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
		throw new Error("toPublicUser failed!");
	} else {
		return {
			id: user._id,
			email: user.email,
			username: user.username,
		};
	}
}

// Server-side only!!
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

export async function getPublicUserById(
	id: string,
): Promise<PublicUser | null> {
	return toPublicUser(await getUserById(id));
}

// Servier-side only!!
export async function getUserByUsernameOrEmail(
	identifier: string,
): Promise<User | null> {
	try {
		const user = await db.orm.users
			.where(
				MongoOrExpr.of([
					MongoFieldFilter.eq("username", identifier),
					MongoFieldFilter.eq("email", identifier),
				]),
			)
			.first();
		return user;
	} catch (err) {
		console.error("getUserByUsernameOrEmail failed", err);
		throw new Error("Query error");
	}
}

export async function getPublicUserByUsernameOrEmail(
	identifier: string,
): Promise<PublicUser | null> {
	return toPublicUser(await getUserByUsernameOrEmail(identifier));
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
	return toPublicUser(await getUserByUsername(username));
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
	return toPublicUser(await getUserByEmail(email));
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
