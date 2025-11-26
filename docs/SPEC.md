# cdk2env パッケージ仕様書

## 概要

AWS CDK の`cdk deploy`コマンドで生成される`outputs.json`ファイルを、シェルスクリプトで読み込み可能な環境変数エクスポートファイル(`.sh`)に変換する CLI ツール。

## パッケージ情報

- **パッケージ名**: `@heiwa4126/cdk2env`
- **バージョン**: `1.0.0`
- **説明**: Convert AWS CDK outputs.json to shell-sourceable export file
- **ライセンス**: MIT
- **Node.js バージョン**: `>=18.0.0`
- **タイプ**: ESM (ES Modules)
- **ビルド**: TypeScript → tsup → ESM (`.js`) + CommonJS (`.cjs`)

## インストール方法

### グローバルインストール

```bash
npm install -g @heiwa4126/cdk2env
# または
pnpm add -g @heiwa4126/cdk2env
```

### プロジェクトローカルインストール

```bash
npm install --save-dev @heiwa4126/cdk2env
# または
pnpm add -D @heiwa4126/cdk2env
```

## 使用方法

### コマンドライン

```bash
# デフォルト設定で実行 (var/outputs.json → var/outputs.sh)
cdk2env

# 入力ファイルのみ指定
cdk2env path/to/outputs.json

# 入力と出力を両方指定
cdk2env path/to/outputs.json path/to/exports.sh

# ヘルプ表示
cdk2env --help
cdk2env -h

# バージョン表示
cdk2env --version
cdk2env -V
```

### package.json スクリプト

```json
{
  "scripts": {
    "cdk:outputs": "cdk2env",
    "cdk:outputs:custom": "cdk2env cdk.out/outputs.json env.sh"
  }
}
```

## CLI 引数仕様

### 位置引数

- **第 1 引数** (オプション): 入力 JSON ファイルパス
  - 省略時: `var/outputs.json`
- **第 2 引数** (オプション): 出力シェルファイルパス
  - 省略時: 入力ファイルの拡張子を `.sh` に変更
  - 例: `var/outputs.json` → `var/outputs.sh`

### オプションフラグ

| オプション  | 短縮形 | 説明                         |
| ----------- | ------ | ---------------------------- |
| `--help`    | `-h`   | 使用方法を表示して終了       |
| `--version` | `-V`   | バージョン番号を表示して終了 |

### 引数の優先順位

オプションフラグは位置引数より優先されます:

```bash
cdk2env --help path/to/file.json  # --helpが優先され、使用方法を表示
cdk2env --version                  # バージョンを表示
cdk2env path.json --help           # --helpが優先
```

### 生成されたファイルの使用方法

```bash
# シェルで環境変数を読み込む
source var/outputs.sh

# または
. var/outputs.sh

# 環境変数を使用
echo $CDK_STACKNAME_OUTPUTKEY
```

## 入力形式

### CDK outputs.json の例

```json
{
  "MyStack": {
    "ApiEndpoint": "https://abc123.execute-api.us-east-1.amazonaws.com",
    "BucketName": "my-bucket-abc123",
    "FunctionArn": "arn:aws:lambda:us-east-1:123456789012:function:my-func"
  },
  "AnotherStack": {
    "DatabaseUrl": "postgres://user:pass@host:5432/db"
  }
}
```

### CDK での outputs.json 生成方法

```bash
# CDK デプロイ時に outputs.json を生成
cdk deploy --outputs-file var/outputs.json

# または複数スタック
cdk deploy '*' --outputs-file var/outputs.json
```

## 出力形式

### 生成される .sh ファイルの例

```bash
#!/usr/bin/env bash
# Auto-generated from CDK outputs.json. Do not edit manually.
# Source this file:
#   source var/outputs.sh

export CDK_MYSTACK_APIENDPOINT='https://abc123.execute-api.us-east-1.amazonaws.com'
export CDK_MYSTACK_BUCKETNAME='my-bucket-abc123'
export CDK_MYSTACK_FUNCTIONARN='arn:aws:lambda:us-east-1:123456789012:function:my-func'
export CDK_ANOTHERSTACK_DATABASEURL='postgres://user:pass@host:5432/db'
```

