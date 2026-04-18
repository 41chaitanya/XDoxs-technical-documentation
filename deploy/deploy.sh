#!/bin/bash
# ─────────────────────────────────────────────────────────────
# XDoxs Deployment Helper
#
# Quick commands to manage the deployment from your local machine.
#
# Usage:
#   chmod +x deploy/deploy.sh
#   ./deploy/deploy.sh init         # Initialize Terraform
#   ./deploy/deploy.sh plan         # Preview changes
#   ./deploy/deploy.sh apply        # Apply infrastructure
#   ./deploy/deploy.sh output       # Show outputs
#   ./deploy/deploy.sh migrate      # Migrate docs to S3
#   ./deploy/deploy.sh build        # Trigger CodeBuild manually
#   ./deploy/deploy.sh invalidate   # Full CloudFront invalidation
#   ./deploy/deploy.sh destroy      # Tear down infrastructure
# ─────────────────────────────────────────────────────────────

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

case "${1:-help}" in

  init)
    echo "=== Initializing Terraform ==="
    terraform init
    ;;

  plan)
    echo "=== Planning Infrastructure ==="
    terraform plan
    ;;

  apply)
    echo "=== Applying Infrastructure ==="
    terraform apply
    ;;

  output)
    echo "=== Infrastructure Outputs ==="
    terraform output
    echo ""
    echo "=== Site URL ==="
    terraform output -raw cloudfront_domain_name
    echo ""
    ;;

  migrate)
    echo "=== Migrating docs to S3 ==="
    cd "$SCRIPT_DIR/.."
    npx tsx deploy/migrate-to-s3.ts
    ;;

  build)
    echo "=== Triggering CodeBuild ==="
    PROJECT=$(terraform output -raw codebuild_project_name 2>/dev/null || echo "xdoxs-build")
    REGION=$(terraform output -json ec2_env_vars 2>/dev/null | jq -r '.AWS_REGION' || echo "us-east-1")
    aws codebuild start-build \
      --project-name "$PROJECT" \
      --region "$REGION" \
      --environment-variables-override \
        "name=INVALIDATION_TYPE,value=full,type=PLAINTEXT"
    echo "Build triggered. Check AWS Console → CodeBuild for status."
    ;;

  invalidate)
    echo "=== Full CloudFront Invalidation ==="
    DIST_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
    if [ -z "$DIST_ID" ]; then
      echo "Error: Could not get distribution ID from Terraform output."
      echo "Usage: aws cloudfront create-invalidation --distribution-id YOUR_ID --paths '/*'"
      exit 1
    fi
    aws cloudfront create-invalidation \
      --distribution-id "$DIST_ID" \
      --paths "/*"
    echo "Invalidation created."
    ;;

  destroy)
    echo "=== ⚠️  Destroying Infrastructure ==="
    echo "This will delete ALL resources. Are you sure? (Ctrl+C to cancel)"
    terraform destroy
    ;;

  help|*)
    echo "XDoxs Deployment Helper"
    echo ""
    echo "Usage: ./deploy/deploy.sh <command>"
    echo ""
    echo "Commands:"
    echo "  init        Initialize Terraform"
    echo "  plan        Preview infrastructure changes"
    echo "  apply       Apply infrastructure (create/update resources)"
    echo "  output      Show Terraform outputs (URLs, IDs)"
    echo "  migrate     Migrate existing MongoDB docs to S3"
    echo "  build       Trigger a CodeBuild run manually"
    echo "  invalidate  Full CloudFront cache invalidation"
    echo "  destroy     Tear down all infrastructure"
    echo ""
    ;;

esac
