import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import adapter from "@sveltejs/adapter-node";

export default defineConfig({
	plugins: [
		sveltekit({
			adapter: adapter(),
		}),
	],
	ssr: {
		noExternal: true,
		external: ["mongodb", "argon2", "dotenv"],
	},
});
