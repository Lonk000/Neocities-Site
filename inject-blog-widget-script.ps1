param(
    [Parameter(Mandatory = $true)]
    [string]$BlogRoot
)

$ErrorActionPreference = "Stop"
$widgetScript = '<script src="https://u.widget.st/ar.js"></script>'
$utf8WithoutBom = [System.Text.UTF8Encoding]::new($false)

if (-not (Test-Path -LiteralPath $BlogRoot -PathType Container)) {
    throw "Generated blog directory not found: $BlogRoot"
}

Get-ChildItem -LiteralPath $BlogRoot -Filter "*.html" -File -Recurse | ForEach-Object {
    $html = [System.IO.File]::ReadAllText($_.FullName)
    if ($html -notmatch [regex]::Escape("https://u.widget.st/ar.js")) {
        $updatedHtml = [regex]::Replace($html, "(?i)</head>", "$widgetScript`r`n</head>", 1)
        if ($updatedHtml -eq $html) {
            throw "Could not find a closing head tag in $($_.FullName)"
        }
        [System.IO.File]::WriteAllText($_.FullName, $updatedHtml, $utf8WithoutBom)
    }
}
