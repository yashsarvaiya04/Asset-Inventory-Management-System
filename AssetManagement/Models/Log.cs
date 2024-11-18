namespace AssetManagement.Models
{
    public class Log
    {
        public int LogId { get; set; }

        public string? EntityName { get; set; }

        public string? EntityTableName { get; set; }

        public string? Description { get; set; }

        public string? Action { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }
    }

}
