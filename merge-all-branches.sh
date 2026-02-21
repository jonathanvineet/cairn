#!/bin/bash

echo "=== Starting merge of all branches to main ==="
echo ""

# Ensure we're on main
git checkout main

# Fetch all branches
echo "Fetching all remote branches..."
git fetch --all
echo ""

# List of branches to merge
branches=(
  "origin/copilot/vscode-mlv6btag-3tok"
  "origin/copilot/add-boundary-zones-page"
  "origin/copilot/build-boundary-truth-platform"
  "origin/copilot/build-skeletal-landing-page"
  "origin/copilot/delegate-to-cloud-agent"
  "origin/copilot/merge-everything-to-main"
)

# Merge each branch
for branch in "${branches[@]}"; do
  echo "=== Merging $branch ==="
  git merge "$branch" --no-edit
  if [ $? -ne 0 ]; then
    echo "ERROR: Merge conflict in $branch"
    echo "Please resolve conflicts and run 'git merge --continue'"
    exit 1
  fi
  echo "✓ Successfully merged $branch"
  echo ""
done

echo "=== All branches merged successfully! ==="
echo ""
echo "=== Pushing to origin/main ==="
git push origin main

echo "=== Done! ==="