## 変数名の命名規則

1. プレフィックス: `CDK_`
2. スタック名: 大文字に変換
3. 出力キー: 大文字に変換
4. 区切り: アンダースコア `_`
5. 英数字とアンダースコア以外の文字は `_` に置換

### 例

| スタック名     | 出力キー      | 生成される変数名               |
| -------------- | ------------- | ------------------------------ |
| `MyStack`      | `ApiEndpoint` | `CDK_MYSTACK_APIENDPOINT`      |
| `my-stack-dev` | `bucket.name` | `CDK_MY_STACK_DEV_BUCKET_NAME` |
| `Stack123`     | `URL-Address` | `CDK_STACK123_URL_ADDRESS`     |

## セキュリティ機能

### シェルインジェクション対策

- すべての値はシングルクォートで囲まれる
- 値に含まれるシングルクォートは `'\''` にエスケープされる
- この方式により、値に特殊文字が含まれても安全に処理される

### 例

```javascript
// 入力値に特殊文字が含まれる場合
{
  "Stack": {
    "Message": "It's a test! $(whoami)"
  }
}

// 出力(安全にエスケープ済み)
export CDK_STACK_MESSAGE='It'\''s a test! $(whoami)'
```

## ログ出力仕様

### 標準出力(stdout)

- **正常終了時**: 何も出力しない(silent)
- **エラー時のみ**: エラーメッセージを出力

### ログレベル

現バージョンでは詳細ログ機能は実装せず、エラー時のみ出力します。

```bash
# 正常終了の例
$ cdk2env var/outputs.json var/outputs.sh
$ echo $?
0
# ← 何も出力されない

# エラー時の例
$ cdk2env missing.json
Error: Input JSON not found: missing.json
$ echo $?
1
```

## エラーハンドリング

### 終了コード

- `0`: 正常終了
- `1`: エラー発生（ファイルが見つからない、JSON 解析エラー等）

### エラーメッセージ

```bash
# 入力ファイルが存在しない
Input JSON not found: /path/to/outputs.json

# ファイル読み込みエラー
Failed to read input: permission denied

# 無効なJSON
Invalid JSON: Unexpected token } in JSON at position 123

# JSONのルート構造が不正
Unexpected JSON root structure (expected object).

# ファイル書き込みエラー
Failed to write output: permission denied
```

## パッケージ構成

```
@heiwa4126/cdk2env/
├── package.json
├── README.md
├── LICENSE
├── biome.jsonc              # Biome設定(linting/formatting)
├── tsconfig.json            # TypeScript設定
├── tsup.config.ts           # tsupビルド設定
├── vite.config.ts           # Vitestテスト設定
├── src/
│   ├── main.ts              # CLIエントリーポイント(ESM)
│   ├── index.ts             # ライブラリAPI (exportされる主要関数)
│   └── utils.ts             # ユーティリティ関数
├── test/
│   ├── index.test.ts        # テストファイル
│   └── fixtures/
│       ├── sample1.json     # テスト用JSONファイル
│       └── expected1.sh     # 期待される出力
├── dist/                    # ビルド出力(tsupで生成)
│   ├── main.js              # CLI (ESM)
│   ├── index.js             # ライブラリ (ESM)
│   ├── index.cjs            # ライブラリ (CommonJS)
│   ├── index.d.ts           # 型定義
│   └── utils.*              # ユーティリティ(各形式)
└── examples/
    ├── ex-esm.mjs           # ESM使用例
    ├── ex-cjs.cjs           # CommonJS使用例
    └── ex-ts.ts             # TypeScript使用例
```

## package.json の主要設定

