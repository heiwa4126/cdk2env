// npm build した後に実行すること
// ESM example

import { convertOutputsToShell } from "@heiwa4126/cdk2env";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const tempDir = join(process.cwd(), "examples", "temp");
const inputPath = join(tempDir, "outputs.json");
const outputPath = join(tempDir, "outputs.sh");

// Create temp directory and sample JSON
await mkdir(tempDir, { recursive: true });
await writeFile(
	inputPath,
	JSON.stringify(
		{
			MyStack: {
				ApiEndpoint: "https://example.com/api",
				BucketName: "my-bucket",
			},
		},
		null,
		2,
	),
);

// Convert
await convertOutputsToShell({ inputPath, outputPath });

console.log("ESM example: Conversion successful!");
console.log(`Output written to: ${outputPath}`);
