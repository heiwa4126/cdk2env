import { describe, expect, it } from "vitest";
import { hello } from "../src/hello.js";

describe("hello", () => {
	it('should return "Hello!"', () => {
		expect(hello()).toBe("Hello!");
	});
});
