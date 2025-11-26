import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/main.ts", "src/index.ts"],
	format: ["esm", "cjs"],
	outDir: "dist",
	bundle: false,
	splitting: false,
	sourcemap: true,
	clean: true,
	dts: {
		resolve: true,
		entry: ["src/index.ts"],
	},
});
