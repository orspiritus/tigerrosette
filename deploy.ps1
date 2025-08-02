# Deploy script for TigerRozetka to GitHub Pages

Write-Host "🔨 Building TigerRozetka..." -ForegroundColor Yellow

# Build the project
npm run build

# Update favicon to use TigerRozetka icon (optional - since it should be handled by Vite now)
Write-Host "🎨 Updating favicon..." -ForegroundColor Yellow
(Get-Content "dist/index.html") | 
    ForEach-Object { $_ -replace '/vite\.svg', '/tigerrosette/Media/Pictures/tigrrozetka_ico.png' } |
    ForEach-Object { $_ -replace 'image/svg\+xml', 'image/png' } |
    Set-Content "dist/index.html"

# Deploy to GitHub Pages
Write-Host "🚀 Deploying to GitHub Pages..." -ForegroundColor Green
npx gh-pages -d dist

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 Your app is available at: https://orspiritus.github.io/tigerrosette/" -ForegroundColor Cyan
