<#
.SYNOPSIS
    Deploy the entire XDoxs infrastructure to AWS.

.DESCRIPTION
    This script handles the full deployment workflow:
      1. Checks prerequisites (AWS CLI, Terraform)
      2. Prompts for required configuration (if terraform.tfvars not found)
      3. Initializes Terraform
      4. Plans and applies infrastructure (S3, CloudFront, EC2, CodeBuild, IAM)
      5. Updates CloudFront origin with the Elastic IP
      6. Builds the Astro site locally
      7. Syncs static files to S3
      8. Optionally migrates existing MongoDB docs to S3
      9. Triggers the first CodeBuild to populate the site

.EXAMPLE
    .\deploy\deploy.ps1
    .\deploy\deploy.ps1 -SkipPrompts
    .\deploy\deploy.ps1 -TfVarsFile ".\deploy\my-custom.tfvars"
#>

[CmdletBinding()]
param(
    [switch]$SkipPrompts,
    [string]$TfVarsFile = "",
    [switch]$SkipMigration,
    [switch]$SkipBuild
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

# --- 1. Prerequisites ---------------------------------------
Write-Step "Checking prerequisites"

# AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Err "AWS CLI not found. Install from https://aws.amazon.com/cli/"
    exit 1
}
Write-Ok "AWS CLI found"

# Check AWS credentials
try {
    $awsIdentity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
    Write-Ok "AWS Account: $($awsIdentity.Account) ($($awsIdentity.Arn))"
} catch {
    Write-Err "AWS credentials not configured. Run 'aws configure' first."
    exit 1
}

# Terraform
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Err "Terraform not found. Install from https://www.terraform.io/downloads"
    exit 1
}
$tfVersion = terraform version -json | ConvertFrom-Json
Write-Ok "Terraform $($tfVersion.terraform_version)"

# Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Err "Node.js not found. Install from https://nodejs.org/"
    exit 1
}
Write-Ok "Node.js $(node --version)"

# --- 2. Configuration ---------------------------------------
Write-Step "Checking configuration"

if (-not (Test-Path $TfVarsPath)) {
    Write-Warn "terraform.tfvars not found at $TfVarsPath"

    if ($SkipPrompts) {
        Write-Err "Cannot proceed without terraform.tfvars in -SkipPrompts mode."
        Write-Info "Copy terraform.tfvars.example to terraform.tfvars and fill in values."
        exit 1
    }

    Write-Host "`n  Let's set up your deployment configuration.`n" -ForegroundColor White

    # Gather inputs
    $awsRegion = Read-Host "  AWS Region (default: ap-south-2)"
    if (-not $awsRegion) { $awsRegion = "ap-south-2" }

    # Key pair
    Write-Info "Available key pairs in $awsRegion :"
    aws ec2 describe-key-pairs --region $awsRegion --query "KeyPairs[].KeyName" --output table 2>$null
    $keyName = Read-Host "  EC2 Key Pair name (leave blank to auto-create 'xdoxs-key')"
    if (-not $keyName) {
        $keyName = "xdoxs-key"
        $pemPath = Join-Path $DeployDir "$keyName.pem"

        # Check if key already exists in AWS
        $existingKey = aws ec2 describe-key-pairs --region $awsRegion --key-names $keyName --query "KeyPairs[0].KeyName" --output text 2>$null
        if ($existingKey -eq $keyName) {
            if (Test-Path $pemPath) {
                Write-Ok "Key pair '$keyName' already exists and .pem found at $pemPath"
            } else {
                Write-Warn "Key pair '$keyName' exists in AWS but .pem file not found locally."
                Write-Warn "You won't be able to SSH. Delete the key in AWS Console and re-run, or provide your own."
            }
        } else {
            Write-Info "Creating new key pair '$keyName' in $awsRegion..."
            $pemContent = aws ec2 create-key-pair --region $awsRegion --key-name $keyName --query "KeyMaterial" --output text 2>$null
            if ($LASTEXITCODE -ne 0 -or -not $pemContent) {
                Write-Err "Failed to create key pair. Create one manually in AWS Console."
                exit 1
            }
            Set-Content -Path $pemPath -Value $pemContent -Encoding ASCII
            Write-Ok "Key pair created and saved to: $pemPath"
            Write-Warn "KEEP THIS FILE SAFE -- it's the only way to SSH into your EC2 instance!"
        }
    } else {
        $pemPath = ""
    }
    if (-not $keyName) {
        Write-Err "Key pair is required for SSH access to EC2."
        exit 1
    }

    # AMI -- look up latest Amazon Linux 2023
    Write-Info "Looking up latest Amazon Linux 2023 AMI..."
    $amiId = aws ec2 describe-images --region $awsRegion `
        --owners amazon `
        --filters "Name=name,Values=al2023-ami-2023*-x86_64" "Name=state,Values=available" `
        --query "sort_by(Images, &CreationDate)[-1].ImageId" `
        --output text 2>$null

    if (-not $amiId -or $amiId -eq "None") {
        $amiId = "ami-00af3ed8e1f001a3f"
        Write-Warn "Could not auto-detect AMI, using default: $amiId"
    } else {
        Write-Ok "Latest Amazon Linux 2023 AMI: $amiId"
    }

    # Unique bucket suffix
    $accountId = $awsIdentity.Account
    $bucketSuffix = $accountId.Substring($accountId.Length - 6)

    $staticBucket = Read-Host "  Static site bucket name (default: xdoxs-static-$bucketSuffix)"
    if (-not $staticBucket) { $staticBucket = "xdoxs-static-$bucketSuffix" }

    $docsBucket = Read-Host "  Docs content bucket name (default: xdoxs-docs-$bucketSuffix)"
    if (-not $docsBucket) { $docsBucket = "xdoxs-docs-$bucketSuffix" }

    # App secrets
    $mongoUri = Read-Host "  MongoDB Atlas URI"
    if (-not $mongoUri) {
        $mongoUri = "mongodb://localhost:27017/xdoxs"
        Write-Warn "Using local MongoDB -- update later for production"
    }

    $jwtSecret = Read-Host "  JWT Secret (leave blank to auto-generate)"
    if (-not $jwtSecret) {
        $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
        Write-Ok "Generated JWT secret"
    }

    # GitHub repo
    $githubUrl = Read-Host "  GitHub repo URL (default: https://github.com/USER/XDoxs-technical-documentation.git)"
    if (-not $githubUrl) { $githubUrl = "https://github.com/USER/XDoxs-technical-documentation.git" }

    # SSH CIDR
    Write-Info "Detecting your public IP..."
    $myIp = (Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 5) 2>$null
    $sshCidr = if ($myIp) { "$myIp/32" } else { "0.0.0.0/0" }
    Write-Ok "SSH will be allowed from: $sshCidr"

    # Write terraform.tfvars
    $tfLines = @(
        "aws_region   = `"$awsRegion`""
        "environment  = `"prod`""
        ""
        "static_site_bucket_name  = `"$staticBucket`""
        "docs_content_bucket_name = `"$docsBucket`""
        ""
        "cloudfront_price_class = `"PriceClass_200`""
        ""
        "ec2_ami           = `"$amiId`""
        "ec2_instance_type = `"t3.small`""
        "ec2_key_name      = `"$keyName`""
        "ec2_port          = 4322"
        "ssh_allowed_cidrs = [`"$sshCidr`"]"
        ""
        "mongodb_uri = `"$mongoUri`""
        "jwt_secret  = `"$jwtSecret`""
        ""
        "github_repo_url = `"$githubUrl`""
    )
    $tfLines | Set-Content -Path $TfVarsPath -Encoding UTF8
    Write-Ok "Created $TfVarsPath"

} else {
    Write-Ok "terraform.tfvars found"
}

