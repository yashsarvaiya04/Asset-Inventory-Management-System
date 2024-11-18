namespace AssetManagement.Models;


public partial class Manufacturer
{
    public int? ManufactureId { get; set; }

    public string? ManufactureName { get; set; }

    public string? Url { get; set; }

    public string? Address { get; set; }

    public int? CityId { get; set; }

    public string? CityName { get; set; }

    public int StateId { get; set; }

    public string? StateName { get; set; }

    public int? CountryId { get; set; }

    public string? CountryName { get; set; }

    public string? CountryCode { get; set; }

    public long? SupportPhoneNumber { get; set; }

    public string? SupportEmail { get; set; }

}
