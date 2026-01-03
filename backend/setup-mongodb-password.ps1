# ═══════════════════════════════════════════════════════════════════════════
# 🚀 ISAFARI GLOBAL - MONGODB PASSWORD SETUP (PowerShell)
# ═══════════════════════════════════════════════════════════════════════════
# This script helps you quickly set the MongoDB password
# ═══════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔐 iSAFARI GLOBAL - MONGODB PASSWORD SETUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path "backend\.env")) {
    Write-Host "❌ ERROR: backend\.env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Please make sure you are running this script from the isafari_global root directory" -ForegroundColor Yellow
    pause
    exit 1
}

# Prompt for password
Write-Host "📝 Enter your MongoDB password:" -ForegroundColor Yellow
Write-Host "   (This is the password for user: mfungojoctan01_db_user)" -ForegroundColor Gray
Write-Host ""
$SecurePassword = Read-Host "Password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
Write-Host ""

# URL encode the password
Add-Type -AssemblyName System.Web
$ENCODED_PASSWORD = [System.Web.HttpUtility]::UrlEncode($DB_PASSWORD)

Write-Host "🔄 Updating backend\.env file..." -ForegroundColor Yellow

# Create backup
Copy-Item "backend\.env" "backend\.env.backup" -Force
Write-Host "✅ Backup created: backend\.env.backup" -ForegroundColor Green

# Read .env file
$envContent = Get-Content "backend\.env" -Raw

# Replace password
$envContent = $envContent -replace '<db_password>', $ENCODED_PASSWORD

# Write back to file
Set-Content "backend\.env" -Value $envContent -NoNewline

Write-Host "✅ Password updated in backend\.env" -ForegroundColor Green
Write-Host ""

# Test connection
Write-Host "🧪 Testing MongoDB connection..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend
$testResult = node test-new-mongodb-connection.js
$exitCode = $LASTEXITCODE
Set-Location ..

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ SUCCESS! MongoDB connection is working!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 You can now start the iSafari system:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Option 1: Start everything together" -ForegroundColor White
    Write-Host "   .\start-with-new-mongodb.bat" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Option 2: Start separately" -ForegroundColor White
    Write-Host "   Terminal 1: cd backend; npm start" -ForegroundColor Yellow
    Write-Host "   Terminal 2: npm run dev" -ForegroundColor Yellow
    Write-Host "   Terminal 3: cd admin-portal; npm run dev" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ MongoDB connection test failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Please check:" -ForegroundColor Yellow
    Write-Host "1. Password is correct" -ForegroundColor White
    Write-Host "2. IP is whitelisted in MongoDB Atlas" -ForegroundColor White
    Write-Host "3. MongoDB cluster is accessible" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 You can restore the backup with:" -ForegroundColor Cyan
    Write-Host "   Copy-Item backend\.env.backup backend\.env -Force" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
pause
