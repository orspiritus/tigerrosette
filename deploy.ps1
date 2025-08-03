# Deploy script for TigerRozetka Telegram Mini App

Write-Host "🔨 Building TigerRozetka for Telegram Mini Apps..." -ForegroundColor Yellow

# Build the project
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Update paths and optimize for Telegram
Write-Host "🎨 Optimizing for Telegram Mini Apps..." -ForegroundColor Yellow

# Fix manifest path in dist
(Get-Content "dist/index.html") | 
    ForEach-Object { $_ -replace '/manifest\.json', '/tigerrosette/manifest.json' } |
    Set-Content "dist/index.html"

# Ensure all images use correct base path
(Get-Content "dist/index.html") | 
    ForEach-Object { $_ -replace '/Media/', '/tigerrosette/Media/' } |
    Set-Content "dist/index.html"

# Copy CNAME for custom domain (if exists)
if (Test-Path "CNAME") {
    Copy-Item "CNAME" "dist/CNAME"
    Write-Host "📄 CNAME file copied" -ForegroundColor Green
}

# Deploy to GitHub Pages
Write-Host "🚀 Deploying to GitHub Pages..." -ForegroundColor Green
npx gh-pages -d dist

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deployment complete!" -ForegroundColor Green
    Write-Host "🌐 Your Telegram Mini App is available at: https://orspiritus.github.io/tigerrosette/" -ForegroundColor Cyan
    Write-Host "📱 Use this URL to create your Telegram Bot and Mini App" -ForegroundColor Yellow
    Write-Host "🔧 Setup instructions:" -ForegroundColor Magenta
    Write-Host "  1. Create bot with @BotFather" -ForegroundColor White
    Write-Host "  2. Use /newapp command" -ForegroundColor White
    Write-Host "  3. Enter URL: https://orspiritus.github.io/tigerrosette/" -ForegroundColor White
    Write-Host "  4. Set short name: tigerrozetka" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
