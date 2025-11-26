# cdk-outputs-to-shell パッケージ仕様書

## 概要

AWS CDK の`cdk deploy`コマンドで生成される`outputs.json`ファイルを、シェルスクリプトで読み込み可能な環境変数エクスポートファイル(`.sh`)に変換する CLI ツール。

## パッケージ情報

- **パッケージ名**: `cdk-outputs-to-shell`
- **バージョン**: `1.0.0`
- **説明**: Convert AWS CDK outputs.json to shell-sourceable export file
- **ライセンス**: MIT
- **Node.js バージョン**: `>=18.0.0`
- **タイプ**: ESM (ES Modules)

## インストール方法

### グローバルインストール

```bash
npm install -g cdk-outputs-to-shell
# または
pnpm add -g cdk-outputs-to-shell
```

### プロジェクトローカルインストール

```bash
npm install --save-dev cdk-outputs-to-shell
# または
pnpm add -D cdk-outputs-to-shell
```

## 使用方法

### コマンドライン

```bash
# デフォルト設定で実行 (var/outputs.json → var/outputs.sh)
cdk-outputs-to-shell

# 入力ファイルのみ指定
cdk-outputs-to-shell path/to/outputs.json

# 入力と出力を両方指定
cdk-outputs-to-shell path/to/outputs.json path/to/exports.sh
```

### package.json スクリプト

```json
{
  "scripts": {
    "cdk:outputs": "cdk-outputs-to-shell",
    "cdk:outputs:custom": "cdk-outputs-to-shell cdk.out/outputs.json env.sh"
  }
}
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

// 出力（安全にエスケープ済み）
export CDK_STACK_MESSAGE='It'\''s a test! $(whoami)'
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
cdk-outputs-to-shell/
├── package.json
├── README.md
├── LICENSE
├── .gitignore
├── .npmignore
├── bin/
│   └── cli.mjs              # CLIエントリーポイント
├── src/
│   ├── index.mjs            # メイン処理
│   └── utils.mjs            # ユーティリティ関数
└── test/
    ├── index.test.mjs       # テストファイル
    └── fixtures/
        ├── sample1.json     # テスト用JSONファイル
        └── expected1.sh     # 期待される出力
```

## package.json の主要設定

```json
{
  "name": "cdk-outputs-to-shell",
  "version": "1.0.0",
  "description": "Convert AWS CDK outputs.json to shell-sourceable export file",
  "type": "module",
  "bin": {
    "cdk-outputs-to-shell": "./bin/cli.mjs"
  },
  "exports": {
    ".": "./src/index.mjs"
  },
  "files": ["bin/", "src/", "README.md", "LICENSE"],
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": ["aws-cdk", "cdk", "outputs", "shell", "bash", "export", "environment-variables", "cli"],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/cdk-outputs-to-shell.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/cdk-outputs-to-shell/issues"
  },
  "homepage": "https://github.com/yourusername/cdk-outputs-to-shell#readme",
  "author": "Your Name",
  "license": "MIT"
}
```

## プログラマティック利用

### API として使用する場合

```javascript
import { convertOutputsToShell } from "cdk-outputs-to-shell";

// 使用例
await convertOutputsToShell({
  inputPath: "var/outputs.json",
  outputPath: "var/outputs.sh",
});

// カスタムオプション
await convertOutputsToShell({
  inputPath: "custom/path.json",
  outputPath: "custom/output.sh",
  prefix: "APP_", // デフォルト: 'CDK_'
  onProgress: (message) => console.log(message),
});
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

- Node.js 標準の`node:test`モジュールを使用
- または、Vitest、Jest 等のテストフレームワーク

## 依存関係

### 実行時依存関係

なし（Node.js 標準ライブラリのみ使用）

### 開発時依存関係

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0"
  }
}
```

## CI/CD

### GitHub Actions ワークフロー例

```yaml
name: Test and Publish

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
      - run: npm test

  publish:
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: "https://registry.npmjs.org"
      - run: npm ci
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
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

- [ ] TypeScript 型定義ファイルの提供
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
