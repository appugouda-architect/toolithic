# ─── GitHub Actions — OIDC Keyless Auth ──────────────────────────────────────
# Instead of long-lived access keys, GitHub Actions exchanges a short-lived OIDC
# token for temporary AWS credentials. No secrets to rotate or leak.

# GitHub's OIDC provider (one per AWS account — idempotent)
resource "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"

  client_id_list = ["sts.amazonaws.com"]

  # AWS validates GitHub OIDC via its own trust store — thumbprints are still
  # required by the resource schema but are not used for verification.
  # Both values below are GitHub's published thumbprints (primary + backup).
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd"
  ]
}

# IAM role assumed by GitHub Actions during the deploy workflow
resource "aws_iam_role" "github_actions_deploy" {
  name        = "${var.project_name}-github-actions-deploy"
  description = "Assumed by GitHub Actions to deploy ${var.project_name}"

  assume_role_policy = data.aws_iam_policy_document.github_oidc_trust.json
}

data "aws_iam_policy_document" "github_oidc_trust" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    # aud must always equal sts.amazonaws.com when using aws-actions/configure-aws-credentials
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Wildcard on the sub claim covers all trigger types (push, workflow_dispatch,
    # pull_request, etc.) while still locking access to this specific repo only.
    # Format: repo:<org>/<repo>:<context> where context varies by trigger type.
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_org}/${var.github_repo}:*"]
    }
  }
}

# Minimal permissions: sync S3 + invalidate CloudFront cache
resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "deploy-policy"
  role   = aws_iam_role.github_actions_deploy.id
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
