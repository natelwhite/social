import argon2 from "argon2";
import { db } from "#prisma/db.ts";

export type PublicUser = {
	id: string;
	email: string;
	username: string;
};

type CreateUserInput = {
	email: string;
	username: string;
	password: string;
};

type LoginInput = {
	email: string;
	password: string;
};

// create a user w/out password data from user with password data
export function toPublicUser(user: {
	_id: string;
	email: string;
	username: string;
}): PublicUser {
	return {
		id: user._id,
		email: user.email,
		username: user.username,
	};
}

export function createUser(input: CreateUserInput): Promise<PublicUser> {
	const email = input.email.trim().toLowerCase();
	const username = input.username.trim().toLowerCase();
	const password = input.password;
	// if no email || username || password, return error
	if (!email || !username || !password) {
		return Promise.reject(new Error("Missing required fields"));
	}
	// if password invalid, return error
	if (password.length < 4) {
		return Promise.reject(new Error("Password must be at least 4 characters"));
	}
	// if username invalid, return error
	if (!/^[a-z0-9_]{3,30}$/.test(username)) {
		return Promise.reject(new Error("Invalid username"));
	}
	// hash password and create user
	return argon2
		.hash(password, { type: argon2.argon2id })
		.then((passwordHash) => {
			return db.orm.users.create({
				email,
				username,
				passwordHash,
			});
		})
		.then(toPublicUser);
}

export function loginUser(input: LoginInput): Promise<PublicUser> {
	const email = input.email.trim().toLowerCase();
	const password = input.password;
	// if no email || password given, return error
	if (!email || !password) {
		return Promise.reject(new Error("Invalid email or password"));
	}
	// find user that matches email
	return db.orm.users
		.where({ email })
		.first()
		.then((user) => {
			if (!user) {
				// if no user with email
				throw new Error("Invalid email or password");
			}
			return argon2
				.verify(user.passwordHash, password)
				.then((validPassword) => {
					if (!validPassword) {
						// if password doesn't match
						throw new Error("Invalid email or password");
					}
					console.log(`Logged in as ${user.username}`);
					return toPublicUser(user);
				});
		});
}
