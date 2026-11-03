# Cập nhật văn phòng trên máy này: lấy mã mới về, dựng lại giao diện, khởi động lại dịch vụ chạy nền.
#
#   cd $env:USERPROFILE\my-office
#   .\capnhat.ps1
#
# Chạy được từ bất cứ thư mục nào, vì script tự về thư mục chứa chính nó.
# Không cần quyền quản trị.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$port = 4310
$vbs  = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs\Startup\My Office.vbs'

function Buoc($n, $text) { Write-Host "`n[$n/5] $text" -ForegroundColor Cyan }

Buoc 1 'Lấy mã mới từ GitHub…'
$truoc = git rev-parse HEAD
git pull --ff-only
$sau = git rev-parse HEAD
if ($truoc -eq $sau) {
  Write-Host '      Không có gì mới. Vẫn dựng lại cho chắc.' -ForegroundColor DarkGray
} else {
  git --no-pager log --oneline "$truoc..$sau" | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkGray }
}

Buoc 2 'Dừng văn phòng đang chạy…'
$pids = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
          Select-Object -ExpandProperty OwningProcess -Unique)
if ($pids.Count) {
  $pids | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
  Write-Host "      Đã dừng $($pids.Count) tiến trình." -ForegroundColor DarkGray
  Start-Sleep -Seconds 1
} else {
  Write-Host '      Không có gì đang chạy ở cổng này.' -ForegroundColor DarkGray
}

Buoc 3 'Cài thư viện nếu có thay đổi…'
if ($truoc -eq $sau) {
  Write-Host '      Bỏ qua.' -ForegroundColor DarkGray
} elseif (git diff --name-only "$truoc..$sau" | Select-String -Quiet 'package(-lock)?\.json') {
  npm install --no-audit --no-fund
} else {
  Write-Host '      Không đổi, bỏ qua.' -ForegroundColor DarkGray
}

Buoc 4 'Dựng lại giao diện (khoảng một phút)…'
npm run build

Buoc 5 'Chạy lại văn phòng…'
if (Test-Path $vbs) {
  wscript $vbs
} else {
  Write-Host '      Chưa cài dịch vụ chạy nền. Chạy: node bin/cli.mjs install --service' -ForegroundColor Yellow
}

# Đợi server mở cổng trở lại, tối đa 30 giây
$len = 0
while ($len -lt 30 -and -not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) {
  Start-Sleep -Seconds 1; $len++
}

Write-Host ''
if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
  Write-Host "Xong. Mở http://localhost:$port và bấm Ctrl+F5 để lấy bản mới." -ForegroundColor Green
} else {
  Write-Host "Server chưa lên sau 30 giây. Xem nhật ký: data\server.log" -ForegroundColor Yellow
  Write-Host "Hoặc kiểm tra: node bin/cli.mjs doctor" -ForegroundColor Yellow
}
