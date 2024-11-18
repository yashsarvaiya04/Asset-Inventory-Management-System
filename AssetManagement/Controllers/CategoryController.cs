using AssetManagement.Models;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Data;
using System.Text.Json;

namespace AssetManagement.Controllers
{
    public class CategoryController(IConfiguration configuration, IHttpContextAccessor httpContextAccessor, IWebHostEnvironment hostingEnvironment) : Controller

    {

        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        private readonly int _employeeId = (int)httpContextAccessor.HttpContext!.Session.GetInt32("EmployeeId")!;
        private readonly string _imageFolderPath = Path.Combine(hostingEnvironment.WebRootPath, "images");


        [HttpGet]
        public IActionResult Category()
        {
            try
            {
                var categories = GetCategories();
                string jsonData = JsonSerializer.Serialize(categories);
                ViewData["CategoriesJson"] = jsonData;
                return View();
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }


        private List<Category> GetCategories()
        {
            try
            {
                List<Category> categories = [];

                using (var connection = new NpgsqlConnection(_connectionString))
                {
                    connection.Open();

                    using var cmd = new NpgsqlCommand("SELECT * FROM getcategories()", connection);
                    cmd.CommandType = CommandType.Text;
                    var reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        categories.Add(new Category
                        {
                            CategoryId = reader.GetInt32(reader.GetOrdinal("categoryid")),
                            CategoryName = reader.GetString(reader.GetOrdinal("categoryname")),
                            Description = reader.GetString(reader.GetOrdinal("description")),
                            CategoryLogo = reader.IsDBNull(reader.GetOrdinal("categorylogo")) ? "" : reader.GetString(reader.GetOrdinal("categorylogo"))
                        });
                    }
                }
                return categories;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while fetching categories: " + ex.Message);
            }
        }


