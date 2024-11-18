namespace AssetManagement.Models
{
    public class CaptchaResponse
    {
        public bool Success { get; set; }
        public string? Challenge_ts { get; set; }
        public string? Hostname { get; set; }
        public List<string>? ErrorCodes { get; set; }
    }
}
