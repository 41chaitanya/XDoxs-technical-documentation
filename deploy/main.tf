# ─────────────────────────────────────────────────────────────
# XDoxs Terraform Configuration
# 
# Infrastructure: S3 (static site + docs content) + CloudFront
#                 + CodeBuild + EC2 + IAM
#
# Usage:
#   cd deploy
#   terraform init
#   terraform plan -var="mongodb_uri=YOUR_URI" -var="jwt_secret=YOUR_SECRET"
#   terraform apply -var="mongodb_uri=YOUR_URI" -var="jwt_secret=YOUR_SECRET"
# ─────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ─── Data Sources ────────────────────────────────────────────

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ─── VPC & Networking ────────────────────────────────────────

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name    = "xdoxs-vpc"
    Project = "xdoxs"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name    = "xdoxs-igw"
    Project = "xdoxs"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name    = "xdoxs-public-subnet"
    Project = "xdoxs"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name    = "xdoxs-public-rt"
    Project = "xdoxs"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ─── Elastic IP (allocated early for CloudFront origin) ─────

resource "aws_eip" "server" {
  domain = "vpc"

  tags = {
    Name    = "xdoxs-eip"
    Project = "xdoxs"
  }
}

locals {
  ec2_origin_domain = coalesce(
    aws_eip.server.public_dns,
    "ec2-${replace(aws_eip.server.public_ip, ".", "-")}.${var.aws_region}.compute.amazonaws.com"
  )
}

# ─── S3: Static Site Bucket ─────────────────────────────────

resource "aws_s3_bucket" "static_site" {
  bucket        = var.static_site_bucket_name
  force_destroy = true

  tags = {
    Project     = "xdoxs"
    Purpose     = "static-site"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "static_site" {
  bucket = aws_s3_bucket.static_site.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ─── S3: Docs Content Bucket (raw MD files) ─────────────────

resource "aws_s3_bucket" "docs_content" {
  bucket        = var.docs_content_bucket_name
  force_destroy = true

  tags = {
    Project     = "xdoxs"
    Purpose     = "docs-markdown-content"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "docs_content" {
  bucket = aws_s3_bucket.docs_content.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "docs_content" {
  bucket = aws_s3_bucket.docs_content.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "docs_content" {
  bucket = aws_s3_bucket.docs_content.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET"]
    allowed_origins = ["*"]
    max_age_seconds = 3600
  }
}

# ─── CloudFront: Origin Access Control ──────────────────────

resource "aws_cloudfront_origin_access_control" "s3_oac" {
  name                              = "xdoxs-s3-oac"
  description                       = "OAC for XDoxs S3 static site"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ─── S3: Bucket Policy for CloudFront OAC ───────────────────

resource "aws_s3_bucket_policy" "static_site" {
  bucket = aws_s3_bucket.static_site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontOAC"
        Effect    = "Allow"
        Principal = { Service = "cloudfront.amazonaws.com" }
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.static_site.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.main.arn
          }
        }
      }
    ]
  })
}

# ─── CloudFront: Cache Policies ─────────────────────────────

resource "aws_cloudfront_cache_policy" "static_assets" {
  name        = "xdoxs-static-assets"
  comment     = "Immutable static assets (/_astro/*)"
  default_ttl = 31536000
  max_ttl     = 31536000
  min_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "html_pages" {
  name        = "xdoxs-html-pages"
  comment     = "HTML pages with moderate caching"
  default_ttl = 86400
  max_ttl     = 604800
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "none" }
    enable_accept_encoding_gzip   = true
    enable_accept_encoding_brotli = true
  }
}

resource "aws_cloudfront_cache_policy" "no_cache" {
  name        = "xdoxs-no-cache"
  comment     = "No caching for dynamic routes (API, admin, instructor)"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_gzip   = false
    enable_accept_encoding_brotli = false
  }
}

# ─── CloudFront: Origin Request Policy for EC2 ──────────────

resource "aws_cloudfront_origin_request_policy" "ec2_all" {
  name    = "xdoxs-ec2-all-viewer"
  comment = "Forward all viewer data to EC2 origin"

  cookies_config {
    cookie_behavior = "all"
  }
  headers_config {
    header_behavior = "allViewer"
  }
  query_strings_config {
    query_string_behavior = "all"
  }
}

