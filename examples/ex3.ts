// npm build した後に実行すること
// TypeScript example

import { type ConvertOptions, convertOutputsToShell } from "@heiwa4126/cdk2env";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

async function main(): Promise<void> {
	const tempDir = join(process.cwd(), "examples", "temp");
	const inputPath = join(tempDir, "outputs-ts.json");
	const outputPath = join(tempDir, "outputs-ts.sh");

	// Create temp directory and sample JSON
	await mkdir(tempDir, { recursive: true });
	await writeFile(
		inputPath,
		JSON.stringify(
			{
				ProdStack: {
					AppUrl: "https://prod.example.com",
					Version: "1.0.0",
				},
			},
			null,
			2,
		),
	);

	// Convert with type-safe options
	const options: ConvertOptions = {
		inputPath,
		outputPath,
		prefix: "APP_", // Custom prefix
	};

	try {
		await convertOutputsToShell(options);
		console.log("TypeScript example: Conversion successful!");
		console.log(`Output written to: ${outputPath}`);
	} catch (error) {
		console.error("Conversion failed:", error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

main();
