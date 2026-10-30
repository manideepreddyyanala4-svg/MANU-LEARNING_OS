# ManuOS Finance: owner-controlled FREE production backup on Windows PowerShell.
# Run from a trusted Windows computer. NO cloud staging and NO database writes.
# Requires Supabase CLI, Docker Desktop (for db dump) and local disk space.
# Private data, hashed passwords and documents never enter GitHub Actions.
param(
  [string]$OutputRoot = (Join-Path $HOME 'ManuOS-Private-Backups'),
  [int]$ExpectedLearningAssetsFloor = 45
)
$ErrorActionPreference = 'Stop'
$projectRef='awmfxkaunmithimfijsi'
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
  throw 'Install the official Supabase CLI first: https://supabase.com/docs/guides/local-development/cli/getting-started'
}
if ($ExpectedLearningAssetsFloor -lt 45) {
  throw 'Refusing to lower the last verified learning-assets count of 45.'
}
$timestamp=(Get-Date).ToUniversalTime().ToString('yyyyMMdd-HHmmss')
$destination=Join-Path $OutputRoot ("manuos-" + $projectRef + "-" + $timestamp)
$tempProject=Join-Path ([IO.Path]::GetTempPath()) ("manuos-backup-cli-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $destination,$tempProject -Force | Out-Null
$storageDir=Join-Path $destination 'storage'
New-Item -ItemType Directory -Path $storageDir -Force | Out-Null
function Invoke-CLI([string[]]$Arguments) {
  & supabase @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw ("Supabase command failed (exit " + $LASTEXITCODE + "): " + ($Arguments | Select-Object -First 2) -join " ")
  }
}
try {
  Push-Location $tempProject
  try {
    Invoke-CLI @('init','--yes')
    # Interactive authentication only on the owner's own computer. No tokens in this file.
    Invoke-CLI @('login')
    Invoke-CLI @('link','--project-ref',$projectRef)
    Write-Host 'Exporting database roles, full public schema/data, managed auth and storage metadata...'
    Invoke-CLI @('db','dump','--linked','--role-only','-f',(Join-Path $destination 'roles.sql'))
    Invoke-CLI @('db','dump','--linked','-f',(Join-Path $destination 'schema.sql'))
    Invoke-CLI @('db','dump','--linked','--data-only','--use-copy','--schema','public',
      '-f',(Join-Path $destination 'public-data.sql'))
    # Supabase's default CLI dump excludes managed auth/storage; preserve metadata explicitly.
    # This is sensitive: never upload it to ChatGPT, Vercel, or GitHub.
    Invoke-CLI @('db','dump','--linked','--data-only','--use-copy','--schema','auth,storage',
      '-f',(Join-Path $destination 'managed-auth-storage-data.sql'))
    Write-Host 'Downloading private learning-assets bucket (last observed: 45 objects)...'
    Invoke-CLI @('storage','cp','--linked','--experimental','--recursive',
      'ss:///learning-assets',(Join-Path $storageDir 'learning-assets'))
    $files=@(Get-ChildItem -LiteralPath $storageDir -File -Recurse)
    if ($files.Count -lt $ExpectedLearningAssetsFloor) {
      throw ("Only " + $files.Count + " private objects saved, expected at least " + $ExpectedLearningAssetsFloor + ". BACKUP INCOMPLETE.")
    }
    foreach ($filename in @('roles.sql','schema.sql','public-data.sql','managed-auth-storage-data.sql')) {
      $file=Get-Item -LiteralPath (Join-Path $destination $filename)
      if ($file.Length -le 0) { throw "Empty backup component: $filename" }
    }
    $items=@(Get-ChildItem -LiteralPath $destination -File -Recurse | ForEach-Object {
      [pscustomobject]@{
        relativePath=$_.FullName.Substring($destination.Length).TrimStart('\','/')
        bytes=$_.Length
        sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
      }
    })
    $manifest=[pscustomobject]@{
      projectRef=$projectRef
      capturedAtUTC=(Get-Date).ToUniversalTime().ToString('o')
      sqlFiles=4
      storageObjects=$files.Count
      lastVerifiedLiveLearningAssets=45
      caveat='Private offline snapshot. NOT verified recoverable until a full isolated restore rehearsal.'
      files=$items
    }
    $manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $destination 'manifest.json') -Encoding UTF8
    Write-Host ("Backup artifacts saved privately: " + $destination)
    Write-Host ("Private storage objects copied: " + $files.Count)
    Write-Host 'NEXT: encrypt the folder, make an offline copy, and rehearse restoration before changing production.'
  }
  finally { Pop-Location }
}
finally {
  # The private export folder is deliberately NOT removed on failure; review files
  # individually, but NEVER treat partial exports as a completed backup.
  Remove-Item -LiteralPath $tempProject -Recurse -Force -ErrorAction SilentlyContinue
}
