# cdk2env (@heiwa4126/cdk2env)

[![npm version](https://img.shields.io/npm/v/@heiwa4126/cdk2env.svg)](https://www.npmjs.com/package/@heiwa4126/cdk2env)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

Convert AWS CDK `outputs.json` to shell-sourceable export file. Provides both CLI tool and programmatic API with dual ESM/CJS support.

## Features

- 🚀 **CLI & Library**: Use as a command-line tool or programmatic API
- 📦 **Dual Module Support**: Works with both ES Modules and CommonJS
- 🔒 **Shell-Safe**: Automatic escaping prevents shell injection attacks
- ⚡ **Zero Dependencies**: Built with Node.js standard library only
- 📝 **TypeScript**: Full type definitions included
- ✅ **Well Tested**: Comprehensive test coverage

## Installation

### Global (CLI)

```bash
npm install -g @heiwa4126/cdk2env
# or
pnpm add -g @heiwa4126/cdk2env
```

### Local (Library)

```bash
npm install --save-dev @heiwa4126/cdk2env
# or
pnpm add -D @heiwa4126/cdk2env
```

## Usage

### CLI

```bash
# Default: var/outputs.json → var/outputs.sh
cdk2env

# Custom input file
cdk2env path/to/outputs.json

# Custom input and output
cdk2env path/to/outputs.json path/to/exports.sh

# Show help
cdk2env --help

# Show version
cdk2env --version
```

### Library API

#### ES Modules

```typescript
import { convertOutputsToShell } from "@heiwa4126/cdk2env";

await convertOutputsToShell({
  inputPath: "var/outputs.json",
  outputPath: "var/outputs.sh",
});
```

#### CommonJS

```javascript
const { convertOutputsToShell } = require("@heiwa4126/cdk2env");

await convertOutputsToShell({
  inputPath: "var/outputs.json",
  outputPath: "var/outputs.sh",
});
```

#### TypeScript

```typescript
import { convertOutputsToShell, type ConvertOptions } from "@heiwa4126/cdk2env";

const options: ConvertOptions = {
  inputPath: "var/outputs.json",
  outputPath: "var/outputs.sh",
  prefix: "APP_", // Custom prefix (default: 'CDK_')
};

await convertOutputsToShell(options);
```

## Example Workflow

```bash
# 1. Deploy CDK and generate outputs
cdk deploy --outputs-file var/outputs.json

# 2. Convert to shell format
cdk2env

# 3. Source the generated file
source var/outputs.sh

# 4. Use environment variables
echo $CDK_MYSTACK_APIENDPOINT
curl $CDK_MYSTACK_APIENDPOINT/health
```

## Input/Output Format

### Input: CDK outputs.json

```json
{
  "MyStack": {
    "ApiEndpoint": "https://abc123.execute-api.us-east-1.amazonaws.com",
    "BucketName": "my-bucket-abc123"
  }
}
```

### Output: Shell export file

```bash
#!/usr/bin/env bash
# Auto-generated from CDK outputs.json. Do not edit manually.

export CDK_MYSTACK_APIENDPOINT='https://abc123.execute-api.us-east-1.amazonaws.com'
export CDK_MYSTACK_BUCKETNAME='my-bucket-abc123'
```

## Variable Naming Convention

- Prefix: `CDK_` (customizable via API)
- Format: `CDK_STACKNAME_OUTPUTKEY` (uppercase)
- Special characters → `_`
- Example: `MyStack.ApiEndpoint` → `CDK_MYSTACK_APIENDPOINT`

## Security

All values are wrapped in single quotes with proper escaping:

```javascript
// Input
{
  "Stack": {
    "Message": "It's a test! $(whoami)"
  }
}

// Output (safe)
export CDK_STACK_MESSAGE='It'\''s a test! $(whoami)'
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm run build

# Test
pnpm test

# Lint
pnpm run lint

# Format
pnpm run format

# All checks (lint + test + build + smoke-test)
pnpm run prepublishOnly
```

## Documentation

See [docs/SPEC.md](docs/SPEC.md) for complete specification.

## License

MIT