```json
{
  "name": "@heiwa4126/cdk2env",
  "version": "1.0.0",
  "description": "Convert AWS CDK outputs.json to shell-sourceable export file",
  "type": "module",
  "bin": {
    "cdk2env": "./dist/main.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist/", "README.md", "LICENSE"],
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["aws-cdk", "cdk", "outputs", "shell", "bash", "export", "environment-variables", "cli"],
  "repository": {
    "type": "git",
    "url": "https://github.com/heiwa4126/cdk2env.git"
  },
  "bugs": {
    "url": "https://github.com/heiwa4126/cdk2env/issues"
  },
  "homepage": "https://github.com/heiwa4126/cdk2env#readme",
  "author": "heiwa4126",
  "license": "MIT",
  "scripts": {
    "build": "tsup",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome lint .",
    "format": "biome format --write .",
    "prepublishOnly": "npm run build && npm test"
  },
  "devDependencies": {
    "@biomejs/biome": "latest",
    "@types/node": "^20.0.0",
    "tsup": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

### tsup.config.ts ビルド設定

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    main: "src/main.ts", // CLI
    index: "src/index.ts", // Library API
  },
  format: ["esm", "cjs"], // ESM + CommonJS
  dts: true, // 型定義生成
  clean: true, // ビルド前にdist/をクリア
  sourcemap: true,
  splitting: false,
  treeshake: true,
  outDir: "dist",
});
```

### TypeScript 設定のポイント

```json
{
  "compilerOptions": {
    "module": "nodenext", // 最新のNode.jsモジュール解決
    "moduleResolution": "nodenext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true, // JSONファイルをimport可能に
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

## プログラマティック利用

### API として使用する場合

#### ESM (type: "module")

```javascript
import { convertOutputsToShell } from "@heiwa4126/cdk2env";

// 基本的な使用例
await convertOutputsToShell({
  inputPath: "var/outputs.json",
  outputPath: "var/outputs.sh",
});

// カスタムプレフィックス
await convertOutputsToShell({
  inputPath: "custom/path.json",
  outputPath: "custom/output.sh",
  prefix: "APP_", // デフォルト: 'CDK_'
});
```

**注意**: ライブラリ API はエラー時に例外を throw します。CLI とは異なり、進捗ログは出力しません。

#### CommonJS

```javascript
const { convertOutputsToShell } = require("@heiwa4126/cdk2env");

// 使用例
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
  prefix: "CDK_",
};

try {
  await convertOutputsToShell(options);
  console.log("Conversion successful");
} catch (error) {
  console.error("Conversion failed:", error.message);
  process.exit(1);
}
```

### 型定義

```typescript
export interface ConvertOptions {
  /** 入力JSONファイルのパス */
  inputPath: string;
  /** 出力シェルファイルのパス */
  outputPath: string;
  /** 環境変数のプレフィックス (デフォルト: 'CDK_') */
  prefix?: string;
}

/**
 * CDK outputs.json をシェルスクリプト形式に変換
 * @throws {Error} ファイルの読み書きやJSON解析でエラーが発生した場合
 */
export function convertOutputsToShell(options: ConvertOptions): Promise<void>;
```

## テスト要件

### テストケース

1. **正常系**

   - 標準的な CDK outputs の変換
   - 複数スタックの処理
   - 空のスタック出力

2. **特殊文字処理**

   - シングルクォートを含む値
   - ダブルクォートを含む値
   - シェル特殊文字 (`$`, `` ` ``, `\`, など)
   - 改行文字

3. **エラー系**

   - 存在しないファイル
   - 無効な JSON
   - 不正な JSON 構造
   - ファイル書き込み権限エラー

4. **変数名生成**
   - 特殊文字を含むスタック名
   - 特殊文字を含む出力キー
   - 数字で始まる名前

### テストフレームワーク

- **Vitest**: 高速な TypeScript テストフレームワーク
  - グローバル API 有効化 (`globals: true`)
  - TypeScript ネイティブサポート
  - `vite.config.ts`で設定

## 依存関係

### 実行時依存関係

なし（Node.js 標準ライブラリのみ使用）

### 開発時依存関係

```json
{
  "devDependencies": {
    "@biomejs/biome": "latest",
    "@types/node": "^20.0.0",
    "tsup": "latest",
    "typescript": "latest",
    "vitest": "latest"
  }
}
```

### ビルドツールチェーン

- **TypeScript**: 型安全なコード記述
- **tsup**: 高速な TypeScript バンドラー(ESM/CJS 両対応)
- **Biome**: 統合 Linter/Formatter(ESLint + Prettier 代替)
- **Vitest**: 高速テストフレームワーク

## CI/CD

### GitHub Actions ワークフロー

プロジェクトは **npm Trusted Publishing** を使用して npmjs に公開します。

#### テストワークフロー (`.github/workflows/test.yml`)

```yaml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run lint
```

#### 公開ワークフロー (`.github/workflows/publish.yml`)

```yaml
name: Publish to npm

