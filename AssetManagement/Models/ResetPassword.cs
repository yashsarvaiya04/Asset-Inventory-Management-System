﻿namespace AssetManagement.Models
{
    public class ResetPassword
    {
        public string? Email { get; set; }

        public string? EmployeeId { get; set; }
        public string? Token { get; set; }
        public string? NewPassword { get; set; }
        public string? ConfirmPassword { get; set; }
    }
}
