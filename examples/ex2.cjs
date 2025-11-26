// npm build した後に実行すること
// CommonJS example
const { convertOutputsToShell } = require("@heiwa4126/cdk2env");
const { writeFile, mkdir } = require("node:fs/promises");
const { join } = require("node:path");

async function main() {
	const tempDir = join(process.cwd(), "examples", "temp");
	const inputPath = join(tempDir, "outputs-cjs.json");
	const outputPath = join(tempDir, "outputs-cjs.sh");

	// Create temp directory and sample JSON
	await mkdir(tempDir, { recursive: true });
	await writeFile(
		inputPath,
		JSON.stringify(
			{
				TestStack: {
					DatabaseUrl: "postgres://localhost:5432/test",
				},
			},
			null,
			2,
		),
	);

	// Convert
	await convertOutputsToShell({ inputPath, outputPath });

	console.log("CommonJS example: Conversion successful!");
	console.log(`Output written to: ${outputPath}`);
}

main().catch(console.error);
