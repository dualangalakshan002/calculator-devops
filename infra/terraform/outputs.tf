output "public_ip" {
  description = "Public IP of the server"
  value       = aws_instance.app.public_ip
}

output "ssh_command" {
  description = "Command to SSH into the server"
  value       = "ssh -i ~/.ssh/calculator-devops ubuntu@${aws_instance.app.public_ip}"
}

output "app_url" {
  description = "URL of the app (after Step 5C deploy)"
  value       = "http://${aws_instance.app.public_ip}"
}