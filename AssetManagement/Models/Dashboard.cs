namespace AssetManagement.Models
{
    public class Dashboard
    {
        public int? AvailableAssetCount { get; set; }
        public int? AllocatedAssetCount { get; set; }
        public int? MaintenanceAssetCount { get; set; }
        public int? FreeAssetCount { get; set; }
        public Dictionary<string, long>? SubcategoriesCount { get; set; }
        public Dictionary<int, int>? AssetAllocationsPerYear { get; set; }
        public List<string>? DepartmentNames { get; set; }
        public List<int>? AllocationCounts { get; set; }
        public Employee? Employee { get; set; }
    }
}
