# Script to remove .env.local from Git tracking
# This keeps the file locally but removes it from Git

Write-Host "Removing .env.local from Git tracking..." -ForegroundColor Yellow

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local file exists locally" -ForegroundColor Green
} else {
    Write-Host "✗ .env.local file not found" -ForegroundColor Red
    exit 1
}

# Try to find Git
$gitPath = $null
$possiblePaths = @(
    "git",
    "C:\Program Files\Git\cmd\git.exe",
    "C:\Program Files (x86)\Git\cmd\git.exe",
    "$env:LOCALAPPDATA\GitHubDesktop\bin\git.exe",
    "$env:ProgramFiles\Git\cmd\git.exe",
    "$env:ProgramFiles(x86)\Git\cmd\git.exe"
)

foreach ($path in $possiblePaths) {
    try {
        if ($path -eq "git") {
            $result = & git --version 2>&1
            if ($LASTEXITCODE -eq 0) {
                $gitPath = "git"
                break
            }
        } else {
            if (Test-Path $path) {
                $result = & $path --version 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $gitPath = $path
                    break
                }
            }
        }
    } catch {
        continue
    }
}

if (-not $gitPath) {
    Write-Host "✗ Git not found. Please run these commands manually:" -ForegroundColor Red
    Write-Host ""
    Write-Host "1. Open GitHub Desktop" -ForegroundColor Yellow
    Write-Host "2. Go to Repository → Open in Command Prompt" -ForegroundColor Yellow
    Write-Host "3. Run: git rm --cached .env.local" -ForegroundColor Cyan
    Write-Host "4. Commit the change" -ForegroundColor Yellow
    Write-Host "5. Push to GitHub" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found Git at: $gitPath" -ForegroundColor Green

# Check if file is tracked in Git
Write-Host "Checking if .env.local is tracked in Git..." -ForegroundColor Yellow
$tracked = & $gitPath ls-files | Select-String -Pattern "\.env\.local"

if ($tracked) {
    Write-Host "✓ .env.local is tracked in Git - will remove it" -ForegroundColor Yellow
    
    # Remove from Git tracking
    Write-Host "Removing .env.local from Git tracking..." -ForegroundColor Yellow
    & $gitPath rm --cached .env.local
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Successfully removed .env.local from Git tracking" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. Commit the change: git commit -m 'Remove .env.local from repository'" -ForegroundColor Cyan
        Write-Host "2. Push to GitHub: git push" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: If this file contained sensitive data (API keys, secrets):" -ForegroundColor Red
        Write-Host "   - Rotate ALL secrets immediately (generate new keys)" -ForegroundColor Red
        Write-Host "   - Update your .env.local with new values" -ForegroundColor Red
        Write-Host "   - Update Vercel environment variables if needed" -ForegroundColor Red
    } else {
        Write-Host "✗ Failed to remove file from Git" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ .env.local is NOT tracked in Git (it's already ignored)" -ForegroundColor Green
    Write-Host "The file is in .gitignore, so it won't be committed in the future." -ForegroundColor Green
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
