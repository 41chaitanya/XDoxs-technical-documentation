#!/bin/bash

# Upload sample docs to S3
# Usage: ./scripts/upload-samples.sh

export AWS_REGION=ap-south-2
export AWS_ACCESS_KEY_ID=AKIAUZPNLUN6VMYK274B
export AWS_SECRET_ACCESS_KEY=SXgno7S+6wfK+twdWJ40ZAaF7F4hGmT+VJ5oD+kz
export S3_DOCS_BUCKET=xdoxs-docs-656829

echo "🚀 Uploading sample docs to S3..."
npm run upload-samples
