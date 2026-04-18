output "site_url" {
  description = "Live site URL"
  value       = "https://${var.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID — used by GitHub Actions for cache invalidation"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain" {
  description = "CloudFront domain (use this to verify before DNS cutover)"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name — used by GitHub Actions for deployment sync"
  value       = aws_s3_bucket.site.bucket
}

output "github_actions_role_arn" {
  description = "IAM role ARN — paste this into GitHub Actions secret AWS_ROLE_ARN"
  value       = aws_iam_role.github_actions_deploy.arn
}
