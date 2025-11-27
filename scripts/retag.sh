#!/usr/bin/env bash
#
# 最新のGitタグを削除して、現在のHEADに同じタグを再作成・プッシュします。
# ワークフローのバグ修正時にバージョン番号を上げずに再実行するために使用します。
#
# 使用方法:
#   1. ワークフローを修正してコミット:
#      git add .github/workflows/publish.yml
#      git commit -m "fix: workflow修正"
#   2. このスクリプトを実行:
#      npm run retag

set -euo pipefail

# 最新タグを取得
LATEST_TAG=$(git describe --tags --abbrev=0)

echo "最新タグ: $LATEST_TAG"
read -p "このタグを付け直しますか? [y/N]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "キャンセルしました"
    exit 1
fi

# タグの削除
echo "タグを削除中..."
git tag -d "$LATEST_TAG"
git push origin ":refs/tags/$LATEST_TAG"

echo "変更をコミットしてから、同じタグを再作成します"
echo "準備ができたら Enter を押してください..."
read -r

# タグの再作成とプッシュ
git tag "$LATEST_TAG"
git push origin "$LATEST_TAG"

echo "✓ タグ $LATEST_TAG を再作成しました"
