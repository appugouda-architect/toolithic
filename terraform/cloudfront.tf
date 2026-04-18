# ─── Origin Access Control ────────────────────────────────────────────────────
# OAC signs requests to S3 with SigV4 — replaces the legacy OAI approach

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project_name}-oac"
  description                       = "OAC for ${var.domain_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ─── CloudFront Function ──────────────────────────────────────────────────────
# Rewrites /about/ → /about/index.html so Next.js static routes work correctly

resource "aws_cloudfront_function" "index_router" {
  name    = "${var.project_name}-index-router"
  runtime = "cloudfront-js-2.0"
  comment = "Rewrite directory requests to index.html for Next.js static export"
  publish = true
  code    = file("${path.module}/cf-functions/index-router.js")
}

# ─── CloudFront Distribution ──────────────────────────────────────────────────

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "${var.project_name} static site"
  aliases             = [var.domain_name]

  # ── Origin: S3 via OAC ──
  origin {
    origin_id                = "${var.project_name}-s3-origin"
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # ── Default cache behaviour ──
  default_cache_behavior {
    target_origin_id       = "${var.project_name}-s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # AWS managed CachingOptimized policy (cache-control headers respected, TTL optimised)
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.index_router.arn
    }
  }

  # ── SPA-style error handling ──
  # S3 returns 403 (not 404) for missing objects when public access is blocked.
  # Redirect both to index.html so the Next.js client router handles the path.
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.site.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  # Distribution must exist before the S3 bucket policy can reference its ARN
  depends_on = [aws_s3_bucket_public_access_block.site]
}
