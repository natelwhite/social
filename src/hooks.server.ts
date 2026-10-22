import { building } from "$app/env";
import { connectDatabase } from "./prisma/db";

function startJobs() {
	connectDatabase();
}

if (!building) {
	startJobs();
}
