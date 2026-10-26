$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$portableNode = Join-Path $env:LOCALAPPDATA 'Nexo/tools/node-v22.23.4-win-x64/node.exe'

if (Test-Path -LiteralPath $portableNode) {
    $env:PATH = "$(Split-Path $portableNode);$env:PATH"
    $node = $portableNode
} else {
    $node = (Get-Command node -ErrorAction Stop).Source
}

$version = & $node -p 'process.versions.node'
if ($version -notmatch '^22\.') {
    throw "O Nexo requer Node 22. Versao encontrada: $version."
}

Push-Location $projectRoot
try {
    if (-not (Test-Path -LiteralPath 'node_modules/.yarn-state.yml')) {
        throw 'Dependencias ausentes. Siga a secao Nexo em docs/BUILDING.md.'
    }
    Write-Host 'Iniciando Nexo. Abra o endereco Local exibido ao terminar a compilacao.'
    & $node '.yarn/releases/yarn-4.18.0.cjs' dev -p '@affine/web'
    $result = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $result
