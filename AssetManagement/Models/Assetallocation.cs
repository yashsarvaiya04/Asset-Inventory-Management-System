namespace AssetManagement.Models;

public partial class Assetallocation
{
    public int? AllocationId { get; set; }

    public int? DepartmentId { get; set; }

    public string? DepartmentName { get; set; }

    public int EmployeeId { get; set; }

    public string? EmployeeNo { get; set; }

    public string? EmployeeName { get; set; }

    public string? EmployeeEmail { get; set; }

    public string? PhoneCountryCode { get; set; }

    public long? PhoneNumber { get; set; }

    public int? CategoryId { get; set; }

    public string? CategoryName { get; set; }

    public int? SubCategoryId { get; set; }

    public string? SubCategoryName { get; set; }

    public int AssetId { get; set; }

    public string? AssetSerialNo { get; set; }

    public string? AssetName { get; set; }

    public DateOnly? AssignedDate { get; set; }

    public DateOnly? FreeDate { get; set; }

}
