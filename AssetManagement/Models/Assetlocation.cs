namespace AssetManagement.Models;

public partial class Assetlocation
{
    public int LocationId { get; set; }

    public int DepartmentId { get; set; }

    public string? DepartmentName { get; set; }

    public string? Address { get; set; }

    public string? LocationImage { get; set; }

}
