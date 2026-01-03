# Kill processes on ports 4028 and 5000
Write-Host "Checking for processes on ports 4028 and 5000..." -ForegroundColor Yellow

$ports = @(4028, 5000)

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connection) {
        $processId = $connection.OwningProcess
        $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
        
        if ($process) {
            Write-Host "Killing process $($process.ProcessName) (PID: $processId) on port $port" -ForegroundColor Red
            Stop-Process -Id $processId -Force
            Write-Host "✓ Port $port is now free" -ForegroundColor Green
        }
    } else {
        Write-Host "✓ Port $port is already free" -ForegroundColor Green
    }
}

Write-Host "`nAll ports are clear. You can now run 'npm run dev'" -ForegroundColor Cyan