# Copilot Instructions

## Project Overview

This is a TypeScript library (`@heiwa4126/cdk2env`) that converts AWS CDK `outputs.json` files to shell-sourceable environment variable export files (`.sh`). It provides both a CLI tool (`cdk2env`) and a programmatic API with dual ESM/CJS support, automated trusted publishing to npmjs via GitHub Actions with Sigstore attestation.

**Full specification**: See `docs/SPEC.md`

## Architecture & Build System

**Dual Module Support Pattern:**

- Uses `tsup` for bundling with both ESM (`.js`) and CJS (`.cjs`) outputs
- `package.json` exports field provides dual compatibility for library API
- TypeScript is configured with `"module": "nodenext"` for modern module resolution
- CLI entry point (`src/main.ts`) uses ESM imports with `.js` extension for compatibility
- CLI binary: `cdk2env` (ESM format only)

**Critical Build Flow:**

```bash
npm run build    # tsup builds both formats + types
npm test        # vitest with TypeScript support
npm run smoke-test  # Tests all three usage patterns (ESM/CJS/TS)
```

## Key Development Patterns

**Testing Strategy:**

- Use `vitest` with globals enabled (see `vite.config.ts`)
- Import source files with `.js` extensions even from `.ts` files: `import { hello } from "../src/hello.js"`
- Run `npm run smoke-test` to verify all module formats work correctly

**Package.json Script Conventions:**

- `prepublishOnly`: Runs full build + test pipeline automatically before any publish
- `prepack`/`postpack`: Strips scripts from package.json during packaging for security
- Scripts use `npm pkg` commands for package.json manipulation

**Formatting & Linting:**

- Biome handles both formatting and linting (replaces ESLint + Prettier)
- Line width: 100 characters
- Strict TypeScript with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`
- `test/fixtures/invalid.json` is excluded via `overrides` (intentionally malformed for testing)
- Biome config uses `overrides[].includes` to disable linting/formatting for specific files

## Publishing & CI/CD Workflow

**Trusted Publishing Setup:**
This project uses npm's trusted publishing feature. The workflow in `.github/workflows/publish.yml`:

- Triggers on semantic version tags: `v1.2.3` (release) or `v1.2.3-rc.1` (prerelease)
- Only runs if `github.repository_owner == github.actor` (security)
- Uses OIDC authentication (no npm tokens required)
- Automatically applies `--tag dev` for prerelease versions (contains `-`)

**Version Tagging:**

- Normal releases: `v1.2.3` → `latest` tag on npm
- Prereleases: `v1.2.3-rc.1` → `dev` tag on npm

## File Structure Conventions

- `src/`: TypeScript source files
  - `main.ts`: CLI entry point
  - `index.ts`: Library API exports (`convertOutputsToShell()` function)
  - `utils.ts`: Utility functions (variable name sanitization, shell escaping, etc.)
- `examples/`: Usage examples for ESM (`.mjs`), CJS (`.cjs`), and TypeScript (`.ts`)
- `test/`: Vitest test files
  - `test/fixtures/`: Test JSON files and expected shell outputs
    - `invalid.json`: Intentionally malformed JSON for error testing (excluded from Biome)
  - `test/temp/`: Temporary test output files (gitignored)
- `docs/`: Documentation
  - `SPEC.md`: Complete package specification
- `dist/`: Build output (both `.js` ESM and `.cjs` CommonJS files)

## Development Commands

```bash
# Development workflow
npm run build        # Build both formats + generate types
npm test            # Run tests once
npm run test:watch  # Watch mode testing
npm run smoke-test  # Test all module formats work

# Code quality
npm run lint        # Biome linting
npm run format      # Biome formatting

# Publishing preparation
npm pack --dry-run  # Preview package contents
```

## Important Notes

- Always use `.js` extensions in TypeScript imports for Node.js ESM compatibility
- The `"type": "module"` in package.json makes this an ESM-first project
- CLI script requires the shebang `#!/usr/bin/env node` in the built output
- Never commit npm tokens - this project uses OIDC trusted publishing exclusively

## Core Functionality

**CLI Behavior:**

- Default paths: `var/outputs.json` → `var/outputs.sh`
- Silent on success (no output)
- Errors only to stderr with `Error: ` prefix
- Exit codes: 0 (success), 1 (error)
- Supports `--help/-h` and `--version/-V` flags

**Variable Naming Convention:**

- Prefix: `CDK_` (customizable via API)
- Format: `CDK_STACKNAME_OUTPUTKEY` (all uppercase)
- Non-alphanumeric characters → `_`
- Example: `MyStack.ApiEndpoint` → `CDK_MYSTACK_APIENDPOINT`

**Security:**

- All values wrapped in single quotes
- Single quotes in values escaped as `'\''`
- Shell injection safe

**API vs CLI:**

- Library API throws exceptions on error
- CLI catches exceptions and prints to stderr
- Library API has no logging/progress output
