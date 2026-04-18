#!/bin/bash
# ─────────────────────────────────────────────────────────────
# XDoxs EC2 Manual Setup Script
#
# Run this AFTER Terraform creates the EC2 instance,
# if the user data script didn't fully provision the server.
#
# Usage: ssh into EC2, then:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/deploy/setup-ec2.sh | bash
#   OR
#   scp deploy/setup-ec2.sh ec2-user@YOUR_IP:~ && ssh ec2-user@YOUR_IP ./setup-ec2.sh
# ─────────────────────────────────────────────────────────────

set -euo pipefail

echo "=== XDoxs EC2 Setup ==="

# ─── Detect OS ───────────────────────────────────────────────
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
else
  OS="unknown"
fi

echo "Detected OS: $OS"

# ─── Install Node.js 22 ─────────────────────────────────────
if ! command -v node &> /dev/null; then
  echo "Installing Node.js 22..."
  if [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ] || [ "$OS" = "centos" ]; then
    curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
    sudo yum install -y nodejs
  elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
    sudo apt-get install -y nodejs
  fi
else
  echo "Node.js already installed: $(node --version)"
fi

# ─── Install PM2 ────────────────────────────────────────────
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  sudo npm install -g pm2
else
  echo "PM2 already installed: $(pm2 --version)"
fi

# ─── Install Git ─────────────────────────────────────────────
if ! command -v git &> /dev/null; then
  echo "Installing Git..."
  if [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ]; then
    sudo yum install -y git
  elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt-get install -y git
  fi
fi

# ─── Create App Directory ───────────────────────────────────
sudo mkdir -p /opt/xdoxs/logs
sudo chown -R $(whoami):$(whoami) /opt/xdoxs

# ─── Setup PM2 Startup ──────────────────────────────────────
echo "Setting up PM2 startup..."
pm2 startup systemd -u $(whoami) --hp $HOME 2>/dev/null || true

# ─── Create .env Template ───────────────────────────────────
if [ ! -f /opt/xdoxs/.env ]; then
  cat > /opt/xdoxs/.env << 'EOF'
NODE_ENV=production
PORT=4322
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/xdoxs
JWT_SECRET=change-this-to-a-strong-secret
AWS_REGION=us-east-1
S3_DOCS_BUCKET=xdoxs-docs-content
CODEBUILD_PROJECT_NAME=xdoxs-build
CLOUDFRONT_DISTRIBUTION_ID=EXXXXXXXXX
EOF
  chmod 600 /opt/xdoxs/.env
  echo ""
  echo "⚠️  IMPORTANT: Edit /opt/xdoxs/.env with your actual values!"
  echo "   nano /opt/xdoxs/.env"
fi

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit /opt/xdoxs/.env with your MongoDB URI, JWT secret, and AWS values"
echo "  2. Deploy the app (GitHub Actions will handle this automatically)"
echo "  3. Or manually: cd /opt/xdoxs && npm ci --production && pm2 start ecosystem.config.cjs"
echo ""
