# Cross-platform dev:all script for Windows PowerShell
# Launches Next.js dev server and signaling server concurrently

param(
    [switch]$NoSignaling,
    [switch]$NoNext
)

$ErrorActionPreference = "Stop"

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
    return $connection.TcpTestSucceeded
}

# Check if signaling port is available
if (-not $NoSignaling) {
    if (Test-Port -Port 3001) {
        Write-Warning "Port 3001 is already in use. Signaling server might already be running."
    }
}

# Check if Next.js port is available
if (-not $NoNext) {
    if (Test-Port -Port 3000) {
        Write-Warning "Port 3000 is already in use. Next.js dev server might already be running."
    }
}

Write-Host "Starting i-fandray development environment..." -ForegroundColor Green

$jobs = @()

# Start signaling server
if (-not $NoSignaling) {
    Write-Host "Starting signaling server..." -ForegroundColor Yellow
    $signalingJob = Start-Job -ScriptBlock {
        try {
            Set-Location $using:PWD
            & node signaling/server.js
        } catch {
            Write-Error "Failed to start signaling server: $_"
        }
    }
    $jobs += $signalingJob
    Start-Sleep -Seconds 2  # Give it time to start
}

# Start Next.js dev server
if (-not $NoNext) {
    Write-Host "Starting Next.js dev server..." -ForegroundColor Yellow
    $nextJob = Start-Job -ScriptBlock {
        try {
            Set-Location $using:PWD
            & npm run dev
        } catch {
            Write-Error "Failed to start Next.js dev server: $_"
        }
    }
    $jobs += $nextJob
}

# Wait a bit for servers to start
Start-Sleep -Seconds 3

# Check if servers are running
if (-not $NoSignaling) {
    if (Test-Port -Port 3001) {
        Write-Host "✓ Signaling server is running on ws://localhost:3001" -ForegroundColor Green
    } else {
        Write-Warning "Signaling server may not have started properly"
    }
}

if (-not $NoNext) {
    if (Test-Port -Port 3000) {
        Write-Host "✓ Next.js dev server is running on http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Warning "Next.js dev server may not have started properly"
    }
}

Write-Host "`nDevelopment environment started!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Cyan

# Keep the script running and monitor jobs
try {
    while ($true) {
        $failedJobs = $jobs | Where-Object { $_.State -eq "Failed" }
        if ($failedJobs) {
            Write-Error "One or more jobs failed:"
            $failedJobs | ForEach-Object {
                Write-Error "Job $($_.Id): $($_.JobStateInfo.Reason)"
            }
            break
        }

        $completedJobs = $jobs | Where-Object { $_.State -eq "Completed" }
        if ($completedJobs) {
            Write-Warning "One or more jobs completed unexpectedly:"
            $completedJobs | ForEach-Object {
                Write-Warning "Job $($_.Id) completed"
            }
            break
        }

        Start-Sleep -Seconds 5
    }
} finally {
    Write-Host "`nStopping all servers..." -ForegroundColor Yellow
    $jobs | Stop-Job -PassThru | Remove-Job
    Write-Host "All servers stopped." -ForegroundColor Green
}