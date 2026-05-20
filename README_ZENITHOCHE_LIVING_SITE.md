# Zenithoche Living Site v1

This is a static replacement pass for zenithoche.com.

## What it adds

- Living animated background
- Cursor glow
- Product cards for Jupnich and Ashiko
- Media slots for screenshots, GIFs, and MP4 loops
- Product pages for Jupnich and Ashiko
- Pricing cards with centralized labels
- Mobile responsive layout
- Reduced-motion support

## Pricing source

Edit prices in:

```text
assets/js/site-config.js
```

Do not hardcode prices across multiple HTML files.

## Media source

Drop real media into:

```text
assets/media/
```

The expected file names are listed in:

```text
assets/media/README.md
```

## Safe deployment flow

From the site repo root:

```powershell
git status --short
Copy-Item -Path "C:\Users\nixxy\01_SAVES\zenithoche_living_site_v1\*" -Destination . -Recurse -Force
git status --short
git add .
git commit -m "Refresh Zenithoche living site"
git push
```

Adjust the source folder if the zip was extracted somewhere else.
