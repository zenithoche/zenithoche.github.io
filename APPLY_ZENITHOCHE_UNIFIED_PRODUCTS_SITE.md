# Apply Zenithoche Unified Products Site Patch

```powershell
$ErrorActionPreference = "Stop"

$Root = "C:\Users\nixxy\dev\zenithoche.github.io"
$Zip  = "C:\Users\nixxy\01_SAVES\zenithoche_unified_products_patch.zip"
$Temp = Join-Path $env:TEMP ("zenithoche_unified_products_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$Backup = "backup-before-unified-products-site-" + (Get-Date -Format "yyyyMMdd-HHmmss")

cd $Root

git branch $Backup

New-Item -ItemType Directory -Force -Path $Temp | Out-Null
Expand-Archive -LiteralPath $Zip -DestinationPath $Temp -Force
Copy-Item -Path (Join-Path $Temp "*") -Destination $Root -Recurse -Force

git status --short
git add .
git commit -m "Unify Zenithoche product pages"
git push

Write-Host ""
Write-Host "Canonical links:" -ForegroundColor Green
Write-Host "https://zenithoche.com/products/jupnich/"
Write-Host "https://zenithoche.com/products/jupnich/terms.html"
Write-Host "https://zenithoche.com/products/jupnich/privacy.html"
Write-Host "https://zenithoche.com/products/ashiko/"
Write-Host "https://zenithoche.com/products/ashiko/terms.html"
Write-Host "https://zenithoche.com/products/ashiko/privacy.html"
```
