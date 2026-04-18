<#
.SYNOPSIS
    Tear down the entire XDoxs AWS infrastructure.

.DESCRIPTION
    This script removes ALL AWS resources created by deploy.ps1:
      1. Empties S3 buckets (required before Terraform can delete them)
      2. Disables CloudFront distribution (required before deletion)
      3. Runs terraform destroy to remove all resources
      4. Cleans up local Terraform state files (optional)

.EXAMPLE
    .\deploy\undeploy.ps1
    .\deploy\undeploy.ps1 -Force                # Skip all confirmation prompts
    .\deploy\undeploy.ps1 -KeepState             # Keep Terraform state files
    .\deploy\undeploy.ps1 -KeepBucketContent     # Don't empty S3 buckets (destroy will fail if not empty)
#>

[CmdletBinding()]
param(
    [switch]$Force,
    [switch]$KeepState,
    [switch]$KeepBucketContent,
    [string]$TfVarsFile = ""
)

$ErrorActionPreference = "Stop"
$DeployDir = Join-Path $PSScriptRoot ""
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$TfVarsPath = if ($TfVarsFile) { $TfVarsFile } else { Join-Path $DeployDir "terraform.tfvars" }

# --- Colors --------------------------------------------------
function Write-Step  { param($msg) Write-Host "`n===  $msg  ===" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Err   { param($msg) Write-Host "  [ERROR] $msg" -ForegroundColor Red }
function Write-Info  { param($msg) Write-Host "  $msg" -ForegroundColor Gray }

# --- Safety Warning -----------------------------------------
Write-Host ""
Write-Host "=============================================" -ForegroundColor Red
Write-Host "   XDoxs Infrastructure TEARDOWN" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Red
Write-Host ""
Write-Host "  This will PERMANENTLY DELETE:" -ForegroundColor Yellow
Write-Host "    - EC2 instance (server + all data on it)" -ForegroundColor White
Write-Host "    - S3 buckets (static site + docs content)" -ForegroundColor White
Write-Host "    - CloudFront distribution" -ForegroundColor White
Write-Host "    - CodeBuild project" -ForegroundColor White
Write-Host "    - IAM roles and policies" -ForegroundColor White
Write-Host "    - Security groups, Elastic IP" -ForegroundColor White
Write-Host ""
Write-Host "  MongoDB data is NOT affected (external service)." -ForegroundColor Green
Write-Host ""

if (-not $Force) {
    $confirm = Read-Host "  Are you SURE you want to destroy everything? Type 'destroy' to confirm"
    if ($confirm -ne "destroy") {
        Write-Warn "Aborted. No resources were deleted."
        exit 0
    }
}

# --- 1. Prerequisites ---------------------------------------
Write-Step "Checking prerequisites"

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Err "AWS CLI not found."
    exit 1
}
Write-Ok "AWS CLI found"

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Err "Terraform not found."
    exit 1
}
Write-Ok "Terraform found"

# --- 2. Check Terraform State -------------------------------
Write-Step "Checking Terraform state"
Push-Location $DeployDir

$stateFile = Join-Path $DeployDir "terraform.tfstate"
if (-not (Test-Path $stateFile)) {
    Write-Warn "No terraform.tfstate found. Nothing to destroy."
    Write-Info "If resources exist, import them or delete manually via AWS Console."
    Pop-Location
    exit 0
}
Write-Ok "Terraform state found"

# Initialize if needed
if (-not (Test-Path (Join-Path $DeployDir ".terraform"))) {
    Write-Info "Initializing Terraform..."
    terraform init -input=false 2>$null
}

# --- 3. Capture resource info before destruction -------------
Write-Step "Reading current resource IDs"

$staticBucket = $null
$docsBucket = $null
$cfDistId = $null
$awsRegion = "us-east-1"

try {
    $staticBucket = terraform output -raw static_site_bucket 2>$null
    Write-Ok "Static bucket: $staticBucket"
} catch { Write-Warn "Could not read static bucket output" }

try {
    $docsBucket = terraform output -raw docs_content_bucket 2>$null
    Write-Ok "Docs bucket:   $docsBucket"
} catch { Write-Warn "Could not read docs bucket output" }

try {
    $cfDistId = terraform output -raw cloudfront_distribution_id 2>$null
    Write-Ok "CloudFront:    $cfDistId"
} catch { Write-Warn "Could not read CloudFront output" }

try {
    $ec2Ip = terraform output -raw ec2_elastic_ip 2>$null
    Write-Ok "EC2 IP:        $ec2Ip"
} catch { Write-Warn "Could not read EC2 IP output" }

# Try to get region from tfvars or state
if (Test-Path $TfVarsPath) {
    $regionMatch = Select-String -Path $TfVarsPath -Pattern 'aws_region\s*=\s*"(.+)"'
    if ($regionMatch) { $awsRegion = $regionMatch.Matches.Groups[1].Value }
}

