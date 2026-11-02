import { createHash, randomBytes } from "node:crypto";

import { db } from "#prisma/db.ts";

import type { PublicUser } from "./user";
import { getPublicUserById } from "./user";

const findSessionQuery = (id: string) => {
	return db.orm.sessions.where({ _id: id }).first();
};
export type Session = Awaited<ReturnType<typeof findSessionQuery>>;

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

// hash a random token
function hashSessionToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

export async function getSessionByToken(
	token: string,
): Promise<Session | null> {
	const tokenHash = hashSessionToken(token);
	try {
		const session = await db.orm.sessions.where({ tokenHash }).first();
		if (!session) {
			return null;
		} else {
			// if session expired
			if (session.expiresAt.getTime() <= Date.now()) {
				// delete session
				try {
					await db.orm.sessions.where({ tokenHash }).delete();
				} catch (err) {
					console.error("Failed to delete session", err);
					throw new Error("Unable to delete session. Please try again.");
				}
			}
			return session;
		}
	} catch (err) {
		console.error("getSessionByToken failed");
		throw new Error("Unable to find session. Please try again.");
	}
}

// create a session from a userId
// returns session token
export async function createSession(userId: string): Promise<string> {
	const sessionToken = randomBytes(32).toString("base64url");
	// create session
	try {
		await db.orm.sessions.create({
			tokenHash: hashSessionToken(sessionToken),
			userId: userId,
			expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
			createdAt: new Date(),
		});
		return sessionToken;
	} catch (err) {
		console.error("Failed to create session", err);
		throw new Error("Unable to create session. Please try again.");
	}
}

// delete session using session token
export async function deleteSession(token: string): Promise<void> {
	const tokenHash = hashSessionToken(token);
	try {
		await db.orm.sessions.where({ tokenHash }).delete();
		return undefined;
	} catch (err) {
		console.error("deleteSession failed", err);
		throw new Error("Unable to delete session. Please try again.");
	}
}

// get the userId from a session token
export async function getPublicUserBySessionToken(
	token: string,
): Promise<PublicUser | null> {
	// find session
	try {
		const session = await getSessionByToken(token);
		// if session not found
		if (!session) {
			return null;
		} else {
			// if session expired
			if (session.expiresAt.getTime() <= Date.now()) {
				await deleteSession(token);
				return null;
			}
			return await getPublicUserById(session.userId);
		}
	} catch (err) {
		console.error("Failed to lookup session", err);
		throw new Error("Unable to retrieve session. Please try again.");
	}
}
