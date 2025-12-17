# Fix Git Tag Error: desktop.ini

## Problem
Git error: `fatal: git show-ref: bad ref refs/tags/desktop.ini`

This means a Git tag named "desktop.ini" was accidentally created and is causing issues.

## Solution

### Option 1: Using GitHub Desktop

1. Open **GitHub Desktop**
2. Go to **Repository → Open in Command Prompt** (or Terminal)
3. Run these commands:

```bash
# Delete the bad tag locally
git tag -d desktop.ini

# If the tag exists on remote, delete it there too
git push origin :refs/tags/desktop.ini

# Clean up any remaining references
git gc --prune=now
```

### Option 2: Using Git Bash or Terminal

If you have Git installed and in your PATH:

```bash
cd D:\Github\GPUalpha

# Delete the tag
git tag -d desktop.ini

# If pushed to remote, delete from remote
git push origin :refs/tags/desktop.ini

# Clean up repository
git gc --prune=now
```

### Option 3: Manual File Removal (Already Done)

I've already removed the tag file from `.git/refs/tags/desktop.ini`, but you may need to:

1. **Refresh GitHub Desktop** - Close and reopen it
2. **Pull latest changes** - In case the tag exists on remote
3. **If error persists**, run the commands above in a terminal

## Prevention

The `.gitignore` file I created will prevent `desktop.ini` files from being tracked, but it won't prevent tag creation. To avoid this in the future:

- Don't create tags with system file names
- Use descriptive tag names like `v1.0.0` or `release-2024-01-15`

## Verify Fix

After running the commands, verify the tag is gone:

```bash
git tag -l | grep desktop.ini
```

Should return nothing if fixed.

