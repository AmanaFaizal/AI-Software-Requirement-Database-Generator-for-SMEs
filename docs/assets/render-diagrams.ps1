# Render the simple SVG shapes used by this article with Windows System.Drawing.
# No network access or additional packages are required.
Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'
$assetFolder = $PSScriptRoot
foreach ($diagramName in @('wso2-architecture', 'wso2-auth-checks')) {
    [xml]$svg = Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $assetFolder "$diagramName.svg")
    $width = [int]$svg.svg.width
    $height = [int]$svg.svg.height
    $bitmap = New-Object System.Drawing.Bitmap ($width * 2), ($height * 2)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.ScaleTransform(2, 2)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $graphics.Clear([System.Drawing.Color]::White)
    $ns = New-Object System.Xml.XmlNamespaceManager($svg.NameTable)
    $ns.AddNamespace('s', 'http://www.w3.org/2000/svg')
    foreach ($element in $svg.SelectNodes('/s:svg/s:rect | /s:svg/s:g/*', $ns)) {
        $fill = if ($element.HasAttribute('fill')) { $element.GetAttribute('fill') } else { '#152e43' }
        if ($fill -eq 'none') { $fill = 'transparent' }
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($fill))
        switch ($element.LocalName) {
            'rect' {
                $x = [single]$element.x; $y = [single]$element.y
                $w = [single]$element.width; $h = [single]$element.height
                $radius = if ($element.HasAttribute('rx')) { [single]$element.rx } else { 0 }
                $shape = New-Object System.Drawing.Drawing2D.GraphicsPath
                if ($radius -gt 0) {
                    $diameter = $radius * 2
                    $shape.AddArc($x, $y, $diameter, $diameter, 180, 90)
                    $shape.AddArc($x + $w - $diameter, $y, $diameter, $diameter, 270, 90)
                    $shape.AddArc($x + $w - $diameter, $y + $h - $diameter, $diameter, $diameter, 0, 90)
                    $shape.AddArc($x, $y + $h - $diameter, $diameter, $diameter, 90, 90)
                    $shape.CloseFigure()
                } else { $shape.AddRectangle([System.Drawing.RectangleF]::new($x, $y, $w, $h)) }
                $graphics.FillPath($brush, $shape)
                if ($element.HasAttribute('stroke')) {
                    $strokeWidth = if ($element.HasAttribute('stroke-width')) { [single]$element.GetAttribute('stroke-width') } else { 1 }
                    $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($element.stroke)), $strokeWidth
                    $graphics.DrawPath($pen, $shape); $pen.Dispose()
                }
                $shape.Dispose()
            }
            'circle' { $r = [single]$element.r; $graphics.FillEllipse($brush, [single]$element.cx - $r, [single]$element.cy - $r, $r * 2, $r * 2) }
            'text' {
                $size = [single]$element.GetAttribute('font-size')
                $style = if ($element.GetAttribute('font-weight') -eq '700') { [System.Drawing.FontStyle]::Bold } else { [System.Drawing.FontStyle]::Regular }
                $font = [System.Drawing.Font]::new('Segoe UI', $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
                $x = [single]$element.x
                if ($element.GetAttribute('text-anchor') -eq 'middle') { $x -= $graphics.MeasureString($element.InnerText, $font).Width / 2 }
                $ascent = $size * $font.FontFamily.GetCellAscent($style) / $font.FontFamily.GetEmHeight($style)
                $graphics.DrawString($element.InnerText, $font, $brush, $x, ([single]$element.y - $ascent))
                $font.Dispose()
            }
            'path' {
                $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($element.stroke), 3)
                $tokens = [regex]::Matches($element.d, '[MLHV]|-?\d+(?:\.\d+)?')
                $index = 0; $lastX = 0; $lastY = 0
                while ($index -lt $tokens.Count) {
                    $command = $tokens[$index++].Value
                    $nextX = $lastX; $nextY = $lastY
                    if ($command -eq 'M' -or $command -eq 'L') { $nextX = [single]$tokens[$index++].Value; $nextY = [single]$tokens[$index++].Value }
                    if ($command -eq 'H') { $nextX = [single]$tokens[$index++].Value }
                    if ($command -eq 'V') { $nextY = [single]$tokens[$index++].Value }
                    if ($command -ne 'M') {
                        $graphics.DrawLine($pen, $lastX, $lastY, $nextX, $nextY)
                        $angle = [Math]::Atan2($nextY - $lastY, $nextX - $lastX)
                        $points = [System.Drawing.PointF[]]@(
                            [System.Drawing.PointF]::new($nextX + 12 * [Math]::Cos($angle), $nextY + 12 * [Math]::Sin($angle)),
                            [System.Drawing.PointF]::new($nextX - 2 * [Math]::Sin($angle) * 4, $nextY + 2 * [Math]::Cos($angle) * 4),
                            [System.Drawing.PointF]::new($nextX + 2 * [Math]::Sin($angle) * 4, $nextY - 2 * [Math]::Cos($angle) * 4))
                        $arrowBrush = [System.Drawing.SolidBrush]::new($pen.Color)
                        $graphics.FillPolygon($arrowBrush, $points); $arrowBrush.Dispose()
                    }
                    $lastX = $nextX; $lastY = $nextY
                }
                $pen.Dispose()
            }
        }
        $brush.Dispose()
    }
    $bitmap.Save((Join-Path $assetFolder "$diagramName.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose(); $bitmap.Dispose()
}
