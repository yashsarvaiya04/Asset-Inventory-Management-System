using AssetManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using NpgsqlTypes;
using System.Data;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace AssetManagement.Controllers
{
    public class EmployeeController(IConfiguration configuration, IWebHostEnvironment hostingEnvironment) : Controller
    {
        private readonly string _connectionstring = configuration.GetConnectionString("DefaultConnection")!;
        private readonly string _imageFolderPath = Path.Combine(hostingEnvironment.WebRootPath, "images");
        //private static readonly byte[] EncryptionKey = "MalavVora12345678901234567890123"u8.ToArray();
        private static readonly byte[] EncryptionKey = new byte[32]
{
    0x4D, 0x61, 0x6C, 0x61, 0x76, 0x56, 0x6F, 0x72, // Changed 0x4D to 0x41
    0x61, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37,
    0x38, 0x39, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35,
    0x36, 0x37, 0x38, 0x39, 0x30, 0x31, 0x32, 0x33
};





        [HttpGet]
        public IActionResult Department()
        {
            List<Department> departments = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionstring))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getdepartments()", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    // Mapping database records to AssetAllocation objects.
                    Department department = new()
                    {
                        DepartmentId = Convert.ToInt32(reader["departmentid"]),
                        DepartmentName = Convert.ToString(reader["departmentname"]),
                    };
                    departments.Add(department);
                }
            }

            return View(departments);
        }


        [HttpPost]
        public IActionResult? AddDepartment(Assetallocation assetallocation)
        {
            int? employeeId = HttpContext.Session.GetInt32("EmployeeId");
            using NpgsqlConnection conn = new(_connectionstring);
            using NpgsqlCommand cmd = new("SELECT * FROM addassetallocation(@EmployeeId,@AssetId,@AssignedDate,@CreatedBy)", conn);
            cmd.Parameters.AddWithValue("@EmployeeId", assetallocation.EmployeeId);
            cmd.Parameters.AddWithValue("@AssetId", assetallocation.AssetId);
            cmd.Parameters.AddWithValue("@AssignedDate", assetallocation.AssignedDate!);
            cmd.Parameters.AddWithValue("@CreatedBy", employeeId!);
            conn.Open();
            using NpgsqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                Assetallocation assetAllocation = new()
                {
                    AllocationId = Convert.ToInt32(reader["insertallocationid"]),
                    DepartmentId = Convert.ToInt32(reader["departmentid"]),
                    DepartmentName = Convert.ToString(reader["departmentname"]),
                    EmployeeId = Convert.ToInt32(reader["employeeid"]),
                    EmployeeName = Convert.ToString(reader["firstname"])! + " " + Convert.ToString(reader["lastname"])!,
                    EmployeeEmail = Convert.ToString(reader["email"]),
                    PhoneCountryCode = Convert.ToString(reader["phonecountrycode"])!,
                    PhoneNumber = Convert.ToInt64(reader["phonenumber"]),
                    CategoryId = Convert.ToInt32(reader["categoryid"]),
                    CategoryName = Convert.ToString(reader["categoryname"])!,
                    SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                    SubCategoryName = Convert.ToString(reader["subcategoryname"])!,
                    AssetId = Convert.ToInt32(reader["assetid"]),
                    AssetName = Convert.ToString(reader["assetname"])!,
                    AssignedDate = Convert.IsDBNull(reader["allocatedate"]) ? default : DateOnly.FromDateTime((DateTime)reader["allocatedate"]),
                    FreeDate = Convert.IsDBNull(reader["returnbydate"]) ? default : DateOnly.FromDateTime((DateTime)reader["returnbydate"])
                };
                return Json(assetAllocation);
            }
            else
            {
                return null;
            }
        }
        [HttpPut]
        public IActionResult? UpdateDepartment(Assetallocation assetallocation)
        {
            int? employeeId = HttpContext.Session.GetInt32("EmployeeId");
            using NpgsqlConnection conn = new(_connectionstring);
            using NpgsqlCommand cmd = new("SELECT * FROM updateassetallocation(@AssetAllocationId,@AssetId,@AssignedDate,@FreeDate,@ModifiedBy)", conn);
            cmd.Parameters.AddWithValue("@AssetAllocationId", assetallocation.AllocationId!);
            cmd.Parameters.AddWithValue("@AssetId", assetallocation.AssetId!);
            cmd.Parameters.AddWithValue("@AssignedDate", NpgsqlDbType.Date, assetallocation.AssignedDate.HasValue ? assetallocation.AssignedDate.Value : DBNull.Value);
            cmd.Parameters.AddWithValue("@FreeDate", NpgsqlDbType.Date, assetallocation.FreeDate.HasValue ? assetallocation.FreeDate : DBNull.Value);
            cmd.Parameters.AddWithValue("@ModifiedBy", employeeId!);
            conn.Open();
            using NpgsqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                Assetallocation assetAllocation = new()
                {
                    AllocationId = Convert.ToInt32(reader["updateallocationid"]),
                    DepartmentId = Convert.ToInt32(reader["departmentid"]),
                    DepartmentName = Convert.ToString(reader["departmentname"]),
                    EmployeeId = Convert.ToInt32(reader["employeeid"]),
                    EmployeeName = Convert.ToString(reader["firstname"])! + " " + Convert.ToString(reader["lastname"])!,
                    EmployeeEmail = Convert.ToString(reader["email"]),
                    PhoneCountryCode = Convert.ToString(reader["phonecountrycode"])!,
                    PhoneNumber = Convert.ToInt64(reader["phonenumber"]),
                    CategoryId = Convert.ToInt32(reader["categoryid"]),
                    CategoryName = Convert.ToString(reader["categoryname"])!,
                    SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                    SubCategoryName = Convert.ToString(reader["subcategoryname"])!,
                    AssetId = Convert.ToInt32(reader["assetid"]),
                    AssetName = Convert.ToString(reader["assetname"])!,
                    AssignedDate = Convert.IsDBNull(reader["allocatedate"]) ? default : DateOnly.FromDateTime((DateTime)reader["allocatedate"]),
                    FreeDate = Convert.IsDBNull(reader["returnbydate"]) ? default : DateOnly.FromDateTime((DateTime)reader["returnbydate"])
                };
                return Json(assetAllocation);
            }
            else
            {
                return null;
            }
        }
        [HttpDelete]
        public IActionResult DeleteDepartment(int assetAllocationId)
        {
            int? employeeId = HttpContext.Session.GetInt32("EmployeeId");
            using NpgsqlConnection conn = new(_connectionstring);
            using NpgsqlCommand cmd = new("SELECT * FROM deleteassetallocation(@AssetAllocationId,@ModifiedBy)", conn);
            cmd.Parameters.AddWithValue("@AssetAllocationId", assetAllocationId);
            cmd.Parameters.AddWithValue("@ModifiedBy", employeeId!);
            conn.Open();
            return (int)cmd.ExecuteScalar()! > 0 ? Ok() : BadRequest();


        }







        [HttpGet]
        public IActionResult Employees()
        {
            //int? employeeId = HttpContext.Session.GetInt32("EmployeeId");
            // Retrieve employees from the database
            List<Employee> employees = GetEmployees();
            ViewData["EmployeesJson"] = JsonSerializer.Serialize(employees); // Convert to JSON and pass to the view

            ViewBag.Countries = GetCountries();
            ViewBag.Departments = GetDepartments();

            
            return View();
        }



        private List<Employee> GetEmployees()
        {
            List<Employee> employees = []; // Correct list initialization

            using (var connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT * FROM getemployees()", connection);
                cmd.CommandType = CommandType.Text;
                var reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    Employee employee = new()
                    {
                        EmployeeId = reader.GetInt32(reader.GetOrdinal("employeeid")),
                        EmployeeNo = reader.GetString(reader.GetOrdinal("employeeserialno")),
                        DepartmentId = reader.GetInt32(reader.GetOrdinal("departmentid")),
                        DepartmentName = reader.GetString(reader.GetOrdinal("departmentname")),
                        FirstName = reader.GetString(reader.GetOrdinal("firstname")),
                        MiddleName = reader.IsDBNull(reader.GetOrdinal("middlename")) ? "" : reader.GetString(reader.GetOrdinal("middlename")),
                        LastName = reader.GetString(reader.GetOrdinal("lastname")),
                        Address = reader.GetString(reader.GetOrdinal("address")),
                        CountryId = reader.GetInt32(reader.GetOrdinal("countryid")),
                        CountryName = reader.GetString(reader.GetOrdinal("countryname")),
                        StateId = reader.GetInt32(reader.GetOrdinal("stateid")),
                        StateName = reader.GetString(reader.GetOrdinal("statename")),
                        CityId = reader.GetInt32(reader.GetOrdinal("cityid")),
                        CityName = reader.GetString(reader.GetOrdinal("cityname")),
                        Designation = reader.GetString(reader.GetOrdinal("designation")),
                        LoginEnabled = reader.GetBoolean(reader.GetOrdinal("loginenabled")),
                        Email = reader.GetString(reader.GetOrdinal("email")),
                        PhoneNumber = reader.GetInt64(reader.GetOrdinal("phonenumber")),
                        EmployeeImage = reader.IsDBNull(reader.GetOrdinal("employeeimage")) ? "" : reader.GetString(reader.GetOrdinal("employeeimage")),
                        // Populate other properties accordingly
                    };

                    employees.Add(employee);
                }
            }

            return employees;
        }




        [HttpPost]
        public IActionResult AddEmployee(Employee employee, IFormFile employeeImage)
        {
            int? createdById = HttpContext.Session.GetInt32("EmployeeId");
            try
            {
                string imageName = string.Empty;
                if (employeeImage != null && employeeImage.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(employeeImage.FileName);
                    string employeeImagePath = Path.Combine(_imageFolderPath, "employeeImages");
                    string imagePath = Path.Combine(employeeImagePath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    employeeImage.CopyTo(stream);
                }

                using var connection = new NpgsqlConnection(_connectionstring);
                connection.Open();

                using var command = new NpgsqlCommand("SELECT public.addemployee(@p_departmentid,@p_employeeno, @p_firstname, @p_middlename, @p_lastname, @p_address, @p_cityid, @p_phonenumber, @p_email, @p_designation, @p_password, @p_loginenabled, @p_employeeimage, @p_createdby)", connection);
                command.Parameters.AddWithValue("p_departmentid", employee.DepartmentId);
                command.Parameters.AddWithValue("p_employeeno", employee.EmployeeNo);
                command.Parameters.AddWithValue("p_firstname", employee.FirstName);
                command.Parameters.AddWithValue("p_middlename", employee.MiddleName ?? ""); // Handle null values if necessary
                command.Parameters.AddWithValue("p_lastname", employee.LastName);
                command.Parameters.AddWithValue("p_address", employee.Address!);
                command.Parameters.AddWithValue("p_cityid", employee.CityId!);
                command.Parameters.AddWithValue("p_phonenumber", employee.PhoneNumber!);
                command.Parameters.AddWithValue("p_email", employee.Email);
                command.Parameters.AddWithValue("p_designation", employee.Designation);
                command.Parameters.AddWithValue("p_password", EncryptPassword(employee.Password));
                command.Parameters.AddWithValue("p_loginenabled", employee.LoginEnabled!);
                command.Parameters.AddWithValue("p_employeeimage", imageName); // Store only image name
                command.Parameters.AddWithValue("p_createdby", createdById!);

                int newEmployeeId = (int)command.ExecuteScalar()!;

                return Ok();
            }
            catch
            {
                return BadRequest("Failed to add employee data ");
            }
        }



        public static string EncryptPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("Password cannot be null or empty.");
            }

            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = EncryptionKey;
                aesAlg.IV = new byte[aesAlg.BlockSize / 8]; // Initialization Vector (IV) is set to all zeros.

                // Use PKCS7 padding mode
                aesAlg.Padding = PaddingMode.PKCS7;

                // Create an encryptor to perform the stream transform.
                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for encryption.
                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            // Write all data to the stream.
                            swEncrypt.Write(password);
                        }
                    }
                    // Return the encrypted bytes as Base64-encoded string.
                    return Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
        }


        [HttpPost]
        public IActionResult UpdateEmployee([FromBody] Employee employee)
        {
            int? modifiedById = HttpContext.Session.GetInt32("EmployeeId");
            try
            {
                using var connection = new NpgsqlConnection(_connectionstring);
                connection.Open();

                using var command = new NpgsqlCommand("SELECT public.updateemployee(@pemployeeid, @pdepartmentid, @pfirstname, @pmiddlename, @plastname, @paddress, @pcityid, @pphonenumber, @pemail, @pdesignation, @ploginenabled, @pmodifiedby)", connection);
                command.Parameters.AddWithValue("pemployeeid", employee.EmployeeId);
                command.Parameters.AddWithValue("pdepartmentid", employee.DepartmentId);
                command.Parameters.AddWithValue("pfirstname", employee.FirstName);
                command.Parameters.AddWithValue("pmiddlename", string.IsNullOrEmpty(employee.MiddleName) ? DBNull.Value : employee.MiddleName);
                command.Parameters.AddWithValue("plastname", employee.LastName);
                command.Parameters.AddWithValue("paddress", string.IsNullOrEmpty(employee.Address) ? DBNull.Value : employee.Address);
                command.Parameters.AddWithValue("pcityid", employee.CityId.HasValue ? employee.CityId.Value : DBNull.Value);
                command.Parameters.AddWithValue("pphonenumber", employee.PhoneNumber!);
                command.Parameters.AddWithValue("pemail", employee.Email);
                command.Parameters.AddWithValue("pdesignation", employee.Designation);
                command.Parameters.AddWithValue("ploginenabled", employee.LoginEnabled.HasValue ? employee.LoginEnabled.Value : DBNull.Value);
                command.Parameters.AddWithValue("pmodifiedby", modifiedById!);

                int rowsAffected = (int)command.ExecuteScalar()!;

                if (rowsAffected == 0)
                {
                    return NotFound("No employee found with the provided ID or employee is not active.");
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest("Failed to update employee data: " + ex.Message);
            }
        }



        [HttpGet]
        public IActionResult GetCountries()
        {
            List<Country> countries = [];

            using (NpgsqlConnection connection = new(_connectionstring))
            {
                connection.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM public.getcountries()", connection);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Country country = new()
                    {
                        CountryId = reader.GetInt32("countryid"),
                        CountryCode = reader.GetString("countrycode"),
                        CountryName = reader.GetString("countryname")
                    };

                    countries.Add(country);
                }
            }

            return Json(countries);
        }

        // Method to fetch states data from the database
        //private List<State> GetStates()
        //{
        //    List<State> states = new List<State>();

        //    using (var connection = new NpgsqlConnection(_connectionstring))
        //    {
        //        connection.Open();

        //        using (var cmd = new NpgsqlCommand("SELECT * FROM public.getstates()", connection))
        //        using (var reader = cmd.ExecuteReader())
        //        {
        //            while (reader.Read())
        //            {
        //                State state = new State
        //                {
        //                    Stateid = reader.GetInt32("stateid"),
        //                    Statename = reader.GetString("statename"),
        //                    Countryid = reader.GetInt32("countryid"),
        //                    //Countryname = reader.GetString("countryname")
        //                };

        //                states.Add(state);
        //            }
        //        }
        //    }

        //    return states;
        //}

        //// Method to fetch cities data from the database
        //private List<City> GetCities()
        //{
        //    List<City> cities = new List<City>();

        //    using (var connection = new NpgsqlConnection(_connectionstring))
        //    {
        //        connection.Open();

        //        using (var cmd = new NpgsqlCommand("SELECT * FROM public.getcities()", connection))
        //        using (var reader = cmd.ExecuteReader())
        //        {
        //            while (reader.Read())
        //            {
        //                City city = new City
        //                {
        //                    Cityid = reader.GetInt32("cityid"),
        //                    Cityname = reader.GetString("cityname"),
        //                    Stateid = reader.GetInt32("stateid"),
        //                    //Statename = reader.GetString("statename"),
        //                    //Countryid = reader.GetInt32("countryid"),
        //                    //CountryName = reader.GetString("countryname")
        //                };

        //                cities.Add(city);
        //            }
        //        }
        //    }

        //    return cities;
        //}

        private List<Department> GetDepartments()
        {
            List<Department> departments = [];

            using (var connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT * FROM public.getdepartments()", connection);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Department department = new()
                    {
                        DepartmentId = reader.GetInt32(reader.GetOrdinal("departmentid")),
                        DepartmentName = reader.GetString(reader.GetOrdinal("departmentname")),


                    };

                    departments.Add(department);
                } 
            }

            return departments;
        }

        [HttpGet]
        public IActionResult GetStatesByCountryId(int countryId)
        {
            List<State> states = [];

            using (var connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT * FROM public.getstatesbycountryid(@countryId)", connection);
                cmd.Parameters.AddWithValue("countryId", countryId);

                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    State state = new()
                    {
                        StateId = reader.GetInt32("stateid"),
                        StateName = reader.GetString("statename"),
                        CountryId = reader.GetInt32("countryid"),
                    };

                    states.Add(state);
                }
            }

            return Json(states);
        }



        [HttpGet]
        public IActionResult GetCitiesByStateId(int stateId)
        {
            List<City> cities = [];

            using (var connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT * FROM public.getcitiesbystateid(@stateId)", connection);
                cmd.Parameters.AddWithValue("stateId", stateId);

                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    City city = new()
                    {
                        CityId = reader.GetInt32("cityid"),
                        CityName = reader.GetString("cityname"),
                        StateId = reader.GetInt32("stateid"),
                        //StateName = reader.GetString("statename"),
                        //CountryId = reader.GetInt32("countryid"),
                        //CountryName = reader.GetString("countryname")
                    };

                    cities.Add(city);
                }
            }

            return Json(cities);
        }

        [HttpDelete]
        public IActionResult DeleteEmployee(int employeeId)
        {
            int? modifierId = HttpContext.Session.GetInt32("EmployeeId");
            try
            {
                using NpgsqlConnection connection = new(_connectionstring);
                connection.Open();
                using NpgsqlCommand command = new("SELECT public.deleteemployee(@EmployeeId, @ModifierId)", connection);
                command.Parameters.AddWithValue("@EmployeeId", employeeId);
                command.Parameters.AddWithValue("@ModifierId", modifierId!);

                int rowsAffected = (int)command.ExecuteScalar()!;

                if (rowsAffected > 0)
                {
                    return Ok();
                }
                else
                {
                    return BadRequest("Failed to delete employee data. Employee may have active asset allocations.");
                }
            }
            catch (NpgsqlException ex)
            {
                if (ex.Message.Contains("Employee has active asset allocations"))
                {
                    return BadRequest("Failed to delete employee data. Employee has active asset allocations.");
                }
                else
                {

                    return StatusCode(500, "An error occurred while processing your request. Please try again later.");
                }
            }
            catch
            {
                // Log the exception for further investigation
                // Log.Error(ex, "Error occurred while deleting employee.");

                return StatusCode(500, "An error occurred while processing your request. Please try again later.");
            }
        }


        [HttpGet]
        public IActionResult Logs()
        {
            List<Log> logs = GetLogs();
            ViewData["LogsJson"] = JsonSerializer.Serialize(logs); // Convert to JSON and pass to the view
            return View(logs);
        }

        private List<Log> GetLogs()
        {
            List<Log> logs = [];

            try
            {
                using NpgsqlConnection connection = new(_connectionstring);
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT * FROM getlogdetails();", connection);

                var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Log log = new()
                    {

                        LogId = Convert.ToInt32(reader["logid"]),
                        EntityName = Convert.ToString(reader["entityname"]),
                        EntityTableName = Convert.ToString(reader["entitytablename"]),
                        Description = Convert.ToString(reader["description"]),
                        Action = Convert.ToString(reader["action"]),
                        CreatedTime = Convert.IsDBNull(reader["createtime"]) ? default : (DateTime)reader["createtime"],
                    };
                    
                    logs.Add(log);
                }
               
            }
            catch (Exception ex)
            {
                // Log or handle the exception appropriately
                Console.WriteLine($"An error occurred while retrieving logs: {ex.Message}");
            }

            return logs;
        }

    }
}