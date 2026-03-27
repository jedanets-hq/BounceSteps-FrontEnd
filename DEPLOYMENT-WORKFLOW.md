# 🚀 BounceSteps Deployment Workflow

## ✅ Tatizo Limetatuliwa

**Tatizo**: Changes hazikuonekana kwenye production (Vercel)  
**Sababu**: Local branch ilikuwa tofauti na GitHub main branch  
**Suluhisho**: Tumesync local na GitHub, tumepush sitemap update

---

## 📋 Workflow Sahihi ya Kufuata Kila Wakati

### 1. Kabla ya Kuanza Kufanya Changes

```bash
# Pull latest changes kutoka GitHub
git pull origin main

# Angalia status
git status
```

### 2. Fanya Changes Zako

```bash
# Edit files zako
# Test locally: npm run dev
```

### 3. Commit Changes

```bash
# Add files
git add .

# Commit na message clear
git commit -m "Description ya changes zako"
```

### 4. Push kwa GitHub

```bash
# Push kwa GitHub
git push origin main

# Kama authentication inashindwa:
gh auth refresh -s repo,workflow
git push origin main
```

### 5. Verify Deployment

```bash
# Run script ya kucheck
./check-vercel-deployment.sh

# Au fungua Vercel dashboard
# https://vercel.com/jedanets-hq
```

---

## 🔧 Kama Unapata Tatizo la Authentication

### Option 1: GitHub CLI (Recommended)

```bash
gh auth refresh -s repo,workflow
git push origin main
```

### Option 2: Personal Access Token

1. Fungua: https://github.com/settings/tokens/new
2. Tengeneza token na scopes:
   - ✅ repo (full control)
   - ✅ workflow
3. Copy token
4. Set remote URL:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/jedanets-hq/BounceSteps-FrontEnd
   ```
5. Push:
   ```bash
   git push origin main
   ```

---

## 🎯 Kuhakikisha Vercel Inadeploy Vizuri

### Check 1: GitHub Commit Iko

```bash
git log origin/main --oneline -5
```

### Check 2: Vercel Dashboard

Fungua: https://vercel.com/jedanets-hq

Angalia:
- ✅ Deployment imeanza
- ✅ Build inafanikiwa
- ✅ Deployment iko "Ready"

### Check 3: Production Site

Fungua: https://www.bouncesteps.com

Angalia kama changes zinaonekana

---

## 🚨 Kama Vercel Haideploy

### Tatizo 1: Vercel Haioni Commit Mpya

**Suluhisho**:
```bash
# Force trigger deployment
git commit --allow-empty -m "Force Vercel rebuild"
git push origin main
```

### Tatizo 2: Build Inafail

**Suluhisho**:
1. Angalia build logs kwenye Vercel dashboard
2. Fix errors locally
3. Test: `npm run build`
4. Push fix

### Tatizo 3: Cache Issues

**Suluhisho**:
1. Kwenye Vercel dashboard
2. Settings → General
3. Scroll down → "Clear Cache"
4. Redeploy

---

## 📝 Best Practices

### ✅ DO

- Pull latest changes kabla ya kufanya edits
- Test locally kabla ya kupush (`npm run dev`)
- Write clear commit messages
- Push mara kwa mara (don't accumulate changes)
- Check Vercel dashboard baada ya kupush

### ❌ DON'T

- Don't edit files bila kupull first
- Don't force push (`git push -f`) unless absolutely necessary
- Don't commit directly to main bila testing
- Don't ignore build errors

---

## 🔍 Useful Commands

```bash
# Check current branch
git branch

# Check status
git status

# View recent commits
git log --oneline -10

# View remote commits
git log origin/main --oneline -10

# Check if local is behind remote
git fetch origin
git status

# Discard local changes (CAREFUL!)
git reset --hard origin/main

# View differences
git diff origin/main
```

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Pull latest | `git pull origin main` |
| Add files | `git add .` |
| Commit | `git commit -m "message"` |
| Push | `git push origin main` |
| Check status | `git status` |
| View commits | `git log --oneline -5` |
| Force deploy | `git commit --allow-empty -m "Force rebuild" && git push` |

---

## ✅ Current Status

- ✅ Local branch synced na GitHub
- ✅ Sitemap updated na pages zote muhimu
- ✅ Authentication fixed (gh CLI)
- ✅ Latest commit pushed: `83d3ee6`
- ⏳ Vercel deployment inaendelea...

**Next**: Angalia https://www.bouncesteps.com/sitemap.xml baada ya dakika 2-5
