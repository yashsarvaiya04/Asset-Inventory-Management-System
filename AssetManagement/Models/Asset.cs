namespace AssetManagement.Models;

public partial class Asset
{
    public int AssetId { get; set; }

    public string? AssetSerialNo { get; set; }

	public int CategoryId { get; set; }

    public string? CategoryName { get; set; }

    public int SubCategoryId { get; set; }

    public string SubCategoryName { get; set; } = null!;

    public string ManufactureName { get; set; } = null!;

    public string SupplierName { get; set; } = null!;

    public int? ManufactureId { get; set; }

    public int? SupplierId { get; set; }

    public int? LocationId { get; set; }

    public string?  LocationName { get; set; }

    public string? AssetName { get; set; }

    public int? Price { get; set; }

    public DateOnly? PurchaseDate { get; set; }

    public DateOnly? Warranty { get; set; }
    public string? BarcodeImage { get; set; }

    public string? Assetimage { get; set; }

    public bool Isavailable { get; set; } = true;


}
