namespace AssetManagement.Models;

public partial class City
{
    public int CityId { get; set; }

    public string? CityName { get; set; }

    public int? StateId { get; set; }

    public string? StateName { get; set; }

    public int? CountryId { get; set; }

    public string? CountryName { get; set; }
}
