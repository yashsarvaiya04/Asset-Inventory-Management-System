namespace AssetManagement.Models;

public partial class Employee
{
    public int EmployeeId { get; set; }

    public string? EmployeeNo { get; set; }

    public int DepartmentId { get; set; }

    public string? DepartmentName { get; set; }

    public string FirstName { get; set; } = null!;

    public string MiddleName { get; set; } = null!;

    public string LastName { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string Designation { get; set; } = null!;

    public bool? LoginEnabled { get; set; }

    public string Email { get; set; } = null!;

    public long? PhoneNumber { get; set; }

    public string? Address { get; set; }

    public int? CountryId { get; set; }

    public string? CountryName { get; set; }

    public int? StateId { get; set; }

    public string? StateName { get; set; }

    public int? CityId { get; set; }

    public string? CityName { get; set; }

    public string? EmployeeImage { get; set; }

}