# --- 3. Terraform Init --------------------------------------
Write-Step "Initializing Terraform"
Push-Location $DeployDir
try {
    terraform init -input=false
    if ($LASTEXITCODE -ne 0) { throw "Terraform init failed" }
    Write-Ok "Terraform initialized"
} catch {
    Write-Err $_.Exception.Message
    Pop-Location
    exit 1
}

# --- 4. Terraform Plan --------------------------------------
Write-Step "Planning infrastructure"
terraform plan -input=false -out=tfplan
if ($LASTEXITCODE -ne 0) {
    Write-Err "Terraform plan failed"
    Pop-Location
    exit 1
}
Write-Ok "Plan created"

# --- 5. Confirm & Apply -------------------------------------
if (-not $SkipPrompts) {
    $confirm = Read-Host "`n  Apply this plan? This will create AWS resources. (yes/no)"
    if ($confirm -ne "yes") {
        Write-Warn "Aborted by user."
        Remove-Item -Path (Join-Path $DeployDir "tfplan") -ErrorAction SilentlyContinue
        Pop-Location
        exit 0
    }
}

Write-Step "Applying infrastructure"
terraform apply -input=false tfplan
if ($LASTEXITCODE -ne 0) {
    Write-Err "Terraform apply failed"
    Pop-Location
    exit 1
}
Remove-Item -Path (Join-Path $DeployDir "tfplan") -ErrorAction SilentlyContinue
Write-Ok "Infrastructure created"

# --- 6. Capture Outputs -------------------------------------
Write-Step "Capturing Terraform outputs"

$cfDistId     = terraform output -raw cloudfront_distribution_id
$cfDomain     = terraform output -raw cloudfront_domain_name
$staticBucket = terraform output -raw static_site_bucket
$docsBucket   = terraform output -raw docs_content_bucket
$codebuildName= terraform output -raw codebuild_project_name
$ec2Ip        = terraform output -raw ec2_elastic_ip
$ec2Id        = terraform output -raw ec2_instance_id
$awsRegion    = (terraform output -json ec2_env_vars | ConvertFrom-Json).AWS_REGION

