variable "aws_region" {
  type        = string
  default     = "ap-southeast-2"
  description = "AWS region to deploy into"
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "EC2 instance type"
}

variable "my_ip" {
  description = "Your public IP in CIDR format (e.g. 1.2.3..4/32).only this ip can ssh"
  type        = string

  validation {
    condition     = can(cidrhost(var.my_ip, 0))
    error_message = "mu_ip must be a CIDR like 1.2.3.4/32"
  }
}

variable "public_key_path" {
  description = "Path to your public key file"
  type        = string
  default     = "~/.ssh/calculator-devops.pub"
}

