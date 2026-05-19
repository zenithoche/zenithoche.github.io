# Apply Zenithoche Ashiko Pricing Page Patch

```powershell
$ErrorActionPreference = "Stop"

$Root = "C:\Users\nixxy\dev\zenithoche.github.io"
$Zip  = "C:\Users\nixxy\01_SAVES\zenithoche_ashiko_pricing_page_patch.zip"
$Temp = Join-Path $env:TEMP ("zenithoche_ashiko_pricing_" + (Get-Date -Format "yyyyMMdd_HHmmss"))
$Backup = "backup-before-ashiko-pricing-page-" + (Get-Date -Format "yyyyMMdd-HHmmss")

cd $Root

git branch $Backup

New-Item -ItemType Directory -Force -Path $Temp | Out-Null
Expand-Archive -LiteralPath $Zip -DestinationPath $Temp -Force
Copy-Item -Path (Join-Path $Temp "*") -Destination $Root -Recurse -Force

git status --short
git add .
git commit -m "Add Ashiko pricing page"
git pull --rebase origin main
git push
```

Test:

```text
https://zenithoche.com/products/ashiko/
```
