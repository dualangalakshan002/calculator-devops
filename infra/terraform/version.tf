terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  #these tags are added to every resource automatically
  default_tags {
    tags = {
      Project  = "calculator-devops"
      ManageBy = "terraform"
    }
  }
}