# ─── CloudFront: Response Headers Policy ────────────────────

resource "aws_cloudfront_response_headers_policy" "security" {
  name    = "xdoxs-security-headers"
  comment = "Security headers for XDoxs"

  security_headers_config {
    content_type_options {
      override = true
    }
    frame_options {
      frame_option = "DENY"
      override     = true
    }
    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = true
      preload                    = true
      override                   = true
    }
  }
}

# ─── CloudFront Distribution ────────────────────────────────

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "XDoxs documentation site"
  price_class         = var.cloudfront_price_class
  wait_for_deployment = false

  # Origin 1: S3 static site (via OAC) — only for /_astro/* hashed assets
  origin {
    domain_name              = aws_s3_bucket.static_site.bucket_regional_domain_name
    origin_id                = "s3-static"
    origin_access_control_id = aws_cloudfront_origin_access_control.s3_oac.id
  }

  # Origin 2: EC2 server (handles ALL pages — prerendered + SSR + API)
  origin {
    domain_name = local.ec2_origin_domain
    origin_id   = "ec2-server"

    custom_origin_config {
      http_port              = var.ec2_port
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
      origin_read_timeout    = 60
      origin_keepalive_timeout = 60
    }
  }

  # Default behavior: EC2 server (all HTML pages, SSR routes, etc.)
  default_cache_behavior {
    target_origin_id           = "ec2-server"
    cache_policy_id            = aws_cloudfront_cache_policy.html_pages.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.ec2_all.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
  }

  # /_astro/* → S3 with immutable caching (1 year)
  ordered_cache_behavior {
    path_pattern               = "/_astro/*"
    target_origin_id           = "s3-static"
    cache_policy_id            = aws_cloudfront_cache_policy.static_assets.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
  }

  # /api/* → EC2 (no cache, pass everything through)
  ordered_cache_behavior {
    path_pattern               = "/api/*"
    target_origin_id           = "ec2-server"
    cache_policy_id            = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.ec2_all.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
  }

  # /admin/* → EC2 (no cache)
  ordered_cache_behavior {
    path_pattern               = "/admin/*"
    target_origin_id           = "ec2-server"
    cache_policy_id            = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.ec2_all.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
  }

  # /instructor/* → EC2 (no cache)
  ordered_cache_behavior {
    path_pattern               = "/instructor/*"
    target_origin_id           = "ec2-server"
    cache_policy_id            = aws_cloudfront_cache_policy.no_cache.id
    origin_request_policy_id   = aws_cloudfront_origin_request_policy.ec2_all.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Project     = "xdoxs"
    Environment = var.environment
  }
}

# ─── IAM: EC2 Instance Role ─────────────────────────────────

resource "aws_iam_role" "ec2_role" {
  name = "xdoxs-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project = "xdoxs"
  }
}

resource "aws_iam_role_policy" "ec2_policy" {
  name = "xdoxs-ec2-policy"
  role = aws_iam_role.ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3DocsContent"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.docs_content.arn,
          "${aws_s3_bucket.docs_content.arn}/*"
        ]
      },
      {
        Sid    = "CodeBuildTrigger"
        Effect = "Allow"
        Action = [
          "codebuild:StartBuild"
        ]
        Resource = [
          aws_codebuild_project.site_build.arn
        ]
      },
      {
        Sid    = "CloudFrontInvalidate"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = [
          aws_cloudfront_distribution.main.arn
        ]
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "xdoxs-ec2-profile"
  role = aws_iam_role.ec2_role.name
}

# ─── IAM: CodeBuild Service Role ────────────────────────────

resource "aws_iam_role" "codebuild_role" {
  name = "xdoxs-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project = "xdoxs"
  }
}

