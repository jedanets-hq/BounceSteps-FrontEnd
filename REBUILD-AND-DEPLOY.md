# 🚀 REBUILD NA DEPLOY - Mabadiliko Mapya

## ⚠️ TATIZO:
Mabadiliko yako hayaonekani baada ya deployment kwa sababu:
1. `dist/` folder ina OLD BUILD (code ya zamani)
2. Browser cache inabeba old files
3. Unahitaji ku-BUILD tena

## ✅ SULUHISHO - Fanya Hivi Kwa Mpangilio:

### Step 1: Futa Old Build
```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force dist

# Linux/Mac
rm -rf dist
```

### Step 2: Build Fresh Code
```bash
npm run build
```

### Step 3: Clear Browser Cache
**Kwenye Browser:**
1. Press `Ctrl + Shift + Delete` (Windows) au `Cmd + Shift + Delete` (Mac)
2. Chagua "Cached images and files"
3. Click "Clear data"

**AU** Hard Refresh:
- `Ctrl + F5` (Windows)
- `Cmd + Shift + R` (Mac)

### Step 4: Deploy
```bash
# Kama unatumia Netlify
netlify deploy --prod

# Kama unatumia Vercel
vercel --prod

# Kama unatumia manual deployment
# Copy dist/ folder to your server
```

## 🔥 QUICK FIX - One Command:

```bash
# Windows PowerShell
Remove-Item -Recurse -Force dist; npm run build

# Linux/Mac/Git Bash
rm -rf dist && npm run build
```

## 📝 NOTES:

1. **Kila mara unabadilisha code kwenye `src/`**, lazima:
   - Futa `dist/` folder
   - Run `npm run build` tena
   - Deploy fresh build

2. **Development mode** (`npm run dev`):
   - Inaonyesha mabadiliko moja kwa moja
   - Haitumii `dist/` folder
   - Inatumia hot reload

3. **Production mode** (deployment):
   - Inatumia `dist/` folder
   - Lazima u-build kila mara unabadilisha code

## ✅ VERIFY MABADILIKO:

Baada ya ku-build, angalia `dist/` folder:
```bash
# Check if dist has new files
ls -la dist/assets/

# Check file timestamps (should be recent)
```

## 🎯 NEXT TIME:

Kabla ya deployment, DAIMA:
1. `rm -rf dist` - Futa old build
2. `npm run build` - Build fresh
3. Test locally: `npm run preview`
4. Deploy

---

**Kumbuka:** Mabadiliko kwenye `src/` hayaonekani production mpaka u-BUILD tena!
