#!/bin/bash

set -e  # Exit on error

echo "=== Auto-resolving conflicts and merging all branches ==="

# Function to auto-resolve conflicts by accepting incoming changes
auto_resolve() {
  # Get list of conflicted files
  conflicted_files=$(git diff --name-only --diff-filter=U)
  
  if [ -z "$conflicted_files" ]; then
    return 0
  fi
  
  echo "Auto-resolving conflicts in:"
  echo "$conflicted_files"
  
  # For each conflicted file, accept incoming (theirs)
  echo "$conflicted_files" | while read -r file; do
    if [ -f "$file" ]; then
      git checkout --theirs "$file"
      git add "$file"
    fi
  done
  
  return 0
}

# List of branches to merge
branches=(
  "origin/copilot/add-boundary-zones-page"
  "origin/copilot/build-boundary-truth-platform"
  "origin/copilot/build-skeletal-landing-page"
  "origin/copilot/delegate-to-cloud-agent"
  "origin/copilot/merge-all-branches"
  "origin/copilot/merge-everything-to-main"
)

# Merge each branch
for branch in "${branches[@]}"; do
  echo ""
  echo "=== Merging $branch ==="
  
  git merge "$branch" --no-edit || true
  
  # Auto-resolve any conflicts
  auto_resolve
  
  # Check if we still have conflicts
  if git diff --name-only --diff-filter=U | grep -q .; then
    echo "ERROR: Still have unresolved conflicts in $branch"
    git status
    exit 1
  fi
  
  # If merge in progress, commit it
  if [ -f .git/MERGE_HEAD ]; then
    git commit --no-edit -m "Merge $branch with auto-resolved conflicts"
  fi
  
  echo "✓ Successfully merged $branch"
done

# Push to origin
echo ""
echo "=== Pushing to origin/main ==="
git push origin main

echo ""
echo "=== All branches merged successfully! ==="
