# ─── Required Variables ──────────────────────────────────────

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "ap-south-2"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

# ─── S3 ─────────────────────────────────────────────────────

variable "static_site_bucket_name" {
  description = "S3 bucket name for the built static site (must be globally unique)"
  type        = string
  default     = "xdoxs-static-site"
}

variable "docs_content_bucket_name" {
  description = "S3 bucket name for raw markdown content (must be globally unique)"
  type        = string
  default     = "xdoxs-docs-content"
}

# ─── CloudFront ─────────────────────────────────────────────

variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_200" # US, Canada, Europe, Asia, Middle East, Africa
}

# ─── EC2 ─────────────────────────────────────────────────────

variable "ec2_ami" {
  description = "AMI ID for the EC2 instance (Amazon Linux 2023 recommended)"
  type        = string
  # Amazon Linux 2023 in ap-south-2 (Hyderabad)
  default     = "ami-00af3ed8e1f001a3f"
}

variable "ec2_instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.small"
}

variable "ec2_key_name" {
  description = "EC2 SSH key pair name"
  type        = string
}

variable "ec2_port" {
  description = "Port the Astro server listens on"
  type        = number
  default     = 4322
}

variable "ssh_allowed_cidrs" {
  description = "CIDR blocks allowed to SSH into the EC2 instance"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Restrict this in production!
}

# ─── Application ────────────────────────────────────────────

variable "mongodb_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

# ─── GitHub ──────────────────────────────────────────────────

variable "github_repo_url" {
  description = "GitHub repository URL for CodeBuild source"
  type        = string
  default     = "https://github.com/YOUR_USERNAME/XDoxs-technical-documentation.git"
}
