output "site_url" {
  description = "Live site URL"
  value       = "https://${var.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — add as GitHub secret CLOUDFRONT_DISTRIBUTION_ID"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain" {
  description = "CloudFront domain (use this to verify before DNS cutover)"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name — add as GitHub secret S3_BUCKET_NAME"
  value       = aws_s3_bucket.site.bucket
}

output "aws_access_key_id" {
  description = "GitHub Actions deploy user access key ID — add as GitHub secret AWS_ACCESS_KEY_ID"
  value       = aws_iam_access_key.github_actions_deploy.id
  sensitive   = true
}

output "aws_secret_access_key" {
  description = "GitHub Actions deploy user secret key — add as GitHub secret AWS_SECRET_ACCESS_KEY"
  value       = aws_iam_access_key.github_actions_deploy.secret
  sensitive   = true
}
