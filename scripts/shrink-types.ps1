# Sizes the "library" card images in src/assets/types/ for the site, JPEG quality 80:
# app cards 480 x 640 (3:4), software cards 640 x 480 (4:3). The full-size original moves to src/assets/types-original/.
# Run after adding or replacing card images: pwsh scripts/shrink-types.ps1
Add-Type -AssemblyName System.Drawing
$dir = Join-Path $PSScriptRoot '..\src\assets\types'
$orig = Join-Path $PSScriptRoot '..\src\assets\types-original'
New-Item -ItemType Directory -Force $orig | Out-Null
$software = 'crm','erp','job-tracking','inventory-and-stock','billing-and-invoicing','quotations-and-estimates','order-management','warehouse-management','hr-and-payroll','attendance-and-leave','clinic-management','hospital-management','school-management','restaurant-billing-pos','field-service-management','project-management','helpdesk-and-tickets','dealer-and-distributor-portal','vendor-portal','customer-portal','production-tracking','fleet-management','property-management','lab-reports','document-management','approval-workflows','reports-and-dashboards','tally-and-accounts-link'
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 80L
Get-ChildItem $dir -Filter *.jpg | ForEach-Object {
  $file = $_
  $src = [System.Drawing.Image]::FromFile($file.FullName)
  if ($src.Width -le 640) { $src.Dispose(); return }
  $wide = $software -contains $file.BaseName
  $outW = if ($wide) { 640 } else { 480 }; $outH = if ($wide) { 480 } else { 640 }
  # centre crop to the card shape; the phone or laptop sits in the middle of the image
  $h = $src.Height; $w = [int]($h * $outW / $outH)
  if ($w -gt $src.Width) { $w = $src.Width; $h = [int]($w * $outH / $outW) }
  $x = [int](($src.Width - $w) / 2); $y = [int](($src.Height - $h) / 2)
  $dst = New-Object System.Drawing.Bitmap $outW, $outH
  $g = [System.Drawing.Graphics]::FromImage($dst)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $outW, $outH), (New-Object System.Drawing.Rectangle $x, $y, $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose(); $src.Dispose()
  Copy-Item $file.FullName (Join-Path $orig $file.Name) -Force
  $tmp = "$($file.FullName).tmp"
  $dst.Save($tmp, $codec, $params); $dst.Dispose()
  Move-Item $tmp $file.FullName -Force
  "{0} {1} KB" -f $file.Name, [int]((Get-Item $file.FullName).Length / 1KB)
}
