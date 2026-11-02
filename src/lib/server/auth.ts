import argon2 from "argon2";
import type { User, PublicUser } from "./user";
import {
	toPublicUser,
	newUser,
	getUserByEmail,
	getUserByUsername,
	getUserByUsernameOrEmail,
} from "./user";

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
		return user;
	}
}

async function loginUser(user: User, password: string): Promise<boolean> {
	if (!user) {
		return false;
	}
	// validate password
	try {
		const validPass = await argon2.verify(user.passwordHash, password);
		if (!validPass) {
			return false;
		}
		return true;
	} catch (err) {
		console.error("Password verification failed", err);
		throw new Error("Unable to login");
	}
}

export async function loginUserWithUsernameOrEmail(
	identifier: string,
	password: string,
): Promise<PublicUser> {
	if (!identifier) {
		throw new Error("Invalid username or email");
	}
	const user_match = await getUserByUsernameOrEmail(identifier);
	// if no user with identifier
	if (!user_match) {
		throw new Error("Username or email not found");
	} else {
		if (await loginUser(user_match, password)) {
			return toPublicUser(user_match);
		} else {
			throw new Error("Incorrect password");
		}
	}
}
