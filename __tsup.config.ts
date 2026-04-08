import { defineConfig } from "tsup";

export default defineConfig({
	entry: {
		main: "src/main.ts", // CLI
		index: "src/index.ts", // Library API
	},
	format: ["esm", "cjs"], // ESM + CommonJS
	dts: true, // Generate type definitions
	clean: true, // Clean dist/ before build
	sourcemap: true,
	splitting: false,
	treeshake: true,
	outDir: "dist",
});
