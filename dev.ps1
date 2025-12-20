# Development startup script with automatic port cleanup
Write-Host "iSafari Global - Development Server Startup" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes on the required ports
Write-Host "Step 1: Cleaning up ports..." -ForegroundColor Yellow
$ports = @(4028, 5000)

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connection) {
        $processId = $connection.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "  Killing $($process.ProcessName) (PID: $processId) on port $port" -ForegroundColor Red
            Stop-Process -Id $processId -Force
            Start-Sleep -Milliseconds 500
            Write-Host "  ✓ Port $port freed" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✓ Port $port already free" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 2: Starting development servers..." -ForegroundColor Yellow
Write-Host ""

# Start the development servers
npm run dev