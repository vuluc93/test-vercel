param(
    [int]$Port = 8080
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host "Server running on http://localhost:$Port"

while ($true) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    # Thêm CORS header
    $response.AddHeader("Access-Control-Allow-Origin", "*")
    $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")

    $file   = $request.QueryString["file"]
    $search = $request.QueryString["search"]

    if (-not $file -or -not $search) {
        $msg = "Missing params: file or search"
        $buffer = [System.Text.Encoding]::UTF8.GetBytes($msg)
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
        $response.Close()
        continue
    }

    # Đọc file và tìm chuỗi
    $lines = Get-Content -Path $file
    $lineIndex = -1
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -like "*$search*") {
            $lineIndex = $i
            break
        }
    }

    if ($lineIndex -ge 0) {
        # Mở VSCode tại dòng đó
        Start-Process code "-g `"$file`":$($lineIndex+1)"
        $msg = "Opened $file at line $($lineIndex+1)"
    }
    else {
        Start-Process code "`"$file`""
        $msg = "Opened $file (search not found)"
    }

    $buffer = [System.Text.Encoding]::UTF8.GetBytes($msg)
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.Close()
}
