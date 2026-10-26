import { createHash, randomBytes } from "node:crypto";

import { db } from "#prisma/db.ts";

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type SessionRecord = {
	tokenHash: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
};

// hash a random token
function hashSessionToken(token: string): string {
	return createHash("sha256").update(token).digest("hex");
}

// create a session from a userId
export function createSession(userId: string): Promise<string> {
	const sessionToken = randomBytes(32).toString("base64url");
	const session: SessionRecord = {
		tokenHash: hashSessionToken(sessionToken),
		userId: userId,
		expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
		createdAt: new Date()
	}
	// db query -> create new session with given userId
	return db.orm.sessions
		.create(session)
		.then(() => {
			// Return the raw token to the caller.
			// Store its hash in MongoDB.
			return sessionToken;
		});
}

// get the userId from a session token
export function getUserIdFromSession(sessionToken: string | undefined): Promise<string | null> {
	if (!sessionToken) {
		return Promise.resolve(null);
	}
	const tokenHash = hashSessionToken(sessionToken);
	// db query -> find session and get userId unless session expired
	return db.orm.sessions
		.where({ tokenHash })
		.first()
		.then((session) => {
			// if session not found
			if (!session) {
				return null;
			}
			// if session expired, delete it
			if (session.expiresAt.getTime() <= Date.now()) {
				return deleteSession(sessionToken).then(() => null);
			}
			return String(session.userId);
		});
}

// delete a given session
export function deleteSession(sessionToken: string): Promise<void> {
	const tokenHash = hashSessionToken(sessionToken); // get hash
	// db query -> find session & delete it
	return db.orm.sessions
		.where({ tokenHash })
		.delete()
		.then(() => undefined);
}
