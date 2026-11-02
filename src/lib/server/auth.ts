import argon2 from "argon2";
import type { User } from "./user";
import { newUser, getUserByEmail, getUserByUsername } from "./user";

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

export async function registerUser(
	email: string,
	username: string,
	password: string,
): Promise<PublicUser> {
	email = email.trim().toLowerCase();
	username = username.trim().toLowerCase();
	// validate data
	if (!email || !username || !password) {
		throw new Error("Missing required fields");
	}
	if (password.length < 4) {
		throw new Error("Password must be at least 4 characters");
	}
	if (!/^[a-z0-9_]{3,30}$/.test(username)) {
		throw new Error("Invalid username");
	}
	// check email & username availability
	const email_match = await getUserByEmail(email);
	if (email_match) {
		throw new Error("Duplicate email");
	}
	const username_match = await getUserByUsername(username);
	if (username_match) {
		throw new Error("Duplicate username");
	}
	// hash password
	let passwordHash: string;
	try {
		passwordHash = await argon2.hash(password, { type: argon2.argon2id });
	} catch (err: any) {
		console.error("registerUser failed", err);
		throw new Error("Unable to create account. Please try again.");
	}
	const user = await newUser(email, username, passwordHash);
	if (!user) {
		throw new Error("registerUser failed");
	} else {
		return toPublicUser(user);
	}
}

async function loginUser(user: User, password: string): Promise<PublicUser> {
	// validate password
	if (!user) {
		throw new Error("User not found");
	}
	try {
		const validPass = await argon2.verify(user.passwordHash, password);
		if (!validPass) {
			throw new Error("Invalid email or password");
		}
		return toPublicUser(user);
	} catch (err) {
		console.error("Password verification failed", err);
		throw new Error("Unable to login");
	}
}

export async function loginUserWithEmail(
	email: string,
	password: string,
): Promise<PublicUser> {
	email = email.trim().toLowerCase();
	// if no email || password given, return error
	if (!email || !password) {
		throw new Error("Invalid email or password");
	}
	// find user with email
	let email_match: User = null;
	try {
		email_match = await getUserByEmail(email);
	} catch (err) {
		console.error("loginUserWithEmail failed", err);
		throw new Error("Unable to login");
	}
	if (!email_match) {
		throw new Error("Email not found");
	} else {
		return loginUser(email_match, password);
	}
}

export async function loginUserWithUsername(
	username: string,
	password: string,
): Promise<PublicUser> {
	// if no username || password given, return error
	if (!username || !password) {
		throw new Error("Invalid email or password");
	}
	// find user with username
	const username_match = await getUserByUsername(username);
	if (!username_match) {
		throw new Error("Username not found");
	} else {
		return loginUser(username_match, password);
	}
}
