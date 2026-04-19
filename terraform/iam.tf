# ─── IAM User for GitHub Actions deploys ─────────────────────────────────────
# Uses long-lived access keys stored as GitHub secrets.
# Permissions are scoped to this bucket + distribution only.

resource "aws_iam_user" "github_actions_deploy" {
  name = "${var.project_name}-github-actions-deploy"
  path = "/ci/"
}

resource "aws_iam_user_policy" "github_actions_deploy" {
  name   = "deploy-policy"
  user   = aws_iam_user.github_actions_deploy.name
  policy = data.aws_iam_policy_document.deploy_permissions.json
}

data "aws_iam_policy_document" "deploy_permissions" {
  # S3: upload and remove stale files
  statement {
    sid    = "S3Sync"
    effect = "Allow"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:GetObject",
    ]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }

  statement {
    sid       = "S3List"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.site.arn]
  }

  # CloudFront: bust the cache after each deploy
  statement {
    sid       = "CloudFrontInvalidate"
    effect    = "Allow"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [aws_cloudfront_distribution.site.arn]
  }
}

# Access key — stored in Terraform state.
# After apply, run: terraform output -raw aws_access_key_id
#                   terraform output -raw aws_secret_access_key
resource "aws_iam_access_key" "github_actions_deploy" {
  user = aws_iam_user.github_actions_deploy.name
}
