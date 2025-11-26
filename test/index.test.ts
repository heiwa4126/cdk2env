import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { convertOutputsToShell } from "../src/index.js";

const TEMP_DIR = join(process.cwd(), "test", "temp");
const FIXTURES_DIR = join(process.cwd(), "test", "fixtures");

describe("convertOutputsToShell", () => {
	beforeEach(async () => {
		// Create temp directory for test outputs
		try {
			await mkdir(TEMP_DIR, { recursive: true });
		} catch {
			// Directory might already exist
		}
	});

	afterEach(async () => {
		// Clean up temp files
		try {
			const fs = await import("node:fs/promises");
			const files = await fs.readdir(TEMP_DIR);
			for (const file of files) {
				await unlink(join(TEMP_DIR, file));
			}
		} catch {
			// Ignore errors
		}
	});

	it("should convert standard CDK outputs to shell format", async () => {
		const inputPath = join(FIXTURES_DIR, "sample1.json");
		const outputPath = join(TEMP_DIR, "output1.sh");

		await convertOutputsToShell({ inputPath, outputPath });

		const output = await readFile(outputPath, "utf-8");

		expect(output).toContain("#!/usr/bin/env bash");
		expect(output).toContain(
			"export CDK_MYSTACK_APIENDPOINT='https://abc123.execute-api.us-east-1.amazonaws.com'",
		);
		expect(output).toContain("export CDK_MYSTACK_BUCKETNAME='my-bucket-abc123'");
		expect(output).toContain(
			"export CDK_MYSTACK_FUNCTIONARN='arn:aws:lambda:us-east-1:123456789012:function:my-func'",
		);
		expect(output).toContain(
			"export CDK_ANOTHERSTACK_DATABASEURL='postgres://user:pass@host:5432/db'",
		);
	});

	it("should handle special characters correctly", async () => {
		const inputPath = join(FIXTURES_DIR, "special-chars.json");
		const outputPath = join(TEMP_DIR, "special.sh");

		await convertOutputsToShell({ inputPath, outputPath });

		const output = await readFile(outputPath, "utf-8");

		// Check single quote escaping
		expect(output).toContain("export CDK_STACK_MESSAGE='It'\\''s a test! $(whoami)'");

		// Check double quotes (should be preserved in single quotes)
		expect(output).toContain("export CDK_STACK_QUOTE='She said \"Hello\"'");

		// Check sanitized variable names
		expect(output).toContain("export CDK_MY_STACK_DEV_BUCKET_NAME='test-bucket'");
		expect(output).toContain("export CDK_MY_STACK_DEV_URL_ADDRESS='https://example.com'");
	});

	it("should handle empty outputs", async () => {
		const inputPath = join(FIXTURES_DIR, "empty.json");
		const outputPath = join(TEMP_DIR, "empty.sh");

		await convertOutputsToShell({ inputPath, outputPath });

		const output = await readFile(outputPath, "utf-8");

		expect(output).toContain("#!/usr/bin/env bash");
		expect(output).toContain("# Auto-generated from CDK outputs.json");
		// Should have header but no export statements
		expect(output.match(/export /g)).toBeNull();
	});

	it("should use custom prefix", async () => {
		const inputPath = join(FIXTURES_DIR, "sample1.json");
		const outputPath = join(TEMP_DIR, "custom-prefix.sh");

		await convertOutputsToShell({ inputPath, outputPath, prefix: "APP_" });

		const output = await readFile(outputPath, "utf-8");

		expect(output).toContain("export APP_MYSTACK_APIENDPOINT=");
		expect(output).toContain("export APP_ANOTHERSTACK_DATABASEURL=");
	});

	it("should throw error for non-existent input file", async () => {
		const inputPath = join(TEMP_DIR, "non-existent.json");
		const outputPath = join(TEMP_DIR, "output.sh");

		await expect(convertOutputsToShell({ inputPath, outputPath })).rejects.toThrow(
			"Input JSON not found:",
		);
	});

	it("should throw error for invalid JSON", async () => {
		const inputPath = join(FIXTURES_DIR, "invalid.json");
		const outputPath = join(TEMP_DIR, "output.sh");

		await expect(convertOutputsToShell({ inputPath, outputPath })).rejects.toThrow("Invalid JSON:");
	});

	it("should throw error for non-object root structure", async () => {
		const inputPath = join(TEMP_DIR, "array.json");
		const outputPath = join(TEMP_DIR, "output.sh");

		await writeFile(inputPath, "[]", "utf-8");

		await expect(convertOutputsToShell({ inputPath, outputPath })).rejects.toThrow(
			"Unexpected JSON root structure",
		);
	});
});
