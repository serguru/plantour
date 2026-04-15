[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [ValidateSet('Debug', 'Release')]
    [string]$ServerConfiguration = 'Debug'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$scriptFilePath = $PSCommandPath

if (-not $scriptFilePath) {
    $scriptFilePath = $MyInvocation.PSCommandPath
}

if (-not $scriptFilePath) {
    throw 'Unable to determine the deployment script path for self-elevation.'
}

$scriptRoot = Split-Path -Parent $scriptFilePath
$serverRoot = (Resolve-Path (Join-Path $scriptRoot '..')).Path
$workspaceRoot = (Resolve-Path (Join-Path $serverRoot '..')).Path
$clientRoot = (Resolve-Path (Join-Path $workspaceRoot 'plantour-maintenance-client')).Path

$artifactsRoot = Join-Path $serverRoot 'artifacts\local-m-deployment'
$serverPublishRoot = Join-Path $artifactsRoot 'server-publish'
$clientBuildRoot = Join-Path $clientRoot 'dist\plantour-maintenance-client\browser'
$logFilePath = Join-Path $artifactsRoot 'deploy.log'
$clientWebsiteName = 'PlantourMaintenanceClient'
$serverWebsiteName = 'PlantourMaintenanceApi'

function Write-Step {
    param([string]$Message)

    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Cyan
}

function Assert-CommandExists {
    param([string]$CommandName)

    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "Required command '$CommandName' was not found on PATH."
    }
}

function Assert-PathExists {
    param(
        [string]$Path,
        [string]$Description
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Description not found: $Path"
    }
}

function Invoke-ExternalCommand {
    param(
        [string]$Description,
        [string]$WorkingDirectory,
        [string]$FilePath,
        [string[]]$ArgumentList
    )

    Write-Step $Description

    if (-not $PSCmdlet.ShouldProcess($WorkingDirectory, $Description)) {
        return
    }

    Push-Location $WorkingDirectory
    try {
        & $FilePath @ArgumentList
        if ($LASTEXITCODE -ne 0) {
            throw "$Description failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

function Invoke-RobocopyMirror {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Description
    )

    Assert-PathExists -Path $Source -Description 'Source directory'

    if (-not (Test-Path -LiteralPath $Destination)) {
        New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    }

    Write-Step $Description

    if (-not $PSCmdlet.ShouldProcess($Destination, $Description)) {
        return
    }

    & robocopy $Source $Destination /MIR /FFT /R:2 /W:2 /NFL /NDL /NJH /NJS /NP
    $robocopyExitCode = $LASTEXITCODE
    if ($robocopyExitCode -gt 7) {
        throw "$Description failed with robocopy exit code $robocopyExitCode."
    }
}

function Resolve-WebsitePhysicalPath {
    param(
        [string]$WebsiteName,
        [string]$Description
    )

    $website = Get-Website -Name $WebsiteName -ErrorAction SilentlyContinue
    if (-not $website) {
        throw "$Description website not found in IIS: $WebsiteName"
    }

    $physicalPath = [Environment]::ExpandEnvironmentVariables($website.PhysicalPath)
    if (-not $physicalPath) {
        throw "$Description website has no physical path configured in IIS: $WebsiteName"
    }

    return $physicalPath
}

$windowsIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$windowsPrincipal = [Security.Principal.WindowsPrincipal]::new($windowsIdentity)
if (-not $windowsPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Run this deployment from an elevated VS Code window or terminal. Restart VS Code as Administrator, then run Local M deployment again.'
}

Assert-CommandExists -CommandName 'npm.cmd'
Assert-CommandExists -CommandName 'dotnet'
Assert-CommandExists -CommandName 'robocopy.exe'

Import-Module WebAdministration

if (-not (Test-Path -LiteralPath $artifactsRoot)) {
    New-Item -ItemType Directory -Path $artifactsRoot -Force | Out-Null
}

Start-Transcript -Path $logFilePath -Force | Out-Null

try {
    Assert-PathExists -Path $clientRoot -Description 'Maintenance client repository'
    Assert-PathExists -Path $serverRoot -Description 'Maintenance server repository'
    Assert-PathExists -Path (Join-Path $serverRoot 'plantour-maintenance-server.csproj') -Description 'Maintenance server project file'

    $clientTarget = Resolve-WebsitePhysicalPath -WebsiteName $clientWebsiteName -Description 'Maintenance client'
    $serverTarget = Resolve-WebsitePhysicalPath -WebsiteName $serverWebsiteName -Description 'Maintenance server'

    Write-Step "Maintenance client IIS directory: $clientTarget"
    Write-Step "Maintenance server IIS directory: $serverTarget"

    if (Test-Path -LiteralPath $serverPublishRoot) {
        Write-Step 'Reset server publish output directory'
        if ($PSCmdlet.ShouldProcess($serverPublishRoot, 'Remove previous server publish output')) {
            Remove-Item -LiteralPath $serverPublishRoot -Recurse -Force
        }
    }

    Invoke-ExternalCommand -Description 'Build maintenance client for local IIS' -WorkingDirectory $clientRoot -FilePath 'npm.cmd' -ArgumentList @('run', 'build:local-iis')

    Assert-PathExists -Path $clientBuildRoot -Description 'Maintenance client build output'

    Invoke-ExternalCommand -Description 'Publish maintenance server for IIS deployment' -WorkingDirectory $serverRoot -FilePath 'dotnet' -ArgumentList @(
            'publish',
            (Join-Path $serverRoot 'plantour-maintenance-server.csproj'),
            '-c',
            $ServerConfiguration,
            '-o',
            $serverPublishRoot
        )

    Assert-PathExists -Path $serverPublishRoot -Description 'Maintenance server publish output'

    $websitesStopped = $false

    try {
        Write-Step 'Stop IIS websites'
        if ($PSCmdlet.ShouldProcess($clientWebsiteName, 'Stop IIS website')) {
            Stop-Website -Name $clientWebsiteName
        }
        if ($PSCmdlet.ShouldProcess($serverWebsiteName, 'Stop IIS website')) {
            Stop-Website -Name $serverWebsiteName
        }
        $websitesStopped = $true

        Invoke-RobocopyMirror -Source $clientBuildRoot -Destination $clientTarget -Description 'Deploy maintenance client build into IIS directory'

        Invoke-RobocopyMirror -Source $serverPublishRoot -Destination $serverTarget -Description 'Deploy maintenance server publish output into IIS directory'
    }
    finally {
        if ($websitesStopped) {
            Write-Step 'Start IIS websites'
            if ($PSCmdlet.ShouldProcess($clientWebsiteName, 'Start IIS website')) {
                Start-Website -Name $clientWebsiteName
            }
            if ($PSCmdlet.ShouldProcess($serverWebsiteName, 'Start IIS website')) {
                Start-Website -Name $serverWebsiteName
            }
        }
    }

    Write-Step 'Local maintenance deployment completed'
}
finally {
    try {
        Stop-Transcript | Out-Null
    }
    catch {
    }
}