resource "aws_iam_role_policy" "codebuild_policy" {
  name = "xdoxs-codebuild-policy"
  role = aws_iam_role.codebuild_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3StaticSite"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.static_site.arn,
          "${aws_s3_bucket.static_site.arn}/*"
        ]
      },
      {
        Sid    = "CloudFrontInvalidate"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = [
          aws_cloudfront_distribution.main.arn
        ]
      },
      {
        Sid    = "CloudWatchLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = [
          "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/codebuild/xdoxs-build*"
        ]
      },
      {
        Sid    = "ECRAuth"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      }
    ]
  })
}

# ─── CodeBuild Project ──────────────────────────────────────

resource "aws_codebuild_project" "site_build" {
  name          = "xdoxs-build"
  description   = "Build XDoxs static site and deploy to S3"
  build_timeout = 15
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:5.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"

    environment_variable {
      name  = "MONGODB_URI"
      value = var.mongodb_uri
      type  = "PLAINTEXT"
    }

    environment_variable {
      name  = "JWT_SECRET"
      value = var.jwt_secret
      type  = "PLAINTEXT"
    }

    environment_variable {
      name  = "S3_STATIC_BUCKET"
      value = aws_s3_bucket.static_site.id
      type  = "PLAINTEXT"
    }

    environment_variable {
      name  = "S3_DOCS_BUCKET"
      value = aws_s3_bucket.docs_content.id
      type  = "PLAINTEXT"
    }

    environment_variable {
      name  = "CLOUDFRONT_DISTRIBUTION_ID"
      value = aws_cloudfront_distribution.main.id
      type  = "PLAINTEXT"
    }

    environment_variable {
      name  = "AWS_REGION"
      value = var.aws_region
      type  = "PLAINTEXT"
    }

    # These are overridden per-build by the approve/publish/unpublish API
    environment_variable {
      name  = "INVALIDATION_TYPE"
      value = "full"
      type  = "PLAINTEXT"
    }

    environment_variable {
      name  = "DOC_CATEGORY"
      value = ""
      type  = "PLAINTEXT"
    }

    environment_variable {
      name  = "DOC_SLUG"
      value = ""
      type  = "PLAINTEXT"
    }
  }

  source {
    type            = "GITHUB"
    location        = var.github_repo_url
    git_clone_depth = 1
    buildspec       = "deploy/buildspec.yml"

    git_submodules_config {
      fetch_submodules = false
    }
  }

  source_version = "main"

  logs_config {
    cloudwatch_logs {
      group_name  = "/aws/codebuild/xdoxs-build"
      stream_name = ""
    }
  }

  tags = {
    Project     = "xdoxs"
    Environment = var.environment
  }
}

# ─── EC2: Security Group ────────────────────────────────────

resource "aws_security_group" "ec2_sg" {
  name        = "xdoxs-ec2-sg"
  description = "Security group for XDoxs EC2 server"
  vpc_id      = aws_vpc.main.id

  # SSH access (open to all — secured by key-based auth, needed for CI/CD)
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # App port (CloudFront → EC2)
  ingress {
    description = "App port"
    from_port   = var.ec2_port
    to_port     = var.ec2_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # All outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project = "xdoxs"
    Name    = "xdoxs-ec2-sg"
  }
}

# ─── EC2 Instance ────────────────────────────────────────────

resource "aws_instance" "server" {
  ami                    = var.ec2_ami
  instance_type          = var.ec2_instance_type
  key_name               = var.ec2_key_name
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  subnet_id              = aws_subnet.public.id

  associate_public_ip_address = false # EIP handles public IP

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  user_data = templatefile("${path.module}/ec2-userdata.sh", {
    node_version = "22"
    app_port     = var.ec2_port
    mongodb_uri  = var.mongodb_uri
    jwt_secret   = var.jwt_secret
    aws_region   = var.aws_region
    s3_docs_bucket          = aws_s3_bucket.docs_content.id
    codebuild_project_name  = aws_codebuild_project.site_build.name
    cloudfront_dist_id      = aws_cloudfront_distribution.main.id
  })

  tags = {
    Name    = "xdoxs-server"
    Project = "xdoxs"
  }
}

# ─── Elastic IP Association ──────────────────────────────────

resource "aws_eip_association" "server" {
  instance_id   = aws_instance.server.id
  allocation_id = aws_eip.server.id
}
