import { readFile, writeFile } from "node:fs/promises";
import { escapeShellValue, generateVariableName } from "./utils.js";

/**
 * Options for converting CDK outputs to shell export file
 */
export interface ConvertOptions {
	/** Input JSON file path */
	inputPath: string;
	/** Output shell file path */
	outputPath: string;
	/** Environment variable prefix (default: 'CDK_') */
	prefix?: string;
}

/**
 * CDK outputs structure: { [stackName: string]: { [outputKey: string]: string } }
 */
type CdkOutputs = Record<string, Record<string, string>>;

/**
 * Convert AWS CDK outputs.json to shell-sourceable export file
 *
 * @param options - Conversion options
 * @throws {Error} If file reading/writing or JSON parsing fails
 *
 * @example
 * ```typescript
 * await convertOutputsToShell({
 *   inputPath: 'var/outputs.json',
 *   outputPath: 'var/outputs.sh'
 * });
 * ```
 */
export async function convertOutputsToShell(options: ConvertOptions): Promise<void> {
	const { inputPath, outputPath, prefix = "CDK_" } = options;

	// Read input JSON file
	let jsonContent: string;
	try {
		jsonContent = await readFile(inputPath, "utf-8");
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			throw new Error(`Input JSON not found: ${inputPath}`);
		}
		throw new Error(
			`Failed to read input: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	// Parse JSON
	let outputs: CdkOutputs;
	try {
		outputs = JSON.parse(jsonContent) as CdkOutputs;
	} catch (error) {
		throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
	}

	// Validate JSON structure
	if (typeof outputs !== "object" || outputs === null || Array.isArray(outputs)) {
		throw new Error("Unexpected JSON root structure (expected object).");
	}

	// Generate shell export statements
	const lines: string[] = [
		"#!/usr/bin/env bash",
		"# Auto-generated from CDK outputs.json. Do not edit manually.",
		"# Source this file:",
		`#   source ${outputPath}`,
		"",
	];

	for (const [stackName, stackOutputs] of Object.entries(outputs)) {
		if (typeof stackOutputs !== "object" || stackOutputs === null) {
			continue;
		}

		for (const [outputKey, outputValue] of Object.entries(stackOutputs)) {
			if (typeof outputValue !== "string") {
				continue;
			}

			const varName = generateVariableName(stackName, outputKey, prefix);
			const escapedValue = escapeShellValue(outputValue);
			lines.push(`export ${varName}='${escapedValue}'`);
		}
	}

	// Write output shell file
	const shellContent = `${lines.join("\n")}\n`;
	try {
		await writeFile(outputPath, shellContent, "utf-8");
	} catch (error) {
		throw new Error(
			`Failed to write output: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

// Re-export types and utilities that might be useful for library users
export { escapeShellValue, generateVariableName, sanitizeVariableName } from "./utils.js";
export type { CdkOutputs };
