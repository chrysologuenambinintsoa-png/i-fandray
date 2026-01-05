try {
  $c = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
  if ($c) {
    $killPids = $c | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($killPid in $killPids) {
      Write-Host "Killing PID $killPid"
      try { Stop-Process -Id $killPid -Force } catch { Write-Host "Failed to kill $killPid" }
    }
  } else {
    $entries = netstat -ano | Select-String ':3000'
    if ($entries) {
      foreach ($e in $entries) {
        $cols = ($e -split '\s+')
        $killPid = $cols[-1]
        Write-Host "Killing PID $killPid"
        try { Stop-Process -Id $killPid -Force } catch { Write-Host "Failed to kill $killPid" }
      }
    } else {
      Write-Host 'No process on port 3000'
    }
  }
} catch {
  Write-Host "Error: $_"
}
