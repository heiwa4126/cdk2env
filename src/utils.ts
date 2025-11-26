/**
 * Sanitize a string to be used as a shell variable name part
 * Converts to uppercase and replaces non-alphanumeric characters with underscore
 *
 * @param str - Input string
 * @returns Sanitized string safe for shell variable names
 *
 * @example
 * sanitizeVariableName('my-stack-dev') // 'MY_STACK_DEV'
 * sanitizeVariableName('bucket.name') // 'BUCKET_NAME'
 */
export function sanitizeVariableName(str: string): string {
	return str.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

/**
 * Escape a value for safe use in shell single quotes
 * Converts single quotes to '\'' which safely closes, escapes, and reopens the quote
 *
 * @param value - Value to escape
 * @returns Escaped value safe for shell single quotes
 *
 * @example
 * escapeShellValue("It's a test") // "It'\\''s a test"
 * escapeShellValue('$(whoami)') // '$(whoami)' (no change, safe in single quotes)
 */
export function escapeShellValue(value: string): string {
	return value.replace(/'/g, "'\\''");
}

/**
 * Generate a shell variable name from stack name and output key
 *
 * @param stackName - CDK stack name
 * @param outputKey - Output key from the stack
 * @param prefix - Prefix for the variable name (default: 'CDK_')
 * @returns Complete shell variable name
 *
 * @example
 * generateVariableName('MyStack', 'ApiEndpoint') // 'CDK_MYSTACK_APIENDPOINT'
 * generateVariableName('my-stack', 'bucket.name', 'APP_') // 'APP_MY_STACK_BUCKET_NAME'
 */
export function generateVariableName(
	stackName: string,
	outputKey: string,
	prefix = "CDK_",
): string {
	return `${prefix}${sanitizeVariableName(stackName)}_${sanitizeVariableName(outputKey)}`;
}
