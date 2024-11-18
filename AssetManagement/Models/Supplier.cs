namespace AssetManagement.Models;

public partial class Supplier
{
    public int? SupplierId { get; set; }

    public string? SupplierName { get; set; }
    
    public long? SupplierPhoneNumber { get; set; }

    public string? SupplierEmail { get; set; }

    public int? CountryId { get; set; }

    public string? CountryCode { get; set; }

    public string? CountryName { get; set; }

    public int? StateId { get; set; }

    public string? StateName { get; set; }

    public int? CityId { get; set; }

    public string? CityName { get; set; }

    public string? SupplierAddress { get; set; }

    public string? SupplierImage { get; set; }

}
