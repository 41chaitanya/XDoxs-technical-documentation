#!/bin/bash
# ─────────────────────────────────────────────────────────────
# XDoxs EC2 User Data Script
# Runs once on instance launch to set up the server environment.
# ─────────────────────────────────────────────────────────────

set -euo pipefail
exec > >(tee /var/log/xdoxs-setup.log) 2>&1
echo "=== XDoxs EC2 Setup Started at $(date) ==="

# ─── System Updates ──────────────────────────────────────────
yum update -y

# ─── Install Node.js ${node_version} ────────────────────────
curl -fsSL https://rpm.nodesource.com/setup_${node_version}.x | bash -
yum install -y nodejs git

# ─── Install PM2 Globally ───────────────────────────────────
npm install -g pm2

# ─── Create App Directory ───────────────────────────────────
mkdir -p /opt/xdoxs
chown ec2-user:ec2-user /opt/xdoxs

# ─── Write Environment File ─────────────────────────────────
cat > /opt/xdoxs/.env << 'ENVEOF'
NODE_ENV=production
PORT=${app_port}
HOST=0.0.0.0
MONGODB_URI=${mongodb_uri}
JWT_SECRET=${jwt_secret}
AWS_REGION=${aws_region}
S3_DOCS_BUCKET=${s3_docs_bucket}
CODEBUILD_PROJECT_NAME=${codebuild_project_name}
CLOUDFRONT_DISTRIBUTION_ID=${cloudfront_dist_id}
ENVEOF

chown ec2-user:ec2-user /opt/xdoxs/.env
chmod 600 /opt/xdoxs/.env

# ─── PM2 Startup ────────────────────────────────────────────
# Configure PM2 to auto-start on boot
env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo "=== XDoxs EC2 Setup Complete at $(date) ==="
echo "=== Deploy your app to /opt/xdoxs and start with PM2 ==="
