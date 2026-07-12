#!/bin/bash
set -e

WIN_DIR="/mnt/c/mostafafiles/vscodefilesmostafa/DrawAndGuess"
WSL_DIR="$HOME/projects/DrawAndGuess"
BUILD_WORKDIR="$HOME/eas-build-workdir"

echo "== Commit & Push من النسخة الأصلية =="
cd "$WIN_DIR"
git add .
read -p "Commit message: " msg
git commit -m "$msg" || echo "Nothing to commit"
git push

echo "== مزامنة أحدث كود لنسخة WSL =="
mkdir -p "$WSL_DIR"
rsync -a --delete --exclude='.git' --exclude='node_modules' "$WIN_DIR"/ "$WSL_DIR"/

echo "== Building (with persistent workdir for caching)... =="
cd "$WSL_DIR"
mkdir -p "$BUILD_WORKDIR"
export TMPDIR="$HOME/tmp-builds"
export EAS_LOCAL_BUILD_SKIP_CLEANUP=1
export EAS_LOCAL_BUILD_WORKINGDIR="$BUILD_WORKDIR"

eas build --platform android --profile production --local

AAB=$(ls -t "$WSL_DIR"/*.aab "$BUILD_WORKDIR"/**/*.aab 2>/dev/null | head -n 1)
echo "Uploading $AAB"

eas submit --platform android --profile production --path "$AAB"

echo "Done ✅"