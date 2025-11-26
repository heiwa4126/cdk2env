import { describe, expect, it } from "vitest";
import { escapeShellValue, generateVariableName, sanitizeVariableName } from "../src/utils.js";

describe("sanitizeVariableName", () => {
	it("should convert to uppercase", () => {
		expect(sanitizeVariableName("mystack")).toBe("MYSTACK");
	});

	it("should replace hyphens with underscores", () => {
		expect(sanitizeVariableName("my-stack-dev")).toBe("MY_STACK_DEV");
	});

	it("should replace dots with underscores", () => {
		expect(sanitizeVariableName("bucket.name")).toBe("BUCKET_NAME");
	});

	it("should replace special characters with underscores", () => {
		expect(sanitizeVariableName("URL-Address")).toBe("URL_ADDRESS");
		expect(sanitizeVariableName("test@123#abc")).toBe("TEST_123_ABC");
	});

	it("should handle numbers", () => {
		expect(sanitizeVariableName("Stack123")).toBe("STACK123");
	});
});

describe("escapeShellValue", () => {
	it("should escape single quotes", () => {
		expect(escapeShellValue("It's a test")).toBe("It'\\''s a test");
	});

	it("should handle multiple single quotes", () => {
		expect(escapeShellValue("'don't' can't")).toBe("'\\''don'\\''t'\\'' can'\\''t");
	});

	it("should not modify strings without single quotes", () => {
		expect(escapeShellValue("hello world")).toBe("hello world");
		expect(escapeShellValue("$(whoami)")).toBe("$(whoami)");
	});

	it("should handle double quotes (no escaping needed in single quotes)", () => {
		expect(escapeShellValue('She said "Hello"')).toBe('She said "Hello"');
	});
});

describe("generateVariableName", () => {
	it("should generate correct variable name with default prefix", () => {
		expect(generateVariableName("MyStack", "ApiEndpoint")).toBe("CDK_MYSTACK_APIENDPOINT");
	});

	it("should use custom prefix", () => {
		expect(generateVariableName("MyStack", "ApiEndpoint", "APP_")).toBe("APP_MYSTACK_APIENDPOINT");
	});

	it("should handle special characters in stack and key names", () => {
		expect(generateVariableName("my-stack-dev", "bucket.name")).toBe(
			"CDK_MY_STACK_DEV_BUCKET_NAME",
		);
	});

	it("should handle numeric characters", () => {
		expect(generateVariableName("Stack123", "Output456")).toBe("CDK_STACK123_OUTPUT456");
	});
});
