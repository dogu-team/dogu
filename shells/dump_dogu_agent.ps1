$srcPaths = @(
    "$env:USERPROFILE\.dogu\configs",
    "$env:USERPROFILE\.dogu\logs"
)

$existSrcPaths = @()
foreach ($srcPath in $srcPaths) {
    if (Test-Path $srcPath) {
        $existSrcPaths += $srcPath
    }
}

if ($existSrcPaths.Count -eq 0) {
    Write-Output "No files to dump from $srcPaths"
    return
}

$existSrcPathsString = $existSrcPaths -join ","
$dateTimeString = (Get-Date).ToString("yyyy-MM-dd-HH-mm-ss")
$destPath = ".\dogu_agent_dump_$dateTimeString.zip"

Write-Output "Dumping from $existSrcPathsString to $destPath"
Compress-Archive -LiteralPath $existSrcPathsString -DestinationPath $destPath
