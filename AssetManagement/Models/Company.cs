namespace AssetManagement.Models;

public partial class Company
{
    public int CompanyId { get; set; }

    public string CompanyName { get; set; } = null!;

    public string CompanyAddress { get; set; } = null!;

    public int CityId { get; set; }

    public long CompanyPhoneNumber { get; set; }

    public string CompanyEmail { get; set; } = null!;

    public byte[]? CompanyLogo { get; set; }


}
