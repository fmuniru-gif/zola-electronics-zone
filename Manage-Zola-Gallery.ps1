# Local owner gallery manager. Select photos/videos through Windows file picker;
# publishing requires an explicit, reviewed GitHub PR merge.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
function Run([string]$exe, [string[]]$arguments) {
  & $exe @arguments
  if ($LASTEXITCODE -ne 0) { throw "STOP: $exe $($arguments -join ' ') failed (exit $LASTEXITCODE). Files have not been pushed." }
}
if (-not (Test-Path 'tools/add_gallery.py') -or -not (Test-Path '.git')) {
  throw 'STOP: Open this script from the root of your checked-out Zola website repository.'
}
$dirty = @(git status --porcelain)
if ($dirty.Count -gt 0) { throw 'STOP: Save or resolve existing local website changes before starting a gallery upload. No files changed.' }
Run 'git' @('fetch','origin','main')
Run 'git' @('switch','main')
Run 'git' @('pull','--ff-only','origin','main')
$branch = 'review/zez-gallery-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
Run 'git' @('switch','-c',$branch)
$python = if (Get-Command py -ErrorAction SilentlyContinue) { 'py' } elseif (Get-Command python -ErrorAction SilentlyContinue) { 'python' } else { throw 'Python is needed to use the owner photo/video selector.' }
try { Run $python @('-c','from PIL import Image; import tkinter') } catch { throw 'Python Pillow and Tkinter are needed. Install Pillow with: py -m pip install Pillow. Then run this script again.' }
Write-Host "Select photos or videos and enter captions in the pop-up windows." -ForegroundColor Cyan
Run $python @('tools/add_gallery.py')
if (@(git status --porcelain).Count -eq 0) { Write-Host 'No gallery changes were made. No push.' -ForegroundColor Yellow; exit 0 }
# These checks match the ordinary production website and gallery contracts.
Run 'npm' @('test')
Run 'node' @('--test','tests/zez-v2.test.cjs')
Run 'npm' @('run','test:browser')
Run 'node' @('--test','tests/zez-email-fix.test.cjs')
Run 'node' @('--test','tests/zez-email-fix.browser.cjs')
Run 'git' @('diff','--check')
Write-Host "`nGallery files prepared locally. Nothing has been published." -ForegroundColor Green
& git status --short
$go = Read-Host 'Push these photos/videos to a private review branch for your approval? Type YES to proceed'
if ($go -ne 'YES') { Write-Host 'Review branch remains local. Nothing pushed.'; exit 0 }
Run 'git' @('add','assets/gallery')
Run 'git' @('commit','-m','Prepare owner-selected Zola gallery media for review')
Run 'git' @('push','-u','origin',$branch)
Write-Host "SUCCESS: Gallery review branch pushed, not merged. Review then merge at:" -ForegroundColor Green
Write-Host "https://github.com/fmuniru-gif/zola-electronics-zone/compare/main...$($branch.Replace('/','%2F'))?expand=1"
