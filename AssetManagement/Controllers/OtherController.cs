using AssetManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting.Internal;
using Newtonsoft.Json;
using Npgsql;
using System.Data;

namespace AssetManagement.Controllers
{
    public class OtherController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment) : Controller
    {

        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly int _employeeId = (int)httpContextAccessor.HttpContext!.Session.GetInt32("EmployeeId")!;
        private readonly string _imageFolderPath = Path.Combine(hostingEnvironment.WebRootPath, "images");

        [HttpGet]
        public IActionResult Supplier()
        {

            List<Supplier> suppliers = [];

            try
            {

                using NpgsqlConnection conn = new(_connectionString);
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getsuppliers()", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {

                    Supplier supplier = new()
                    {
                        SupplierId = Convert.ToInt32(reader["supplierid"]),
                        SupplierName = Convert.ToString(reader["suppliername"]),
                        SupplierAddress = Convert.ToString(reader["supplieraddress"]),
                        SupplierPhoneNumber = Convert.ToInt64(reader["supplierPhoneNumber"]),
                        SupplierEmail = Convert.ToString(reader["supplieremail"]),
                        SupplierImage = Convert.ToString(reader["supplierimage"]),
                        CountryId = Convert.ToInt32(reader["countryid"]),
                        CountryCode = Convert.ToString(reader["countrycode"]),
                        CountryName = Convert.ToString(reader["countryname"]),
                        StateId = Convert.ToInt32(reader["stateid"]),
                        StateName = Convert.ToString(reader["statename"]),
                        CityId = Convert.ToInt32(reader["cityid"]),
                        CityName = Convert.ToString(reader["cityname"]),
                    };
                    suppliers.Add(supplier);

                }
            }
            catch
            {
                throw new Exception("");
            }
            return View(suppliers);
        }

        [HttpPost]
        public IActionResult AddSupplier(Supplier supplier, IFormFile supplierImage)
        {
            try
            {
                if (supplier == null || string.IsNullOrWhiteSpace(supplier.SupplierName) || string.IsNullOrWhiteSpace(supplier.SupplierAddress) || string.IsNullOrWhiteSpace(supplier.SupplierEmail) || supplier.SupplierPhoneNumber <= 0 || supplier.CityId <= 0)
                {
                    return BadRequest(new { success = false, message = "Invalid supplier data. Please provide valid values." });
                }
                using NpgsqlConnection conn = new(_connectionString);
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM public.addsupplier(@SupplierName, @SupplierAddress, @CityId, @supplierPhoneNumber, @SupplierEmail,  @SupplierImage,@CreatedBy)", conn);
                cmd.Parameters.AddWithValue("@SupplierName", supplier.SupplierName!);
                cmd.Parameters.AddWithValue("@SupplierAddress", supplier.SupplierAddress!);
                cmd.Parameters.AddWithValue("@CityId", supplier.CityId!);
                cmd.Parameters.AddWithValue("@supplierPhoneNumber", supplier.SupplierPhoneNumber!);
                cmd.Parameters.AddWithValue("@SupplierEmail", supplier.SupplierEmail!);

                string imageName = string.Empty;
                if (supplierImage != null && supplierImage.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(supplierImage.FileName);
                    string assetLocationFolderPath = Path.Combine(_imageFolderPath, "supplierImages");
                    string imagePath = Path.Combine(assetLocationFolderPath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    supplierImage.CopyTo(stream);
                }


                cmd.Parameters.AddWithValue("@SupplierImage", imageName);
                cmd.Parameters.AddWithValue("@CreatedBy", _employeeId!);

                // Execute the function
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Console.WriteLine(reader);
                    Supplier supplierrow = new()
                    {
                        SupplierId = Convert.ToInt32(reader["insertsupplierid"]),
                        SupplierName = Convert.ToString(reader["suppliername"]),
                        SupplierAddress = Convert.ToString(reader["supplieraddress"]),
                        SupplierPhoneNumber = Convert.ToInt64(reader["supplierPhoneNumber"]),
                        SupplierEmail = Convert.ToString(reader["supplieremail"]),
                        SupplierImage = Convert.ToString(reader["supplierimage"]),
                        CountryId = Convert.ToInt32(reader["countryid"]),
                        CountryCode = Convert.ToString(reader["countrycode"]),
                        CountryName = Convert.ToString(reader["countryname"]),
                        StateId = Convert.ToInt32(reader["stateid"]),
                        StateName = Convert.ToString(reader["statename"]),
                        CityId = Convert.ToInt32(reader["cityid"]),
                        CityName = Convert.ToString(reader["cityname"]),
                    };
                    return Json(supplierrow);
                }
                else
                {
                    return NotFound(new { status = false, message = "Failed to fetch new location data. Please contact the administrator." });
                }
            }
            catch
            {
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }

        [HttpPut]
        public IActionResult UpdateSupplier(Supplier supplier, IFormFile supplierImage)
        {
            try
            {
                if (supplier == null || supplier.SupplierId <= 0 || string.IsNullOrWhiteSpace(supplier.SupplierName) || string.IsNullOrWhiteSpace(supplier.SupplierAddress) || string.IsNullOrWhiteSpace(supplier.SupplierEmail) || supplier.SupplierPhoneNumber <= 0 || supplier.CityId <= 0)
                {
                    return BadRequest(new { success = false, message = "Invalid supplier data. Please provide valid values." });
                }


                using NpgsqlConnection conn = new(_connectionString);
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM public.updatesupplier(@SupplierId,@SupplierName, @SupplierAddress, @CityId, @supplierPhoneNumber, @SupplierEmail,  @SupplierImage,@CreatedBy)", conn);
                cmd.Parameters.AddWithValue("@SupplierId", supplier.SupplierId!);
                cmd.Parameters.AddWithValue("@SupplierName", supplier.SupplierName!);
                cmd.Parameters.AddWithValue("@SupplierAddress", supplier.SupplierAddress!);

                cmd.Parameters.AddWithValue("@CityId", supplier.CityId!);
                cmd.Parameters.AddWithValue("@supplierPhoneNumber", supplier.SupplierPhoneNumber!);
                cmd.Parameters.AddWithValue("@SupplierEmail", supplier.SupplierEmail!);


                string imageName = string.Empty;
                if (supplierImage != null && supplierImage.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(supplierImage.FileName);
                    string assetLocationFolderPath = Path.Combine(_imageFolderPath, "supplierImages");
                    string imagePath = Path.Combine(assetLocationFolderPath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    supplierImage.CopyTo(stream);
                }


                cmd.Parameters.AddWithValue("@SupplierImage", imageName);
                cmd.Parameters.AddWithValue("@CreatedBy", _employeeId!);

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                if (reader.HasRows && reader.Read())
                {
                    Console.WriteLine(reader);
                    Supplier supplierrow = new()
                    {
                        SupplierId = Convert.ToInt32(reader["updatesupplierid"]),
                        SupplierName = Convert.ToString(reader["suppliername"]),
                        SupplierAddress = Convert.ToString(reader["supplieraddress"]),
                        SupplierPhoneNumber = Convert.ToInt64(reader["supplierPhoneNumber"]),
                        SupplierEmail = Convert.ToString(reader["supplieremail"]),
                        SupplierImage = Convert.ToString(reader["supplierimage"]),
                        CountryId = Convert.ToInt32(reader["countryid"]),
                        CountryCode = Convert.ToString(reader["countrycode"]),
                        CountryName = Convert.ToString(reader["countryname"]),
                        StateId = Convert.ToInt32(reader["stateid"]),
                        StateName = Convert.ToString(reader["statename"]),
                        CityId = Convert.ToInt32(reader["cityid"]),
                        CityName = Convert.ToString(reader["cityname"]),
                    };
                    return Json(supplierrow);
                }
                else
                {
                    return NotFound(new { status = false, message = "Failed to fetch new location data. Please contact the administrator." });
                }

            }
            catch
            {
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }

        [HttpDelete]
        public IActionResult DeleteSupplier(int supplierId)
        {
            try
            {


                using NpgsqlConnection conn = new(_connectionString);
                conn.Open();
                using NpgsqlCommand cmd = new("SELECT public.deletesupplier(@SupplierId, @ModifierId)", conn);
                cmd.Parameters.AddWithValue("@SupplierId", supplierId);
                cmd.Parameters.AddWithValue("@ModifierId", _employeeId!);

                int rowsAffected = (int)cmd.ExecuteScalar()!;

                if (rowsAffected > 0)
                {
                    return Ok(JsonConvert.SerializeObject(new { status = true, message = "Supplier Deleted Successfully." }));
                }
                else
                {
                    return NotFound(new { status = false, message = "No Supplier found with the provided ID." });
                }
            }
            catch (Exception)
            {
                throw new Exception(JsonConvert.SerializeObject(new { status = false, message = "An unexpected error occurred. Please contact the administrator." }));
            }
        }




        [HttpGet]
        public IActionResult Manufacturer()
        {
            List<Manufacturer> manufactures = GetManufactures();
            ViewData["ManufacturesJson"] = System.Text.Json.JsonSerializer.Serialize(manufactures);
            Manufacturer manufacturer = new();
            return View(manufacturer); // Pass the list of manufacturers to the view
        }

        // Change the return type to List<Manufacturer>
        private List<Manufacturer> GetManufactures()
        {
            List<Manufacturer> manufactures = []; // Initialize the list
            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();
                using var cmd = new NpgsqlCommand("SELECT * FROM getmanufacturers()", connection);

                cmd.CommandType = CommandType.Text;
                var reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    // Mapping database records to Manufacturer objects.
                    Manufacturer manufacture = new()
                    {
                        ManufactureId = Convert.ToInt32(reader["manufactureid"]),
                        ManufactureName = Convert.ToString(reader["manufacturename"])!,
                        Url = Convert.ToString(reader["url"]),
                        Address = Convert.ToString(reader["address"]),
                        CityId = Convert.ToInt32(reader["cityid"]),
                        CityName = Convert.ToString(reader["cityname"]),
                        StateId = Convert.ToInt32(reader["stateid"]),
                        StateName = Convert.ToString(reader["statename"]),
                        CountryId = Convert.ToInt32(reader["countryid"]),
                        CountryName = Convert.ToString(reader["countryname"]),
                        //CountryCode = Convert.ToString(reader["countrycode"]),
                        SupportPhoneNumber = Convert.ToInt64(reader["supportphonenumber"]),
                        SupportEmail = Convert.ToString(reader["supportemail"]),
                    };
                    manufactures.Add(manufacture);
                }

            }
            return manufactures;
        }



        [HttpPost]  
        public IActionResult? AddManufacture(Manufacturer manufacture)
        {
            try
            {
               

                using var connection = new NpgsqlConnection(_connectionString);

                connection.Open();
                using var command = new NpgsqlCommand("SELECT public.addmanufacturer(@pmanufacturename, @purl, @paddress, @pcityid, @psupportphonenumber, @psupportemail, @pcreatedby)", connection);

                command.Parameters.AddWithValue("@pmanufacturename", manufacture.ManufactureName!);
                command.Parameters.AddWithValue("@purl", manufacture.Url!);
                command.Parameters.AddWithValue("@paddress", manufacture.Address!);
                command.Parameters.AddWithValue("@pcityid", manufacture.CityId!);
                command.Parameters.AddWithValue("@psupportphonenumber", manufacture.SupportPhoneNumber!);
                command.Parameters.AddWithValue("@psupportemail", manufacture.SupportEmail!);
                command.Parameters.AddWithValue("@pcreatedby", _employeeId!);

                int newManufactureId = (int)command.ExecuteScalar()!;

                return Ok();
            }
            catch (Exception ex)
            {
                // Log the exception for troubleshooting purposes
                Console.WriteLine($"Error: {ex.Message}");

                return BadRequest("Failed to add manufacture. See server logs for details.");
            }
        }




        [HttpPut]
        public IActionResult? UpdateManufacture(Manufacturer Manufacture)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();
                using var command = new NpgsqlCommand("SELECT public.updatemanufacturer(@pmanufactureid, @pmanufacturename, @purl, @paddress, @pcityid, @psupportphonenumber, @psupportemail, @pmodifiedby)", connection);

                command.Parameters.AddWithValue("@pmanufactureid", Manufacture.ManufactureId!);
                command.Parameters.AddWithValue("@pmanufacturename", Manufacture.ManufactureName!);
                command.Parameters.AddWithValue("@purl", Manufacture.Url!);
                command.Parameters.AddWithValue("@paddress", Manufacture.Address!);
                command.Parameters.AddWithValue("@pcityid", Manufacture.CityId!);
                command.Parameters.AddWithValue("@psupportphonenumber", Manufacture.SupportPhoneNumber!);
                command.Parameters.AddWithValue("@psupportemail", Manufacture.SupportEmail!);
                command.Parameters.AddWithValue("@pmodifiedby", _employeeId!);

                int rowsAffected = (int)command.ExecuteScalar()!;

                if (rowsAffected == 0)
                {
                    return NotFound("Not Founf Manufacture With That ID");
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Failed to update manufacturer" + ex.Message);
            }
        }

        [HttpDelete]



        [HttpPost]

        public IActionResult DeleteManufacture(int ManufactureId)
        {
            try
            {
                using NpgsqlConnection connection = new(_connectionString);

                connection.Open();
                using NpgsqlCommand command = new("SELECT public.deletemanufacturer(@p_manufactureId, @p_modifierId)", connection);

                command.Parameters.AddWithValue("@p_manufactureId", ManufactureId!);
                command.Parameters.AddWithValue("@p_modifierId", _employeeId!);

                int rowsAffected = (int)command.ExecuteScalar()!;

                if (rowsAffected > 0)
                {
                    return Ok();
                }
                else
                {
                    return BadRequest("failed to delete manufacture data");
                }


            }
            catch
            {
                return BadRequest("manufacture data delete error");
            }
        }

    }

}

