# 🤖 AI Agent Deployment Rules

## ⚠️ CRITICAL - READ BEFORE ANY GIT OPERATIONS

This file contains **MANDATORY** rules for AI agents working on BounceSteps Frontend.

---

## 🚨 ABSOLUTE RULES (NEVER BREAK THESE)

### Rule 1: ALWAYS Push to `main` Branch ONLY

```bash
# ✅ CORRECT
git push origin main

# ❌ WRONG - NEVER DO THIS
git push origin master
git push origin develop
git push origin feature-xyz
git push origin HEAD
```

**Why**: Vercel is configured to deploy ONLY from `main` branch. Pushing to any other branch will NOT deploy to production.

### Rule 2: ALWAYS Pull Before Making Changes

```bash
# ✅ CORRECT - Do this FIRST
git pull origin main

# Then make your changes
```

**Why**: Prevents branch divergence and merge conflicts.

### Rule 3: ALWAYS Verify Current Branch

```bash
# Check current branch
git branch

# If not on main, switch to it
git checkout main
```

**Why**: Ensures you're working on the correct branch.

### Rule 4: NEVER Force Push

```bash
# ❌ NEVER DO THIS
git push -f
git push --force
git push --force-with-lease
```

**Why**: Can destroy production history and cause deployment issues.

### Rule 5: ALWAYS Verify Repository

```bash
# Check you're in the right repo
git remote -v

# Should show:
# origin  https://github.com/jedanets-hq/BounceSteps-FrontEnd
```

**Why**: Prevents pushing to wrong repository.

---

## 📋 MANDATORY WORKFLOW

### Step 1: Verify Environment

```bash
# Check current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo "ERROR: Not on main branch!"
    git checkout main
fi

# Check repository
REPO=$(git config --get remote.origin.url)
if [[ ! "$REPO" =~ "BounceSteps-FrontEnd" ]]; then
    echo "ERROR: Wrong repository!"
    exit 1
fi
```

### Step 2: Pull Latest

```bash
git pull origin main
```

### Step 3: Make Changes

```bash
# Edit files
# Test locally if possible
```

### Step 4: Commit

```bash
git add .
git commit -m "Clear description of changes"
```

### Step 5: Push

```bash
# ONLY push to main
git push origin main
```

### Step 6: Verify

```bash
# Check that push succeeded
git log origin/main --oneline -1

# Should show your latest commit
```

---

## 🛡️ SAFETY CHECKS

Before ANY push operation, verify:

1. ✅ Current branch is `main`
2. ✅ Repository is `BounceSteps-FrontEnd`
3. ✅ Local is up-to-date with remote (`git pull` done)
4. ✅ Pushing to `origin main` (not any other branch)
5. ✅ No force push flags used

---

## 🚫 COMMON MISTAKES TO AVOID

### Mistake 1: Pushing to Wrong Branch

```bash
# ❌ WRONG
git push origin master  # Wrong branch name
git push origin HEAD    # Ambiguous

# ✅ CORRECT
git push origin main    # Explicit and correct
```

### Mistake 2: Not Pulling First

```bash
# ❌ WRONG
git commit -m "changes"
git push origin main  # Will fail if remote has new commits

# ✅ CORRECT
git pull origin main
git commit -m "changes"
git push origin main
```

### Mistake 3: Working on Wrong Branch

```bash
# ❌ WRONG
git checkout -b feature-xyz
# ... make changes ...
git push origin feature-xyz  # Won't deploy!

# ✅ CORRECT
git checkout main
git pull origin main
# ... make changes ...
git push origin main  # Will deploy!
```

### Mistake 4: Assuming Branch Names

```bash
# ❌ WRONG - Assuming default branch
git push  # Might push to wrong branch

# ✅ CORRECT - Always explicit
git push origin main
```

---

## 🔧 TROUBLESHOOTING

### Problem: "Authentication failed"

**Solution**:
```bash
gh auth refresh -s repo,workflow
git push origin main
```

### Problem: "Branch is behind remote"

**Solution**:
```bash
git pull origin main
# Resolve any conflicts
git push origin main
```

### Problem: "Refusing to merge unrelated histories"

**Solution**:
```bash
# This is SERIOUS - contact human immediately
# DO NOT use --allow-unrelated-histories without approval
```

### Problem: "Changes not showing on production"

**Check**:
1. Did you push to `main` branch? (not master, not other)
2. Did push succeed? Check `git log origin/main`
3. Is Vercel connected to `main` branch?
4. Check Vercel dashboard for deployment status

---

## 📊 VERIFICATION COMMANDS

After every push, run these to verify:

```bash
# 1. Check latest commit on remote
git log origin/main --oneline -1

# 2. Check local matches remote
git log --oneline -1

# 3. Verify branch
git branch

# 4. Check repository
git remote -v
```

All should show:
- ✅ Same commit hash
- ✅ Branch: main
- ✅ Repo: BounceSteps-FrontEnd

---

## 🎯 QUICK REFERENCE

| Action | Command |
|--------|---------|
| Check branch | `git branch` |
| Switch to main | `git checkout main` |
| Pull latest | `git pull origin main` |
| Check status | `git status` |
| Add files | `git add .` |
| Commit | `git commit -m "message"` |
| **PUSH (ONLY WAY)** | `git push origin main` |
| Verify push | `git log origin/main --oneline -1` |

---

## ⚡ USE THE SAFE SCRIPT

Instead of manual commands, use:

```bash
./deploy.sh
```

This script:
- ✅ Automatically pulls latest
- ✅ Commits your changes
- ✅ Pushes to correct branch (main)
- ✅ Verifies everything
- ✅ Shows deployment status

---

## 🔒 PROTECTED OPERATIONS

These operations require HUMAN approval:

- ❌ Force push (`git push -f`)
- ❌ Deleting branches
- ❌ Rewriting history (`git rebase`, `git reset --hard` on pushed commits)
- ❌ Changing remote URL
- ❌ Merging unrelated histories

**If you need to do any of these, STOP and ask the human first.**

---

## ✅ SUMMARY FOR AI AGENTS

**Before EVERY git operation:**

1. Read this file
2. Verify you're on `main` branch
3. Verify repository is `BounceSteps-FrontEnd`
4. Pull latest: `git pull origin main`
5. Make changes
6. Push ONLY to main: `git push origin main`
7. Verify push succeeded

**NEVER:**
- Push to branches other than `main`
- Force push
- Skip pulling before changes
- Assume branch names

**ALWAYS:**
- Be explicit: `git push origin main`
- Verify before and after
- Use the safety scripts when available

---

## 📞 EMERGENCY CONTACT

If something goes wrong:
1. STOP immediately
2. Do NOT force push
3. Do NOT delete anything
4. Show the human what happened
5. Wait for instructions

---

**Last Updated**: 2026-03-27  
**Repository**: BounceSteps-FrontEnd  
**Production Branch**: `main`  
**Deployment**: Vercel (auto-deploys from `main`)