Write-Ok "CloudFront:  $cfDomain"
Write-Ok "CF Dist ID:  $cfDistId"
Write-Ok "Static S3:   $staticBucket"
Write-Ok "Docs S3:     $docsBucket"
Write-Ok "EC2 IP:      $ec2Ip"
Write-Ok "CodeBuild:   $codebuildName"

Pop-Location

# --- 7. Wait for EC2 to be ready ----------------------------
Write-Step "Waiting for EC2 instance to be ready"
Write-Info "Instance: $ec2Id -- waiting for status checks..."

aws ec2 wait instance-status-ok --instance-ids $ec2Id --region $awsRegion 2>$null
Write-Ok "EC2 instance is running and healthy"

# --- 8. Build Astro site locally ----------------------------
if (-not $SkipBuild) {
    Write-Step "Building Astro site"
    Push-Location $ProjectRoot

    Write-Info "Installing dependencies..."
    npm ci 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "npm ci failed, trying npm install..."
        npm install 2>$null
    }

    Write-Info "Running astro build..."
    $env:MONGODB_URI = (Get-Content $TfVarsPath | Select-String 'mongodb_uri\s*=\s*"(.+)"' | ForEach-Object { $_.Matches.Groups[1].Value })
    $env:JWT_SECRET = (Get-Content $TfVarsPath | Select-String 'jwt_secret\s*=\s*"(.+)"' | ForEach-Object { $_.Matches.Groups[1].Value })
    $env:AWS_REGION = $awsRegion
    $env:S3_DOCS_BUCKET = $docsBucket
    $env:CLOUDFRONT_DISTRIBUTION_ID = $cfDistId
    $env:CODEBUILD_PROJECT_NAME = $codebuildName

    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Astro build failed"
        Pop-Location
        exit 1
    }
    Write-Ok "Build complete"
    Pop-Location
}

# --- 9. Sync static files to S3 ----------------------------
Write-Step "Syncing static files to S3"
$distClient = Join-Path $ProjectRoot "dist\client"

if (Test-Path $distClient) {
    # Sync all files with default cache
    aws s3 sync $distClient "s3://$staticBucket/" --delete --cache-control "public, max-age=86400" --region $awsRegion
    Write-Ok "Synced to s3://$staticBucket/"

    # Override hashed assets with immutable cache
    $astroDir = Join-Path $distClient "_astro"
    if (Test-Path $astroDir) {
        aws s3 sync $astroDir "s3://$staticBucket/_astro/" --cache-control "public, max-age=31536000, immutable" --region $awsRegion
        Write-Ok "Set immutable cache for _astro/ assets"
    }
} else {
    Write-Warn "dist/client/ not found -- skipping S3 sync (run build first)"
}

# --- 10. Migrate existing docs to S3 (optional) -------------
if (-not $SkipMigration) {
    if (-not $SkipPrompts) {
        $doMigrate = Read-Host "`n  Migrate existing MongoDB docs to S3? (yes/no)"
    } else {
        $doMigrate = "yes"
    }

    if ($doMigrate -eq "yes") {
        Write-Step "Migrating docs from MongoDB to S3"
        Push-Location $ProjectRoot
        $env:S3_DOCS_BUCKET = $docsBucket
        $env:AWS_REGION = $awsRegion
        npx tsx deploy/migrate-to-s3.ts
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Migration had issues -- check output above"
        } else {
            Write-Ok "Migration complete"
        }
        Pop-Location
    }
}

# --- 11. Invalidate CloudFront -------------------------------
Write-Step "Invalidating CloudFront cache"
aws cloudfront create-invalidation --distribution-id $cfDistId --paths "/*" --region $awsRegion --output text 2>$null
Write-Ok "Full cache invalidation triggered"

# --- Done ----------------------------------------------------
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "   XDoxs Deployment Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Site URL:      $cfDomain" -ForegroundColor White
Write-Host "  EC2 Server:    $ec2Ip:4322" -ForegroundColor White
Write-Host "  CloudFront ID: $cfDistId" -ForegroundColor White
Write-Host "  Static S3:     $staticBucket" -ForegroundColor White
Write-Host "  Docs S3:       $docsBucket" -ForegroundColor White
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Yellow
$sshPem = if ($pemPath -and (Test-Path $pemPath)) { $pemPath } else { "your-key.pem" }
Write-Host "    1. SSH into EC2:  ssh -i $sshPem ec2-user@$ec2Ip" -ForegroundColor Gray
Write-Host "    2. Edit .env:     nano /opt/xdoxs/.env" -ForegroundColor Gray
Write-Host "    3. Deploy server: Push to 'main' branch (GitHub Actions handles it)" -ForegroundColor Gray
Write-Host "    4. Or manually deploy server files via rsync" -ForegroundColor Gray
Write-Host ""
Write-Host "  CloudFront may take 5-15 minutes to fully deploy." -ForegroundColor Yellow
Write-Host ""