on:
  push:
    tags:
      - "v*.*.*" # 通常リリース: v1.2.3
      - "v*.*.*-*" # プレリリース: v1.2.3-rc.1

permissions:
  contents: read
  id-token: write # OIDC認証に必要

jobs:
  publish:
    if: github.repository_owner == github.actor
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: npm run build
      - run: npm test

      # プレリリースの場合は --tag dev を追加
      - name: Publish to npm
        run: |
          if [[ "${{ github.ref_name }}" == *"-"* ]]; then
            npm publish --provenance --access public --tag dev
          else
            npm publish --provenance --access public
          fi
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### 公開方法

```bash
# 通常リリース (latest tag)
git tag v1.0.0
git push origin v1.0.0

# プレリリース (dev tag)
git tag v1.0.0-rc.1
git push origin v1.0.0-rc.1
```

## ユースケース

### 1. CI/CD パイプライン

```bash
#!/bin/bash
# deploy.sh

# CDKデプロイして出力を取得
cdk deploy --outputs-file outputs.json

# シェル変数に変換
cdk-outputs-to-shell outputs.json env.sh

# 環境変数を読み込んでテストを実行
source env.sh
echo "Testing API: $CDK_MYSTACK_APIENDPOINT"
curl "$CDK_MYSTACK_APIENDPOINT/health"
```

### 2. ローカル開発環境

```bash
# CDKスタックをデプロイ
pnpm cdk deploy --outputs-file var/outputs.json

# 環境変数ファイルを生成
pnpm cdk:outputs

# アプリケーション起動時に環境変数を読み込む
source var/outputs.sh
npm run dev
```

### 3. Docker 環境

```dockerfile
# Dockerfile
FROM node:20

# CDK出力から環境変数ファイルを生成
COPY var/outputs.sh /app/.env.sh

# エントリーポイントで環境変数を読み込む
RUN echo "source /app/.env.sh" >> /root/.bashrc

CMD ["node", "server.js"]
```

## 将来の拡張案

### v1.x で実装予定

- [x] TypeScript 型定義ファイルの提供 (tsup で自動生成)
- [x] ESM/CommonJS 両対応
- [ ] 詳細なロギングオプション (`--verbose`, `--quiet`)
- [ ] プレフィックスのカスタマイズオプション (`--prefix APP_`)
- [ ] JSON 以外の出力形式サポート (`.env`形式、YAML 形式)

### v2.x で検討中

- [ ] フィルタリング機能（特定のスタックのみ出力）
- [ ] テンプレート機能（カスタムフォーマット）
- [ ] Windows PowerShell 形式の出力サポート
- [ ] 環境変数名のマッピング設定ファイル

## サポート・貢献

### バグレポート

GitHub の Issues で報告してください。以下の情報を含めてください：

- Node.js バージョン
- オペレーティングシステム
- 入力 JSON の例（機密情報を除く）
- エラーメッセージ

### プルリクエスト

1. フォークしてブランチを作成
2. テストを追加
3. すべてのテストが通ることを確認
4. プルリクエストを作成

## ライセンス

MIT License - 自由に使用、修正、配布可能
