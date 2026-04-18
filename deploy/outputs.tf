# ─── Outputs ─────────────────────────────────────────────────

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "CloudFront domain name (your site URL)"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "static_site_bucket" {
  description = "S3 bucket for static site files"
  value       = aws_s3_bucket.static_site.id
}

output "docs_content_bucket" {
  description = "S3 bucket for raw markdown content"
  value       = aws_s3_bucket.docs_content.id
}

output "codebuild_project_name" {
  description = "CodeBuild project name"
  value       = aws_codebuild_project.site_build.name
}

output "ec2_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.server.id
}

output "ec2_elastic_ip" {
  description = "EC2 Elastic IP address"
  value       = aws_eip.server.public_ip
}

output "ec2_instance_profile" {
  description = "EC2 IAM instance profile name"
  value       = aws_iam_instance_profile.ec2_profile.name
}

# ─── Environment Variables Summary ──────────────────────────

output "ec2_env_vars" {
  description = "Environment variables to set on EC2"
  sensitive   = true
  value = {
    MONGODB_URI                = var.mongodb_uri
    JWT_SECRET                 = var.jwt_secret
    AWS_REGION                 = var.aws_region
    S3_DOCS_BUCKET             = aws_s3_bucket.docs_content.id
    CODEBUILD_PROJECT_NAME     = aws_codebuild_project.site_build.name
    CLOUDFRONT_DISTRIBUTION_ID = aws_cloudfront_distribution.main.id
    PORT                       = var.ec2_port
    NODE_ENV                   = "production"
  }
}
