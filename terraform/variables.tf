variable "aws_region" {
  description = "Primary AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming and tagging"
  type        = string
  default     = "toolithic"
}

variable "bucket_name" {
  description = "S3 bucket name for static site assets"
  type        = string
  default     = "toolithic-prod"
}

variable "domain_name" {
  description = "Full subdomain for the site (e.g. tools.architectwithappu.online)"
  type        = string
  default     = "tools.architectwithappu.online"
}

variable "hosted_zone_name" {
  description = "Route53 hosted zone root domain (must already exist)"
  type        = string
  default     = "architectwithappu.online"
}

variable "github_org" {
  description = "GitHub org or username (used for OIDC trust policy)"
  type        = string
  default     = "appugoudapatil"
}

variable "github_repo" {
  description = "GitHub repo name (used for OIDC trust policy)"
  type        = string
  default     = "my-master-tool-kit"
}
