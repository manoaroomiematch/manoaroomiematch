# Kill all node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait for processes to fully terminate
Start-Sleep -Seconds 3

# Remove .next folder using multiple methods
if (Test-Path .next) {
    # Method 1: Remove all children first
    Get-ChildItem -Path .next -Recurse -Force -ErrorAction SilentlyContinue | 
        ForEach-Object { 
            Remove-Item $_.FullName -Force -Recurse -ErrorAction SilentlyContinue 
        }
    
    # Method 2: Use cmd rmdir
    cmd /c "rmdir /s /q .next" 2>$null
    
    # Method 3: Direct PowerShell removal
    Remove-Item .next -Force -Recurse -ErrorAction SilentlyContinue
}

# Verify removal
if (Test-Path .next) {
    Write-Host "Warning: .next still exists, trying Windows Explorer method..." -ForegroundColor Yellow
    explorer.exe .
    Write-Host "Please manually delete the .next folder in the File Explorer window that just opened" -ForegroundColor Red
    pause
}

Write-Host "Cleanup complete! Starting dev server..." -ForegroundColor Green
npm run dev