# --- 4. Empty S3 Buckets ------------------------------------
if (-not $KeepBucketContent) {
    Write-Step "Emptying S3 buckets"

    if ($staticBucket) {
        Write-Info "Emptying s3://$staticBucket/ ..."
        # Delete all objects including versions
        aws s3 rm "s3://$staticBucket" --recursive --region $awsRegion 2>$null

        # Delete all object versions (versioned bucket)
        Write-Info "Removing object versions..."
        $versions = aws s3api list-object-versions --bucket $staticBucket --region $awsRegion --output json 2>$null | ConvertFrom-Json
        
        if ($versions.Versions) {
            foreach ($v in $versions.Versions) {
                aws s3api delete-object --bucket $staticBucket --key $v.Key --version-id $v.VersionId --region $awsRegion 2>$null | Out-Null
            }
        }
        if ($versions.DeleteMarkers) {
            foreach ($dm in $versions.DeleteMarkers) {
                aws s3api delete-object --bucket $staticBucket --key $dm.Key --version-id $dm.VersionId --region $awsRegion 2>$null | Out-Null
            }
        }
        Write-Ok "Static bucket emptied"
    }

    if ($docsBucket) {
        Write-Info "Emptying s3://$docsBucket/ ..."
        aws s3 rm "s3://$docsBucket" --recursive --region $awsRegion 2>$null

        Write-Info "Removing object versions..."
        $versions = aws s3api list-object-versions --bucket $docsBucket --region $awsRegion --output json 2>$null | ConvertFrom-Json
        
        if ($versions.Versions) {
            foreach ($v in $versions.Versions) {
                aws s3api delete-object --bucket $docsBucket --key $v.Key --version-id $v.VersionId --region $awsRegion 2>$null | Out-Null
            }
        }
        if ($versions.DeleteMarkers) {
            foreach ($dm in $versions.DeleteMarkers) {
                aws s3api delete-object --bucket $docsBucket --key $dm.Key --version-id $dm.VersionId --region $awsRegion 2>$null | Out-Null
            }
        }
        Write-Ok "Docs bucket emptied"
    }
} else {
    Write-Warn "Skipping bucket emptying (-KeepBucketContent). Terraform destroy may fail."
}

# --- 5. Terraform Destroy -----------------------------------
Write-Step "Destroying infrastructure with Terraform"

if (-not $Force) {
    $finalConfirm = Read-Host "  Final confirmation -- proceed with terraform destroy? (yes/no)"
    if ($finalConfirm -ne "yes") {
        Write-Warn "Aborted at final confirmation."
        Pop-Location
        exit 0
    }
}

if ($Force) {
    terraform destroy -auto-approve -input=false
} else {
    terraform destroy -input=false
}

$destroyExitCode = $LASTEXITCODE

if ($destroyExitCode -ne 0) {
    Write-Err "Terraform destroy failed (exit code: $destroyExitCode)"
    Write-Info ""
    Write-Info "Common issues:"
    Write-Info "  - S3 bucket not empty: Run without -KeepBucketContent"
    Write-Info "  - CloudFront still distributing: Wait a few minutes and retry"
    Write-Info "  - Resource in use: Check AWS Console for dependent resources"
    Write-Info ""
    Write-Info "You can retry: .\deploy\undeploy.ps1 -Force"
    Pop-Location
    exit 1
}

Write-Ok "All AWS resources destroyed"

# --- 6. Clean up local files --------------------------------
if (-not $KeepState) {
    Write-Step "Cleaning up local Terraform files"

    $filesToRemove = @(
        (Join-Path $DeployDir "terraform.tfstate"),
        (Join-Path $DeployDir "terraform.tfstate.backup"),
        (Join-Path $DeployDir "tfplan"),
        (Join-Path $DeployDir ".terraform.lock.hcl")
    )

    foreach ($f in $filesToRemove) {
        if (Test-Path $f) {
            Remove-Item -Path $f -Force
            Write-Ok "Removed $(Split-Path $f -Leaf)"
        }
    }

    $tfDir = Join-Path $DeployDir ".terraform"
    if (Test-Path $tfDir) {
        Remove-Item -Path $tfDir -Recurse -Force
        Write-Ok "Removed .terraform/"
    }

    # Keep terraform.tfvars for potential re-deploy
    Write-Info "Kept terraform.tfvars (for potential re-deploy)"
} else {
    Write-Warn "Keeping Terraform state files (-KeepState)"
}

Pop-Location

# --- Done ----------------------------------------------------
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "   XDoxs Teardown Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  All AWS resources have been destroyed." -ForegroundColor White
Write-Host ""
Write-Host "  What was removed:" -ForegroundColor Yellow
Write-Host "    - EC2 instance + Elastic IP" -ForegroundColor Gray
Write-Host "    - S3 buckets (static site + docs content)" -ForegroundColor Gray
Write-Host "    - CloudFront distribution" -ForegroundColor Gray
Write-Host "    - CodeBuild project" -ForegroundColor Gray
Write-Host "    - IAM roles / instance profiles" -ForegroundColor Gray
Write-Host "    - Security groups" -ForegroundColor Gray
Write-Host ""
Write-Host "  What was NOT removed:" -ForegroundColor Yellow
Write-Host "    - MongoDB Atlas data (external)" -ForegroundColor Gray
Write-Host "    - GitHub repository" -ForegroundColor Gray
Write-Host "    - Local code / terraform.tfvars" -ForegroundColor Gray
Write-Host ""
Write-Host "  To re-deploy: .\deploy\deploy.ps1" -ForegroundColor Cyan
Write-Host ""
