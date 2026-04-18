# ─── Route53 ─────────────────────────────────────────────────────────────────
# Hosted zone must already exist — Terraform reads it, does not create it.
# (Creating a hosted zone changes the NS records at your registrar; that's a one-time manual step.)

data "aws_route53_zone" "zone" {
  name         = var.hosted_zone_name
  private_zone = false
}

# A-alias record: tools.architectwithappu.online → CloudFront distribution
resource "aws_route53_record" "site" {
  zone_id = data.aws_route53_zone.zone.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