        [HttpPost]
        public IActionResult AddCategories(Category category, IFormFile categoryLogo)
        {
            try
            {
                string imageName = string.Empty;
                if (categoryLogo != null && categoryLogo.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(categoryLogo.FileName);
                    string categoryImagePath = Path.Combine(_imageFolderPath, "categoryImages");
                    string imagePath = Path.Combine(categoryImagePath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    categoryLogo.CopyTo(stream);
                }

                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();
                using NpgsqlCommand cmd = new("SELECT addcategory(@categoryName, @description, @categoryLogo, @createdBy)", connection);
                cmd.Parameters.AddWithValue("@categoryName", category.CategoryName!);
                cmd.Parameters.AddWithValue("@description", category.Description!);
                cmd.Parameters.AddWithValue("@categoryLogo", imageName);
                cmd.Parameters.AddWithValue("@createdBy", _employeeId!);
                int newCategoryId = (int)cmd.ExecuteScalar()!;

                return Ok(newCategoryId);
            }
            catch (NpgsqlException ex)
            {
                return Json(new { success = false, message = "An error occurred while adding categories: " + ex.Message });
            }
        }



        [HttpPut]
        public IActionResult UpdateCategory(Category category, IFormFile categoryLogo)
        {
            try
            {
                string imageName = string.Empty;
                if (categoryLogo != null && categoryLogo.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(categoryLogo.FileName);
                    string categoryImagePath = Path.Combine(_imageFolderPath, "categoryImages");
                    string imagePath = Path.Combine(categoryImagePath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    categoryLogo.CopyTo(stream);
                }

                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT updatecategory(@categoryId, @categoryName, @description, @categoryLogo, @modifiedBy)", connection);
                cmd.Parameters.AddWithValue("@categoryId", category.CategoryId);
                cmd.Parameters.AddWithValue("@categoryName", category.CategoryName!);
                cmd.Parameters.AddWithValue("@description", category.Description!);
                cmd.Parameters.AddWithValue("@categoryLogo", imageName);
                cmd.Parameters.AddWithValue("@modifiedBy", _employeeId!);

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
            catch (NpgsqlException ex)
            {
                return Json(new { success = false, message = "An error occurred while updating categories: " + ex.Message });
            }
        }


        [HttpDelete]
        public IActionResult DeleteCategory(int categoryId)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT deletecategory(@categoryId, @modifiedBy)", connection);
                cmd.Parameters.AddWithValue("@categoryId", categoryId);
                cmd.Parameters.AddWithValue("@modifiedBy", _employeeId!);

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
            catch (NpgsqlException ex)
            {
                return Json(new { success = false, message = "An error occurred while deleting categories: " + ex.Message });
            }
        }


        [HttpGet]
        public IActionResult Subcategory(int id)
        {
            try
            {
                var subCategories = GetSubcategoriesByCategoryId(id);
                ViewData["SubCategoriesJson"] = JsonSerializer.Serialize(subCategories);
                return View();
            }
            catch (Exception ex)
            {

                return Json(new { success = false, message = ex.Message });
            }
        }


        [HttpGet]
        public List<Subcategory> GetSubcategoriesByCategoryId(int categoryId)
        {
            try
            {
                List<Subcategory> subcategories = [];

                using (NpgsqlConnection conn = new(_connectionString))
                {
                    conn.Open();

                    using NpgsqlCommand cmd = new("SELECT * FROM getsubcategoriesbycategoryid(@categoryid)", conn);
                    cmd.Parameters.AddWithValue("categoryid", categoryId);

                    using NpgsqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        subcategories.Add(new Subcategory
                        {
                            SubCategoryId = Convert.ToInt32(reader["subcategoryid"]),
                            SubCategoryName = Convert.ToString(reader["subcategoryname"]),
                            CategoryName = Convert.ToString(reader["categoryname"]),
                            Description = Convert.ToString(reader["description"]),
                            SubCategoryLogo = reader.IsDBNull(reader.GetOrdinal("subcategorylogo")) ? "" : reader.GetString(reader.GetOrdinal("subcategorylogo")),
                        });
                    }
                }

                return subcategories;
            }
            catch (Exception ex)
            {
                throw new Exception("An error occurred while fetching sub categories: " + ex.Message);
            }
        }

       
        [HttpPost]
        [Route("/Category/Subcategory/AddSubCategories")]
        public IActionResult AddSubCategories(Subcategory subCategory, IFormFile subCategoryLogo)
        {
            try
            {
                string imageName = string.Empty;
                if (subCategoryLogo != null && subCategoryLogo.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(subCategoryLogo.FileName);
                    string subCategoryImagePath = Path.Combine(_imageFolderPath, "subCategoryImages");
                    string imagePath = Path.Combine(subCategoryImagePath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    subCategoryLogo.CopyTo(stream);
                }
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT addsubcategory(@categoryid, @subcategoryname, @description, @subcategorylogo, @createdBy)", connection);
                cmd.Parameters.AddWithValue("@categoryid", Convert.ToInt32(subCategory.CategoryId));
                cmd.Parameters.AddWithValue("@subcategoryname", subCategory.SubCategoryName!);
                cmd.Parameters.AddWithValue("@description", subCategory.Description!);
                cmd.Parameters.AddWithValue("@subcategorylogo", imageName);
                cmd.Parameters.AddWithValue("@createdBy", _employeeId!);

                int newSubCategoryId = (int)cmd.ExecuteScalar()!;

                return Ok(newSubCategoryId);
            }
            catch (NpgsqlException ex)
            {
                return Json(new { success = false, message = "An error occurred while adding sub categories: " + ex.Message });
            }
        }




        [HttpPut]
        [Route("/Category/Subcategory/UpdateSubCategory")]
        public IActionResult UpdateSubCategory(Subcategory subCategory, IFormFile subCategoryLogo)
        {
            try
            {
                string imageName = string.Empty;
                if (subCategoryLogo != null && subCategoryLogo.Length > 0)
                {
                    imageName = Guid.NewGuid().ToString() + Path.GetExtension(subCategoryLogo.FileName);
                    string subCategoryImagePath = Path.Combine(_imageFolderPath, "subCategoryImages");
                    string imagePath = Path.Combine(subCategoryImagePath, imageName);
                    using var stream = new FileStream(imagePath, FileMode.Create);
                    subCategoryLogo.CopyTo(stream);
                }
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();

                using var cmd = new NpgsqlCommand("SELECT updatesubcategory(@subCategoryId, @subCategoryName, @description, @subCategoryLogo, @modifiedBy)", connection);
                cmd.Parameters.AddWithValue("@subCategoryId", subCategory.SubCategoryId);
                cmd.Parameters.AddWithValue("@subCategoryName", subCategory.SubCategoryName!);
                cmd.Parameters.AddWithValue("@description", subCategory.Description!);
                cmd.Parameters.AddWithValue("@subCategoryLogo", imageName);
                cmd.Parameters.AddWithValue("@modifiedBy", _employeeId!);

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
            catch (NpgsqlException ex)
            {
                return Json(new { success = false, message = "An error occurred while updating sub categories: " + ex.Message });
            }
        }



        [HttpDelete]
        [Route("/Category/Subcategory/DeleteSubCategory")]
        public IActionResult DeleteSubCategory(int subCategoryId)
        {
            try
            {
                using var connection = new NpgsqlConnection(_connectionString);
                connection.Open();
                using var cmd = new NpgsqlCommand("SELECT deletesubcategory(@subCategoryId, @modifiedBy)", connection);
                cmd.Parameters.AddWithValue("@subCategoryId", subCategoryId);
                cmd.Parameters.AddWithValue("@modifiedBy", _employeeId!);
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
            catch (NpgsqlException ex)
            {
                return Json(new { success = false, message = "An error occurred while deleting sub categories: " + ex.Message });
            }
        }

    }
}