namespace AssetManagement.Models;

public partial class Maintenance
{
    public int? MaintenanceId { get; set; }

    public int? CategoryId { get; set; }

    public string? CategoryName { get; set; }

    public int? SubCategoryId { get; set; }

    public string? SubCategoryName { get; set; }

    public int? AssetId { get; set; }

    public string? AssetName { get; set; }

    public string? Description { get; set; }

    public DateOnly? ScheduleDate { get; set; }

    public DateOnly? CompletionDate { get; set; }


}
