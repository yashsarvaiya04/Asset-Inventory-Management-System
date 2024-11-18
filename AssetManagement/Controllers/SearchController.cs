using AssetManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Data;

namespace AssetManagement.Controllers
{
    public class SearchController(IConfiguration configuration) : Controller
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;

        [HttpGet]
        public IActionResult GetDepartments()
        {
            List<Department> departments = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
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
                    departments.Add(department); // Adding each asset allocation to the list.
                }
            }

            return Json(departments);
        }

        [HttpGet]
        public IActionResult GetCategories()
        {
            List<Category> categories = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getcategories()", conn);

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    // Mapping database records to AssetAllocation objects.
                    Category category = new()
                    {
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),

                    };
                    categories.Add(category); // Adding each asset allocation to the list.
                }
            }


            return Json(categories);
        }

        [HttpGet]
        public IActionResult GetSubCategories()
        {
            List<Subcategory> subcategories = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getsubcategories()", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    // Mapping database records to AssetAllocation objects.
                    Subcategory subcategory = new()
                    {
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"]),

                    };
                    subcategories.Add(subcategory); // Adding each asset allocation to the list.
                }
            }
            return Json(subcategories);
        }

        [HttpGet]
        public IActionResult GetSubCategoriesByCategoryId(int categoryId)
        {
            List<Subcategory> subcategories = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getsubcategoriesbycategoryid(@categoryId)", conn);
                cmd.Parameters.AddWithValue("@categoryId", categoryId);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    // Mapping database records to AssetAllocation objects.
                    Subcategory subcategory = new()
                    {
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"]),

                    };
                    subcategories.Add(subcategory); // Adding each asset allocation to the list.
                }
            }
            return Json(subcategories);

        }

        [HttpGet]
        public IActionResult GetAvailableAssets()
        {
            List<Asset> assets = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getavailableassets()", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Asset asset = new()
                    {
                        AssetId = Convert.ToInt32(reader["assetid"]),
                        AssetSerialNo = Convert.ToString(reader["assetserialno"]),
                        AssetName = Convert.ToString(reader["assetname"]),
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,

                    };
                    assets.Add(asset);
                }
            }
            return Json(assets);

        }

        [HttpGet]
        public IActionResult GetAssets()
        {
            List<Asset> assets = [];

            // Replace with your actual connection string
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
                        AssetName = Convert.ToString(reader["assetname"]),
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,

                    };
                    assets.Add(asset);
                }
            }
            return Json(assets);

        }

        [HttpGet]
        public IActionResult GetAssetsByCategoryId(int categoryId)
        {
            List<Asset> assets = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getavailableassetsbycategoryid(@categoryId)", conn);
                cmd.Parameters.AddWithValue("@categoryId", categoryId);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    // Mapping database records to AssetAllocation objects.
                    Asset asset = new()
                    {
                        AssetId = Convert.ToInt32(reader["assetid"]),
                        AssetSerialNo = Convert.ToString(reader["assetserialno"]),
                        AssetName = Convert.ToString(reader["assetname"]),
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,

                    };
                    assets.Add(asset); // Adding each asset allocation to the list.
                }
            }

            return Json(assets);
        }

        [HttpGet]
        public IActionResult GetAssetsBySubCategoryId(int subCategoryId)
        {
            List<Asset> assets = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getavailableassetsbysubcategoryid(@subCategoryId)", conn);
                cmd.Parameters.AddWithValue("@subCategoryId", subCategoryId);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    // Mapping database records to AssetAllocation objects.
                    Asset asset = new()
                    {
                        AssetId = Convert.ToInt32(reader["assetid"]),
                        AssetSerialNo = Convert.ToString(reader["assetserialno"]),
                        AssetName = Convert.ToString(reader["assetname"]),
                        CategoryId = Convert.ToInt32(reader["categoryid"]),
                        CategoryName = Convert.ToString(reader["categoryname"]),
                        SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                        SubCategoryName = Convert.ToString(reader["subcategoryname"])!,

                    };
                    assets.Add(asset); // Adding each asset allocation to the list.
                }
            }

            return Json(assets);
        }

        [HttpGet]
        public IActionResult GetEmployees()
        {
            List<Employee> employees = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getemployees()", conn);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Employee employee = new()
                    {
                        EmployeeId = Convert.ToInt32(reader["employeeid"])!,
                        EmployeeNo = Convert.ToString(reader["employeeserialno"])!,
                        FirstName = Convert.ToString(reader["firstname"])!,
                        LastName = Convert.ToString(reader["lastname"])!,
                        DepartmentId = Convert.ToInt32(reader["departmentid"]),
                        DepartmentName = Convert.ToString(reader["departmentname"]),

                    };
                    employees.Add(employee);
                }
            }
            return Json(employees);

        }



        [HttpGet]
        public IActionResult GetEmployeesByDepartmentsId(int departmentId)
        {
            List<Employee> employees = [];

            // Replace with your actual connection string
            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM getemployeesbydepartments(@departmentId)", conn);
                cmd.Parameters.AddWithValue("@departmentId", departmentId);
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Employee employee = new()
                    {
                        EmployeeId = Convert.ToInt32(reader["employeeid"])!,
                        EmployeeNo = Convert.ToString(reader["employeeserialno"])!,
                        FirstName = Convert.ToString(reader["firstname"])!,
                        LastName = Convert.ToString(reader["lastname"])!,
                        DepartmentId = Convert.ToInt32(reader["departmentid"]),
                        DepartmentName = Convert.ToString(reader["departmentname"]),

                    };
                    employees.Add(employee);
                }
            }
            return Json(employees);
        }



        [HttpGet]
        public IActionResult GetCountries()
        {
            List<Country> countries = [];

            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM public.getcountries()", conn);
                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Country country = new()
                    {
                        CountryId = Convert.ToInt32(reader["countryid"])!,
                        CountryName = Convert.ToString(reader["countryname"])!,
                    };

                    countries.Add(country);
                }
            }

            return Json(countries);

        }

        [HttpGet]
        public IActionResult GetStates()
        {
            List<State> states = [];

            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM public.getstates()", conn);
    
                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    State state = new()
                    {
                        StateId = Convert.ToInt32(reader["StateId"])!,
                        StateName = Convert.ToString(reader["statename"])!,
                        CountryId = Convert.ToInt32(reader["countryid"])!,
                        CountryName = Convert.ToString(reader["countryname"])!,
                    };

                    states.Add(state);
                }
            }

            return Json(states);
        }

        [HttpGet]
        public IActionResult GetStatesByCountryId(int countryId)
        {
            List<State> states = [];

            using (NpgsqlConnection conn = new(_connectionString))
            {
                conn.Open();

                using NpgsqlCommand cmd = new("SELECT * FROM public.getstatesbycountryid(@countryId)", conn);
                cmd.Parameters.AddWithValue("countryId", countryId);

                using NpgsqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    State state = new()
                    {
                        StateId = Convert.ToInt32(reader["StateId"])!,
                        StateName = Convert.ToString(reader["statename"])!,
                        CountryId = Convert.ToInt32(reader["countryid"])!,
                        CountryName = Convert.ToString(reader["countryname"])!,
                    };

                    states.Add(state);
                }
            }

            return Json(states);
        }

        [HttpGet]
        public IActionResult GetCities()
        {
            List<City> cities = [];

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT * FROM public.getcities()", connection);


                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    City city = new()
                    {
                        CityId = Convert.ToInt32(reader["cityid"])!,
                        CityName = Convert.ToString(reader["cityname"])!,
                        StateId = Convert.ToInt32(reader["StateId"])!,
                        StateName = Convert.ToString(reader["statename"])!,
                        CountryId = Convert.ToInt32(reader["countryid"])!,
                        CountryName = Convert.ToString(reader["countryname"])!,
                    };

                    cities.Add(city);
                }
            }

            return Json(cities);
        }

        [HttpGet]
        public IActionResult GetCitiesByStateId(int stateId)
        {
            List<City> cities = [];

            using (var connection = new NpgsqlConnection(_connectionString))
            {
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT * FROM public.getcitiesbystateid(@stateId)", connection);
                cmd.Parameters.AddWithValue("stateId", stateId);

                using var reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    City city = new()
                    {
                        CityId = Convert.ToInt32(reader["cityid"])!,
                        CityName = Convert.ToString(reader["cityname"])!,
                        StateId = Convert.ToInt32(reader["StateId"])!,
                        StateName = Convert.ToString(reader["statename"])!,
                        CountryId = Convert.ToInt32(reader["countryid"])!,
                        CountryName = Convert.ToString(reader["countryname"])!,
                    };

                    cities.Add(city);
                }
            }

            return Json(cities);
        }

    }
}