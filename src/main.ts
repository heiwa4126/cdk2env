#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { convertOutputsToShell } from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Show help message
 */
function showHelp(): void {
	console.log(
		`
Usage: cdk2env [input] [output]

Convert AWS CDK outputs.json to shell-sourceable export file

Arguments:
  input   Input JSON file path (default: var/outputs.json)
  output  Output shell file path (default: derived from input)

Options:
  -h, --help     Show this help message
  -V, --version  Show version number

Examples:
  cdk2env
  cdk2env path/to/outputs.json
  cdk2env path/to/outputs.json path/to/exports.sh
`.trim(),
	);
}

/**
 * Show version from package.json
 */
async function showVersion(): Promise<void> {
	try {
		const packageJsonPath = join(__dirname, "..", "package.json");
		const packageJson = JSON.parse(await readFile(packageJsonPath, "utf-8"));
		console.log(packageJson.version);
	} catch {
		console.log("unknown");
	}
}

/**
 * Derive output path from input path by replacing extension with .sh
 */
function deriveOutputPath(inputPath: string): string {
	return inputPath.replace(/\.[^.]*$/, ".sh");
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
	const args = process.argv.slice(2);

	// Check for help flag
	if (args.includes("--help") || args.includes("-h")) {
		showHelp();
		process.exit(0);
	}

	// Check for version flag
	if (args.includes("--version") || args.includes("-V")) {
		await showVersion();
		process.exit(0);
	}

	// Parse positional arguments
	const inputPath = args[0] || "var/outputs.json";
	const outputPath = args[1] || deriveOutputPath(inputPath);

	// Convert paths to absolute
	const absoluteInputPath = resolve(inputPath);
	const absoluteOutputPath = resolve(outputPath);

	try {
		await convertOutputsToShell({
			inputPath: absoluteInputPath,
			outputPath: absoluteOutputPath,
		});
		// Silent on success - no output
		process.exit(0);
	} catch (error) {
		// Print error to stderr with Error: prefix
		console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
		process.exit(1);
	}
}

main();
