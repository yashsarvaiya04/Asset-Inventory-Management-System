
using AssetManagement.Models;
using IronBarCode;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Npgsql;
using NpgsqlTypes;
using System.Data;
using System.Net;
using System.Net.Mail;

namespace AssetManagement.Controllers
{
    public class AssetController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment) : Controller
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;


        private readonly int _employeeId = (int)httpContextAccessor.HttpContext!.Session.GetInt32("EmployeeId")!;


        private readonly string _imageFolderPath = Path.Combine(hostingEnvironment.WebRootPath, "images");

        [HttpGet]
        public IActionResult Asset()
        {
            List<Asset> Asset = GetAssets();
            ViewData["AssetJson"] = JsonConvert.SerializeObject(Asset);
            ViewBag.categories = GetCategories();
            //ViewBag.subcategories = GetSubcategories();
            ViewBag.manufactures = GetManufacturers();
            ViewBag.suppliers = GetSuplier();
            return View();
        }



        public IActionResult AddAsset(Asset asset, IFormFile assetImage)
        {
            try
            {
                string imageName = string.Empty;

                if (assetImage != null && assetImage.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(assetImage.FileName);
                    string assetImagePath = Path.Combine(_imageFolderPath, "assetImages");
                    string imagePath = Path.Combine(assetImagePath, imageName);

                    if (!Directory.Exists(assetImagePath))
                    {
                        Directory.CreateDirectory(assetImagePath);
                    }

                    using var stream = new FileStream(imagePath, FileMode.Create);
                    assetImage.CopyTo(stream);
                }

                int newAssetId = 0;

                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    connection.Open();

                    using (var command = new NpgsqlCommand("SELECT public.addasset(@passetserialno,@psubcategoryid, @pmanufactureid, @psupplierid, @plocationid, @passetname, @pprice, @ppurchasedate, @pwarranty, @passetimage, @pcreatedby)", connection))
                    {
                        command.Parameters.AddWithValue("@passetserialno", asset.AssetSerialNo!);
                        command.Parameters.AddWithValue("@psubcategoryid", asset.SubCategoryId!);
                        command.Parameters.AddWithValue("@pmanufactureid", asset.ManufactureId!);
                        command.Parameters.AddWithValue("@psupplierid", asset.SupplierId!);
                        command.Parameters.AddWithValue("@plocationid", asset.LocationId!);
                        command.Parameters.AddWithValue("@passetname", asset.AssetName!);
                        command.Parameters.AddWithValue("@pprice", asset.Price!);
                        command.Parameters.AddWithValue("@ppurchasedate", asset.PurchaseDate!);
                        command.Parameters.AddWithValue("@pwarranty", asset.Warranty ?? (object)DBNull.Value);
                        command.Parameters.AddWithValue("@passetimage", string.IsNullOrWhiteSpace(imageName) ? DBNull.Value : (object)imageName);
                        command.Parameters.AddWithValue("@pcreatedby", _employeeId);

                        newAssetId = (int)command.ExecuteScalar()!;
                    }
                }

                if (newAssetId != 0)
                {
                    string barcodeImage = GenerateBarcode(newAssetId);
                    using (var connection = new NpgsqlConnection(_connectionString))
                    {
                        connection.Open();
                        using (var command = new NpgsqlCommand("UPDATE assets SET barcode = @barcodeImage WHERE assetid = @assetId", connection))
                        {
                            command.Parameters.AddWithValue("@barcodeImage", barcodeImage);
                            command.Parameters.AddWithValue("@assetId", newAssetId);
                            command.ExecuteNonQuery();
                        }
                    }
                }
                return Json(new { success = true, assetId = newAssetId });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = "Failed to add asset: " + ex.Message });
            }
        }

        public string GenerateBarcode(int assetId)
        {
            var barcodeWriter = BarcodeWriter.CreateBarcode(assetId.ToString(), BarcodeWriterEncoding.Code128);

            string barcodeImagePath = Path.Combine(_imageFolderPath, "barcodeImages");
            string barcodeImageName = Guid.NewGuid().ToString() + ".png";
            string barcodeImageFullPath = Path.Combine(barcodeImagePath, barcodeImageName);

            if (!Directory.Exists(barcodeImagePath))
            {
                Directory.CreateDirectory(barcodeImagePath);
            }

            barcodeWriter.SaveAsPng(barcodeImageFullPath);

            return barcodeImageName;
        }






        [HttpGet]
        public List<Asset> GetAssets()
        {
            List<Asset> Assets = [];


            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getassets()", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {

                    Asset asset = new()
                    {
                        AssetId = Convert.ToInt32(reader["assetid"]),
                        AssetSerialNo = Convert.ToString(reader["assetserialno"]),
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SupplierId = Convert.ToInt32(reader["supplierid"]),
                        ManufactureId = Convert.ToInt32(reader["manufactureid"]),
                        AssetName = Convert.ToString(reader["assetname"])!,
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,
                        ManufactureName = Convert.ToString(reader["manufacturename"])!,
                        SupplierName = Convert.ToString(reader["suppliername"])!,
                        Price = Convert.ToInt32(reader["price"]),
                        LocationId = Convert.ToInt32(reader["locationid"]),
                        LocationName = Convert.ToString(reader["locationaddress"]),
                        Assetimage = reader.IsDBNull(reader.GetOrdinal("assetimage")) ? "" : reader.GetString(reader.GetOrdinal("assetimage")),
                        BarcodeImage = reader.IsDBNull(reader.GetOrdinal("barcode")) ? "" : reader.GetString(reader.GetOrdinal("barcode")),
                        PurchaseDate = Convert.IsDBNull(reader["purchasedate"]) ? default : DateOnly.FromDateTime((DateTime)reader["purchasedate"]),
                        Warranty = Convert.IsDBNull(reader["warranty"]) ? default : DateOnly.FromDateTime((DateTime)reader["warranty"])

                    };
                    Assets.Add(asset);
                }
            }

            return Assets;
        }

        [HttpGet]
        public List<Category> GetCategories()
        {
            var categories = new List<Category>();


            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();


                using var cmd = new NpgsqlCommand("SELECT * FROM getcategories()", connection);
                cmd.CommandType = CommandType.Text;


                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {

                    var category = new Category
                    {
                        CategoryId = reader.GetInt32(reader.GetOrdinal("categoryid")),
                        CategoryName = reader.GetString(reader.GetOrdinal("categoryname")),
                        Description = reader.GetString(reader.GetOrdinal("description"))

                    };


                    categories.Add(category);
                }
            }

            return categories;
        }

        [HttpGet]
        public List<Subcategory> GetSubcategories(int categoryId)
        {
            var subcategories = new List<Subcategory>();

            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getsubcategoriesbycategoryid(" + categoryId + ")", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Subcategory subcategory = new()
                    {
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),

                    };
                    subcategories.Add(subcategory);
                }
            }

            return subcategories;
        }

        [HttpGet]
        public List<Manufacturer> GetManufacturers()
        {
            var manufacturers = new List<Manufacturer>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using var command = new NpgsqlCommand("SELECT * FROM getmanufacturers()", connection);
                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    var manufacturer = new Manufacturer
                    {
                        ManufactureId = reader.GetInt32(0),
                        ManufactureName = reader.GetString(1),

                    };

                    manufacturers.Add(manufacturer);
                }
            }

            return manufacturers;
        }

        [HttpGet]
        public List<Supplier> GetSuplier()
        {
            var supliers = new List<Supplier>();

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using var command = new NpgsqlCommand("SELECT * FROM getsuppliers()", connection);
                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    var suplier = new Supplier
                    {
                        SupplierId = reader.GetInt32(0),
                        SupplierName = reader.GetString(1),

                    };

                    supliers.Add(suplier);
                }
            }

            return supliers;
        }

        [HttpGet]
        public List<Assetlocation> GetAssetLocation()
        {
            List<Assetlocation> assetlocations = [];
            try
            {

                using NpgsqlConnection conn = new(_connectionString);
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getassetlocations()", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {

                    Assetlocation assetlocation = new()
                    {
                        LocationId = Convert.ToInt32(reader["locationid"]),
                        Address = Convert.ToString(reader["address"])!,

                    };
                    assetlocations.Add(assetlocation);
                }


            }
            catch
            {
                throw new Exception("");
            }
            return assetlocations;
        }

        [HttpPut]
        public IActionResult UpdateAsset(Asset asset, IFormFile? assetImage)
        {
            try
            {
                string imageName = string.Empty;
                if (assetImage != null && assetImage.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(assetImage.FileName);
                    string assetImagePath = Path.Combine(_imageFolderPath, "assetImages");

                    if (!Directory.Exists(assetImagePath))
                    {
                        Directory.CreateDirectory(assetImagePath);
                    }

                    string imagePath = Path.Combine(assetImagePath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    assetImage.CopyTo(stream);
                }

                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT public.updateasset(@AssetId, @SerialNo, @SubCategoryId, @ManufactureId, @SupplierId, @LocationId, @AssetName, @Price, @PurchaseDate, @Warranty, @AssetImage, @ModifiedBy)", connection);

                cmd.Parameters.AddWithValue("@AssetId", asset.AssetId);
                cmd.Parameters.AddWithValue("@SerialNo", asset.AssetSerialNo!);
                cmd.Parameters.AddWithValue("@SubCategoryId", asset.SubCategoryId);
                cmd.Parameters.AddWithValue("@ManufactureId", asset.ManufactureId!);
                cmd.Parameters.AddWithValue("@SupplierId", asset.SupplierId!);
                cmd.Parameters.AddWithValue("@LocationId", asset.LocationId!);
                cmd.Parameters.AddWithValue("@AssetName", asset.AssetName!);
                cmd.Parameters.AddWithValue("@Price", asset.Price!);
                cmd.Parameters.AddWithValue("@PurchaseDate", asset.PurchaseDate!);
                cmd.Parameters.AddWithValue("@Warranty", asset.Warranty ?? (object)DBNull.Value);


                if (!string.IsNullOrWhiteSpace(imageName))
                {
                    cmd.Parameters.AddWithValue("@AssetImage", imageName);
                }
                else
                {
                    cmd.Parameters.AddWithValue("@AssetImage", DBNull.Value);
                }

                cmd.Parameters.AddWithValue("@ModifiedBy", _employeeId);


                int rowsAffected = (int)cmd.ExecuteScalar()!;

                if (rowsAffected > 0)
                {
                    return Ok();
                }
                else
                {
                    return NotFound();
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while updating the asset: " + ex.Message);
            }
        }


        [HttpDelete]
        public IActionResult DeleteAsset(int AssetId)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                using var command = new NpgsqlCommand("SELECT public.deleteasset(@AssetId, @ModifyId)", connection);
                command.Parameters.AddWithValue("@AssetId", AssetId);
                command.Parameters.AddWithValue("@ModifyId", _employeeId);

                int rowsAffected = (int)command.ExecuteScalar()!;

                if (rowsAffected > 0)
                {
                    return Ok();
                }
                else
                {
                    return BadRequest("Failed to delete asset.");
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }


     

















        // Asset Allocation manage
        [HttpGet]
        public IActionResult AssetAllocation()
        {
            List<Assetallocation> assetAllocations = [];

            try
            {
                using NpgsqlConnection conn = new(_connectionString);
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getassetallocations()", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    // Mapping database records to AssetAllocation objects.
                    Assetallocation assetAllocation = new()
                    {
                        AllocationId = Convert.ToInt32(reader["allocationid"]),
                        DepartmentId = Convert.ToInt32(reader["departmentid"]),
                        DepartmentName = Convert.ToString(reader["departmentname"]),
                        EmployeeId = Convert.ToInt32(reader["employeeid"]),
                        EmployeeNo = Convert.ToString(reader["employeeserialno"])!,
                        EmployeeName = Convert.ToString(reader["firstname"])! + " " + Convert.ToString(reader["lastname"])!,
                        EmployeeEmail = Convert.ToString(reader["email"]),
                        PhoneCountryCode = Convert.ToString(reader["phonecountrycode"])!,
                        PhoneNumber = Convert.ToInt64(reader["phonenumber"]),
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"])!,
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,
                        AssetId = Convert.ToInt32(reader["assetid"]),
                        AssetSerialNo = Convert.ToString(reader["assetserialno"]),
                        AssetName = Convert.ToString(reader["assetname"])!,
                        AssignedDate = Convert.IsDBNull(reader["allocatedate"]) ? default : DateOnly.FromDateTime((DateTime)reader["allocatedate"]),
                        FreeDate = Convert.IsDBNull(reader["returnbydate"]) ? default : DateOnly.FromDateTime((DateTime)reader["returnbydate"])
                    };
                    assetAllocations.Add(assetAllocation);
                }
            }
            catch
            {
                throw new Exception("");
            }

            return View(assetAllocations);
        }

        [HttpPost]
        public IActionResult AddAssetAllocation(Assetallocation assetallocation)
        {
            try
            {
                // Check if the assetallocation object or its properties are null or invalid
                if (assetallocation == null || assetallocation.EmployeeId <= 0 || assetallocation.AssetId <= 0 || assetallocation.AssignedDate == null)
                {
                    return BadRequest(new { success = false, message = "Invalid asset allocation data. Please provide valid values." });
                }

                using NpgsqlConnection conn = new(_connectionString);
                using NpgsqlCommand cmd = new("SELECT * FROM addassetallocation(@EmployeeId,@AssetId,@AssignedDate,@CreatedBy)", conn);
                cmd.Parameters.AddWithValue("@EmployeeId", assetallocation.EmployeeId);
                cmd.Parameters.AddWithValue("@AssetId", assetallocation.AssetId);
                cmd.Parameters.AddWithValue("@AssignedDate", assetallocation.AssignedDate!);
                cmd.Parameters.AddWithValue("@CreatedBy", _employeeId!);
                conn.Open();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Assetallocation assetAllocation = new()
                    {
                        AllocationId = Convert.ToInt32(reader["insertallocationid"]),
                        DepartmentId = Convert.ToInt32(reader["departmentid"]),
                        DepartmentName = Convert.ToString(reader["departmentname"]),
                        EmployeeId = Convert.ToInt32(reader["employeeid"]),
                        EmployeeNo = Convert.ToString(reader["employeeserialno"])!,
                        EmployeeName = Convert.ToString(reader["firstname"])! + " " + Convert.ToString(reader["lastname"])!,
                        EmployeeEmail = Convert.ToString(reader["email"]),
                        PhoneCountryCode = Convert.ToString(reader["phonecountrycode"])!,
                        PhoneNumber = Convert.ToInt64(reader["phonenumber"]),
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"])!,
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,
                        AssetId = Convert.ToInt32(reader["assetid"]),
                        AssetSerialNo = Convert.ToString(reader["assetserialno"]),
                        AssetName = Convert.ToString(reader["assetname"])!,
                        AssignedDate = Convert.IsDBNull(reader["allocatedate"]) ? default : DateOnly.FromDateTime((DateTime)reader["allocatedate"]),
                        FreeDate = Convert.IsDBNull(reader["returnbydate"]) ? default : DateOnly.FromDateTime((DateTime)reader["returnbydate"])
                    };
                    SendEmail(assetAllocation.EmployeeEmail!, "Asset Allocated", "This is to inform you that a "+assetAllocation.AssetName + " has been Allocated to you as of "+assetallocation.AssignedDate+" by Admin.");
                    return Json(assetAllocation);
                }
                else
                {
                    // If no rows were affected, return a not found error
                    return NotFound(new { status = false, message = "Failed to fetch new allocation data. Please contact the administrator." });
                }
            }
            catch
            {
                // If an unexpected error occurs, log the exception and return a generic error message
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }

        [HttpPut]
        public IActionResult UpdateAssetAllocation(Assetallocation assetallocation)
        {
            try
            {
                // Check if the asset allocation ID is null or invalid
                if (assetallocation.AllocationId == null || assetallocation.AllocationId <= 0)
                {
                    return BadRequest(new { status = false, message = "Invalid asset allocation ID. Please provide a valid ID." });
                }

                using NpgsqlConnection conn = new(_connectionString);
                using NpgsqlCommand cmd = new("SELECT * FROM updateassetallocation(@AssetAllocationId,@AssetId,@AssignedDate,@FreeDate,@ModifiedBy)", conn);
                cmd.Parameters.AddWithValue("@AssetAllocationId", assetallocation.AllocationId);
                cmd.Parameters.AddWithValue("@AssetId", assetallocation.AssetId!);
                cmd.Parameters.AddWithValue("@AssignedDate", NpgsqlDbType.Date, assetallocation.AssignedDate.HasValue ? assetallocation.AssignedDate.Value : DBNull.Value);
                cmd.Parameters.AddWithValue("@FreeDate", NpgsqlDbType.Date, assetallocation.FreeDate.HasValue ? assetallocation.FreeDate : DBNull.Value);
                cmd.Parameters.AddWithValue("@ModifiedBy", _employeeId!);
                conn.Open();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Assetallocation updatedAssetAllocation = new()
                    {
                        AllocationId = Convert.ToInt32(reader["updateallocationid"]),
                        DepartmentId = Convert.ToInt32(reader["departmentid"]),
                        DepartmentName = Convert.ToString(reader["departmentname"]),
                        EmployeeId = Convert.ToInt32(reader["employeeid"]),
                        EmployeeNo = Convert.ToString(reader["employeeserialno"])!,
                        EmployeeName = Convert.ToString(reader["firstname"])! + " " + Convert.ToString(reader["lastname"])!,
                        EmployeeEmail = Convert.ToString(reader["email"]),
                        PhoneCountryCode = Convert.ToString(reader["phonecountrycode"])!,
                        PhoneNumber = Convert.ToInt64(reader["phonenumber"]),
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"])!,
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,
                        AssetId = Convert.ToInt32(reader["updatedassetid"]),
                        AssetSerialNo = Convert.ToString(reader["assetserialno"]),
                        AssetName = Convert.ToString(reader["assetname"])!,
                        AssignedDate = Convert.IsDBNull(reader["allocatedate"]) ? default : DateOnly.FromDateTime((DateTime)reader["allocatedate"]),
                        FreeDate = Convert.IsDBNull(reader["returnbydate"]) ? default : DateOnly.FromDateTime((DateTime)reader["returnbydate"])
                    };
                    if (assetallocation.FreeDate != null)
                    {
                        SendEmail(updatedAssetAllocation.EmployeeEmail!, "Asset Deallocated", "This is to inform you that a " + updatedAssetAllocation.AssetName + " has been Deallocated from your possession as of " + updatedAssetAllocation.FreeDate + " by Admin.");
                    }

                    return Json(updatedAssetAllocation);
                }
                else
                {
                    return NotFound(new { status = false, message = "Asset allocation not found. Please ensure the provided ID exists." });
                }
            }
            catch (NpgsqlException ex)
            {

                // Check the SQL state code to determine the type of exception
                switch (ex.SqlState)
                {
                    case "P0001": // Unique violation
                        return BadRequest(new { status = false, message = "This Asset Not Available" });
                    default:
                        throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
                }
            }
            catch
            {
                // Log the exception and return a generic error message
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }

        [HttpDelete]
        public IActionResult DeleteAssetAllocation(int allocationId)
        {
            try
            {
                if (allocationId <= 0)
                {
                    return BadRequest(new { status = false, message = "Invalid allocation ID. Please provide a valid ID." });
                }

                using NpgsqlConnection conn = new(_connectionString);
                using NpgsqlCommand cmd = new("SELECT * FROM deleteassetallocation(@AllocationId,@ModifiedBy)", conn);
                cmd.Parameters.AddWithValue("@AllocationId", allocationId);
                cmd.Parameters.AddWithValue("@ModifiedBy", _employeeId!);
                conn.Open();


                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Assetallocation deletedAssetAllocation = new()
                    {
                        EmployeeEmail = Convert.ToString(reader["email"]),
                        AssetName = Convert.ToString(reader["assetname"])!,
                    };

                    SendEmail(deletedAssetAllocation.EmployeeEmail!, "Deleted Allocated Asset", "We regret to inform you that due to some error the allocation of "+deletedAssetAllocation.AssetName + " was mistakenly Deleted. Please have patience as we assign you a new Asset.");
                    return Ok(JsonConvert.SerializeObject(new { status = true, message = "Allocation Deleted Successfully." }));
                }
                else
                {
                    return NotFound(new { status = false, message = "No asset allocation found with the provided ID." });
                }
            }
            catch
            {
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }


        private void SendEmail(string recipientEmail, string subject, string messageBody)
        {
            try
            {
                using SmtpClient smtpClient = new(configuration["SMTPConfiguration:Server"]);
                smtpClient.Port = Convert.ToInt32(configuration["SMTPConfiguration:Port"]);
                smtpClient.Credentials = new NetworkCredential(configuration["SMTPConfiguration:HostName"], configuration["SMTPConfiguration:Password"]);
                smtpClient.EnableSsl = true;

                MailMessage mailMessage = new()
                {
                    From = new MailAddress(configuration["SMTPConfiguration:HostName"]!),
                    IsBodyHtml = true,
                    Subject = subject,
                    Body = messageBody
                };
                mailMessage.To.Add(recipientEmail);

                smtpClient.Send(mailMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending email: " + ex.Message);
            }
        }



        [HttpGet]
        public IActionResult AssetLocation()
        {
            List<Assetlocation> assetlocations = [];
            try
            {
                using (NpgsqlConnection conn = new(_connectionString))
                {
                    conn.Open();

                    using NpgsqlCommand cmd = new("SELECT * FROM getassetlocations()", conn);
                    using NpgsqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        Assetlocation assetlocation = new()
                        {
                            LocationId = Convert.ToInt32(reader["locationid"]),
                            DepartmentId = Convert.ToInt32(reader["departmentid"]),
                            DepartmentName = Convert.ToString(reader["departmentname"]),
                            Address = Convert.ToString(reader["address"])!,
                            LocationImage = Convert.ToString(reader["locationimage"]),
                        };
                        assetlocations.Add(assetlocation);
                    }
                }

                return View(assetlocations);
            }
            catch
            {
                throw new Exception("");
            }

        }

        [HttpPost]
        public IActionResult? AddAssetLocation(Assetlocation assetlocation, IFormFile locationImage)
        {
            try
            {
                if (assetlocation == null || assetlocation.DepartmentId <= 0 || string.IsNullOrWhiteSpace(assetlocation.Address))
                {
                    return BadRequest(new { success = false, message = "Invalid asset location data. Please provide valid values." });
                }
                using NpgsqlConnection conn = new(_connectionString);
                using NpgsqlCommand cmd = new("SELECT * FROM addassetlocation(@DepartmentId,@Address,@LocationImage,@CreatedBy)", conn);
                cmd.Parameters.AddWithValue("@DepartmentId", assetlocation.DepartmentId);
                cmd.Parameters.AddWithValue("@Address", assetlocation.Address!);

                string imageName = string.Empty;
                if (locationImage != null && locationImage.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(locationImage.FileName);
                    string assetLocationFolderPath = Path.Combine(_imageFolderPath, "assetLocationImages");
                    string imagePath = Path.Combine(assetLocationFolderPath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    locationImage.CopyTo(stream);
                }

                cmd.Parameters.AddWithValue("@LocationImage", imageName); // Store only image name

                cmd.Parameters.AddWithValue("@CreatedBy", _employeeId!);
                conn.Open();
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Assetlocation assetlocationrow = new()
                    {
                        LocationId = Convert.ToInt32(reader["insertlocationid"]),
                        DepartmentId = Convert.ToInt32(reader["departmentid"]),
                        DepartmentName = Convert.ToString(reader["departmentname"]),
                        Address = Convert.ToString(reader["address"])!,
                        LocationImage = Convert.ToString(reader["locationimage"]),
                    };
                    return Json(assetlocationrow);
                }
                else
                {
                    return NotFound(new { status = false, message = "Failed to fetch new location data. Please contact the administrator." });
                }
            }
            catch (Exception)
            {
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }

        }

        [HttpPut]
        public IActionResult? UpdateAssetLocation(Assetlocation assetlocation, IFormFile locationImage)
        {
            try
            {
                if (assetlocation == null || assetlocation.LocationId <= 0 || assetlocation.DepartmentId <= 0 || string.IsNullOrWhiteSpace(assetlocation.Address))
                {
                    return BadRequest(new { success = false, message = "Invalid asset location data. Please provide valid values." });
                }

                using NpgsqlConnection conn = new(_connectionString);
                using NpgsqlCommand cmd = new("SELECT * FROM updateassetlocation(@LocationId,@DepartmentId,@Address,@LocationImage,@ModifiedBy)", conn);
                cmd.Parameters.AddWithValue("@LocationId", assetlocation.LocationId);
                cmd.Parameters.AddWithValue("@DepartmentId", assetlocation.DepartmentId);
                cmd.Parameters.AddWithValue("@Address", assetlocation.Address!);




                string imageName = string.Empty;
                if (locationImage != null && locationImage.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(locationImage.FileName);
                    string assetLocationFolderPath = Path.Combine(_imageFolderPath, "assetLocationImages");
                    string imagePath = Path.Combine(assetLocationFolderPath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    locationImage.CopyTo(stream);
                }



                cmd.Parameters.AddWithValue("@LocationImage", locationImage != null && locationImage.Length > 0 ? imageName : DBNull.Value);

                cmd.Parameters.AddWithValue("@ModifiedBy", _employeeId!);
                conn.Open();
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Assetlocation assetlocationrow = new()
                    {
                        LocationId = Convert.ToInt32(reader["updatedlocationid"]),
                        DepartmentId = Convert.ToInt32(reader["departmentid"]),
                        DepartmentName = Convert.ToString(reader["departmentname"]),
                        Address = Convert.ToString(reader["address"])!,
                        LocationImage = Convert.ToString(reader["locationimage"]),
                    };
                    return Json(assetlocationrow);
                }
                else
                {
                    return NotFound(new { status = false, message = "Asset location not found. Please ensure the provided ID exists." });
                }
            }
            catch
            {
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }

        [HttpDelete]
        public IActionResult DeleteAssetLocation(int assetLocationId)
        {
            try
            {
                if (assetLocationId <= 0)
                {
                    return BadRequest(new { success = false, message = "Invalid asset location ID. Please provide a valid value." });
                }
                using NpgsqlConnection conn = new(_connectionString);
                using NpgsqlCommand cmd = new("SELECT * FROM deleteassetlocation(@AssetAllocationId,@ModifiedBy)", conn);
                cmd.Parameters.AddWithValue("@AssetAllocationId", assetLocationId);
                cmd.Parameters.AddWithValue("@ModifiedBy", _employeeId!);
                conn.Open();
                int rowsAffected = (int)cmd.ExecuteScalar()!;
                if (rowsAffected > 0)
                {
                    return Ok(JsonConvert.SerializeObject(new { status = true, message = "Location Deleted Successfully." }));
                }
                else
                {
                    return NotFound(new { status = false, message = "No location found with the provided ID." });
                }
            }
            catch
            {
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }

        [HttpGet]
        public IActionResult Maintenance()
        {
            List<Maintenance> maintenances = GetMaintenances();
            ViewData["MaintenanceJson"] = JsonConvert.SerializeObject(maintenances);   // Convert to JSON and pass to the view

            Maintenance maintenance = new();
            return View(maintenance);
        }



        private List<Maintenance> GetMaintenances()
        {
            List<Maintenance> maintenances = [];
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT * FROM getmaintenances()", connection);
                cmd.CommandType = CommandType.Text;
                var reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    Maintenance maintenance = new()
                    {
                        MaintenanceId = reader.GetInt32(reader.GetOrdinal("maintenanceId")),
                        CategoryId = reader.GetInt32(reader.GetOrdinal("categoryId")),
                        CategoryName = reader.GetString(reader.GetOrdinal("categoryName")),
                        SubCategoryId = reader.GetInt32(reader.GetOrdinal("subcategoryId")),
                        SubCategoryName = reader.GetString(reader.GetOrdinal("subcategoryName")),
                        AssetId = reader.GetInt32(reader.GetOrdinal("assetId")),
                        AssetName = reader.GetString(reader.GetOrdinal("assetName")),
                        Description = reader.GetString(reader.GetOrdinal("description")),
                        ScheduleDate = reader.IsDBNull("scheduleDate") ? default : DateOnly.FromDateTime((DateTime)reader["scheduleDate"]),
                        CompletionDate = reader.IsDBNull("completionDate") ? default : DateOnly.FromDateTime((DateTime)reader["completionDate"]),
                    };


                    maintenances.Add(maintenance);
                }
            }

            return maintenances;
        }


        [HttpPost]
        public IActionResult AddMaintenance(Maintenance maintenance)
        {
            try
            {
                //
                if (maintenance == null || maintenance.AssetId <= 0 || maintenance.ScheduleDate == null)
                {
                    return BadRequest(new { success = false, message = "Invalid maintenance data. Please provide valid values." });
                }

                using NpgsqlConnection conn = new(_connectionString);
                using NpgsqlCommand cmd = new("SELECT * FROM addmaintenance(@AssetId, @Description, @ScheduleDate, @CompletionDate, @CreatedBy)", conn);
                cmd.Parameters.AddWithValue("@AssetId", maintenance.AssetId!);
                cmd.Parameters.AddWithValue("@Description", maintenance.Description!);

                cmd.Parameters.AddWithValue("@ScheduleDate", maintenance.ScheduleDate!);
                cmd.Parameters.AddWithValue("@CompletionDate", maintenance.CompletionDate!);
                cmd.Parameters.AddWithValue("@CreatedBy", _employeeId!);
                conn.Open();

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Maintenance maintenances = new()
                    {

                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"])!,
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,
                        AssetId = Convert.ToInt32(reader["assetid"]),
                        AssetName = Convert.ToString(reader["assetname"])!,
                        Description = Convert.ToString(reader["description"]),
                        ScheduleDate = Convert.IsDBNull(reader["scheduledate"]) ? default : DateOnly.FromDateTime((DateTime)reader["scheduledate"]),
                        CompletionDate = Convert.IsDBNull(reader["completiondate"]) ? default : DateOnly.FromDateTime((DateTime)reader["completiondate"])
                    };

                    return Json(maintenances);
                }
                else
                {
                    // If no rows were affected, return a not found error
                    return NotFound(new { status = false, message = "Failed to fetch new maintenance data. Please contact the administrator." });
                }
            }
            catch
            {
                // If an unexpected error occurs, log the exception and return a generic error message
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }







        [HttpPost]

        public IActionResult UpdateMaintenance(Maintenance maintenance)
        {
            try
            {

                if (maintenance.MaintenanceId <= 0)
                {
                    return BadRequest(new { status = false, message = "Invalid Maintenance ID. Please provide a valid ID." });
                }

                using NpgsqlConnection conn = new(_connectionString);



                using NpgsqlCommand cmd = new("SELECT * FROM updatemaintenance(@MaintenanceId,@AssetId,@Description,@ScheduleDate,@CompletionDate,@ModifiedBy)", conn);

                cmd.Parameters.AddWithValue("@MaintenanceId", maintenance.MaintenanceId!);
                cmd.Parameters.AddWithValue("@AssetId", maintenance.AssetId!);
                cmd.Parameters.AddWithValue("@Description", maintenance.Description!);
                cmd.Parameters.AddWithValue("@ScheduleDate", maintenance.ScheduleDate!);
                cmd.Parameters.AddWithValue("@CompletionDate", maintenance.CompletionDate!);
                cmd.Parameters.AddWithValue("@ModifiedBy", _employeeId!);
                conn.Open();


                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Maintenance updatedMaintenance = new()
                    {
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"])!,
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,
                        AssetId = Convert.ToInt32(reader["assetid"]),
                        AssetName = Convert.ToString(reader["assetname"])!,
                        Description = Convert.ToString(reader["description"]),
                        ScheduleDate = Convert.IsDBNull(reader["scheduledate"]) ? default : DateOnly.FromDateTime((DateTime)reader["scheduledate"]),
                        CompletionDate = Convert.IsDBNull(reader["completiondate"]) ? default : DateOnly.FromDateTime((DateTime)reader["completiondate"])
                    };
                    return Json(updatedMaintenance);
                }
                else
                {
                    return NotFound(new { status = false, message = "Maintenance not found. Please ensure the provided ID exists." });
                }
            }
            catch
            {
                // Log the exception and return a generic error message
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }









        [HttpDelete]
        public IActionResult DeleteMaintenances(int maintenanceId)
        {
            try
            {
                if (maintenanceId <= 0)
                {
                    return BadRequest(new { status = false, message = "Invalid maintenance ID. Please provide a valid ID." });
                }

                using NpgsqlConnection conn = new(_connectionString);

                using NpgsqlCommand cmd = new("SELECT * FROM deletemaintenance(@MaintenanceId, @ModifierId)", conn);

                cmd.Parameters.AddWithValue("@MaintenanceId", maintenanceId);
                cmd.Parameters.AddWithValue("@ModifierId", _employeeId!);
                conn.Open();

                int rowsAffected = (int)cmd.ExecuteScalar()!;
                if (rowsAffected > 0)
                {
                    return Ok(JsonConvert.SerializeObject(new { status = true, message = "Maintenance Deleted Successfully." }));
                }
                else
                {
                    return NotFound(new { status = false, message = "No maintenance data found with the provided ID." });
                }
            }
            catch
            {
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }


    }

}