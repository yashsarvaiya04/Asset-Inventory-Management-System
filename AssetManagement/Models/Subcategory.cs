namespace AssetManagement.Models;

public partial class Subcategory
{
    public int SubCategoryId { get; set; }

    public int? CategoryId { get; set; }

    public string? CategoryName { get; set; }

    public string? SubCategoryName { get; set; }

    public string? Description { get; set; }

    public string? SubCategoryLogo { get; set; }
}
