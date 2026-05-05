# ===============================================
# 🔨 MICRO TRAINER - EXTENSION BUILD SCRIPT (Windows)
# ===============================================

Write-Host "🧠 Building Micro Trainer Extension..." -ForegroundColor Cyan

# Step 1: Build React frontend
Write-Host "`n📦 Step 1: Building React frontend..." -ForegroundColor Yellow
Set-Location ..\microtrainer-frontend
npm install
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Step 2: Copy to extension
Write-Host "`n📋 Step 2: Copying build to extension..." -ForegroundColor Yellow
Set-Location ..\microtrainer-extension

if (Test-Path "dist") {
    Remove-Item -Recurse -Force dist
}

New-Item -ItemType Directory -Path dist -Force | Out-Null
Copy-Item -Recurse -Force ..\microtrainer-frontend\dist\* .\dist\

Write-Host "✅ Files copied" -ForegroundColor Green

# Step 3: Create icons folder
Write-Host "`n🎨 Step 3: Setting up icons..." -ForegroundColor Yellow
if (-not (Test-Path "icons")) {
    New-Item -ItemType Directory -Path icons -Force | Out-Null
}

if (-not (Test-Path "icons\icon16.png")) {
    Write-Host "⚠️  Warning: icons\icon16.png not found" -ForegroundColor Yellow
    Write-Host "   Please add icon files before publishing" -ForegroundColor Yellow
}

# Step 4: Validate manifest
Write-Host "`n🔍 Step 4: Validating manifest.json..." -ForegroundColor Yellow
if (Test-Path "manifest.json") {
    Write-Host "✅ manifest.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ manifest.json not found" -ForegroundColor Red
    exit 1
}

# Step 5: Create production ZIP
Write-Host "`n📦 Step 5: Creating production ZIP..." -ForegroundColor Yellow

$excludeFiles = @(
    ".git*",
    "node_modules",
    ".DS_Store",
    "build.sh",
    "build.ps1",
    "README.md"
)

$files = Get-ChildItem -Recurse | Where-Object {
    $file = $_
    $exclude = $false
    foreach ($pattern in $excludeFiles) {
        if ($file.FullName -like "*$pattern*") {
            $exclude = $true
            break
        }
    }
    -not $exclude
}

Compress-Archive -Path $files -DestinationPath "microtrainer-extension.zip" -Force

Write-Host "✅ Extension packaged: microtrainer-extension.zip" -ForegroundColor Green

# Summary
Write-Host "`n🎉 Build complete!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Test locally: chrome://extensions/ → Load unpacked" -ForegroundColor White
Write-Host "2. Test on multiple websites" -ForegroundColor White
Write-Host "3. Upload microtrainer-extension.zip to Chrome Web Store" -ForegroundColor White
Write-Host "`n📁 Extension files ready in: $(Get-Location)" -ForegroundColor Cyan
