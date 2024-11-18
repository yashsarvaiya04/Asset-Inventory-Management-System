using AssetManagement.Models;
using FluentEmail.Core;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Npgsql;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Cryptography;


namespace AssetManagement.Controllers
{
    public class HomeController(IConfiguration configuration) : Controller
    {


        private readonly string _connectionstring = configuration.GetConnectionString("DefaultConnection")!;
        private static readonly byte[] EncryptionKey = "MalavVora12345678901234567890123"u8.ToArray();

        public IActionResult LoginPage()
        {

            HttpContext.Session.Remove("EmployeeId");


            return View();
        }

        [HttpPost]
        public IActionResult LoginPage(Employee emp, string recaptchaResponse)
        {
            try
            {
                // Validate reCAPTCHA
                //var captchaResponse = ValidateRecaptcha(recaptchaResponse);
                //if (!captchaResponse.Success)
                //{
                //    // Return error message if reCAPTCHA validation fails
                //    return Json(new { success = false, message = "reCAPTCHA validation failed." });
                //}

                int status = 0;
                int employeeId = 0;
                string? firstName = null;
                string? lastName = null;
                string? image = null;
                string? EncryptedPassword = null;

                using (NpgsqlConnection connection = new(_connectionstring))
                {
                    connection.Open();

                    using NpgsqlCommand command = new("SELECT * FROM validatelogin(@emailtext)", connection);
                    command.Parameters.AddWithValue("@emailtext", emp.Email);

                    using NpgsqlDataReader reader = command.ExecuteReader();
                    if (reader.Read())
                    {
                        // Retrieve status and employee details from the reader
                        status = Convert.ToInt32(reader["status"]);
                        employeeId = Convert.ToInt32(reader["employeeid"]);
                        firstName = reader["firstname"].ToString()!;
                        lastName = reader["lastname"].ToString()!;
                        image = reader["image"].ToString()!;
                        EncryptedPassword = reader["password"].ToString(); // Retrieve the encrypted password
                    }
                }

                switch (status)
                {
                    case 1:
                        return Json(new { success = false, message = "Email Id is not registered" });
                    //case 2:
                    //    return Json(new { success = false, message = "Invalid Credentials" });
                    case 3:
                        // Decrypt the stored encrypted password
                        string decryptedPassword = DecryptPassword(EncryptedPassword!);
                        // Compare decrypted password with the provided password
                        if (decryptedPassword != emp.Password)
                        {
                            return Json(new { success = false, message = "Invalid Credentials" });
                        }
                        else
                        {
                            // Store employee ID and other details in session



                            HttpContext.Session.SetInt32("EmployeeId", employeeId);
                            HttpContext.Session.SetString("FirstName", firstName!);
                            HttpContext.Session.SetString("LastName", lastName!);



                            //HttpContext.Session.Set("Image", image);
                            // Set the success message here
                            return Json(new { success = true, message = "Login Successful" });
                        }
                    case 4:
                        return Json(new { success = false, message = "Employee's login is disabled" });
                    default:
                        return Json(new { success = false, message = "An unknown error occurred during login." });
                }
            }
            catch (Exception)
            {
                // Error occurred
                return Json(new { success = false, message = "An error occurred during login. Please contact the administrator." });
            }
        }
        public static string DecryptPassword(string encryptedPassword)
        {
            if (string.IsNullOrEmpty(encryptedPassword))
            {
                throw new ArgumentException("Encrypted password cannot be null or empty.");
            }

            byte[] encryptedBytes = Convert.FromBase64String(encryptedPassword);

            using (Aes aesAlg = Aes.Create())
            {
                aesAlg.Key = EncryptionKey;
                aesAlg.IV = new byte[aesAlg.BlockSize / 8]; // Initialization Vector (IV) is set to all zeros.

                // Use PKCS7 padding mode
                aesAlg.Padding = PaddingMode.PKCS7;

                // Create a decryptor to perform the stream transform.
                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for decryption.
                using (MemoryStream msDecrypt = new MemoryStream(encryptedBytes))
                {
                    using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                    {
                        using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                        {
                            // Read the decrypted bytes from the decrypting stream and return as a string.
                            return srDecrypt.ReadToEnd();
                        }
                    }
                }
            }
        }



        private static CaptchaResponse ValidateRecaptcha(string recaptchaResponse)
        {
            try
            {
                using var client = new HttpClient();
                var parameters = new Dictionary<string, string>
                {
                    { "secret", "6Ldvt8opAAAAAN9HTYjT3y1I8XhMAGEzz0IhKHOL" },
                    { "response", recaptchaResponse }
                };
                var content = new FormUrlEncodedContent(parameters);
                var response = client.PostAsync("https://www.google.com/recaptcha/api/siteverify", content).Result;
                var responseString = response.Content.ReadAsStringAsync().Result;

                var captchaResponse = JsonConvert.DeserializeObject<CaptchaResponse>(responseString);
                return captchaResponse!;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred during reCAPTCHA validation: {ex.Message}");
                return new CaptchaResponse { Success = false };
            }
        }
        public async Task<IActionResult> ForgotPassword(string email)
        {
            try
            {
            
                bool emailExists = CheckEmailExists(email);

                if (!emailExists)
                {
                    return Json(new { success = false, message = "Email address does not exist." });
                }

                string resetToken = Guid.NewGuid().ToString();

                SaveResetToken(email, resetToken);

                string resetPasswordLink = Url.Action("ResetPassword", "Home", new { email = email!, token = resetToken }, protocol: HttpContext.Request.Scheme)!;

                await SendEmail(email, resetPasswordLink);

                return Json(new { success = true, message = "Reset Password Email sent." });
            }
            catch (Exception)
            {
                return Json(new { success = false, message = "An error occurred while processing your request. Please try again later." });
            }
        }

        private bool CheckEmailExists(string email)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();

                using (NpgsqlCommand command = new NpgsqlCommand("SELECT emailexists(@Email)", connection))
                {
                    command.Parameters.AddWithValue("@Email", email);
                    return (bool)command.ExecuteScalar()!;
                }
            }
        }

        private  Task SendEmail(string email,  string resetPasswordLink)
        {
            try
            {
                using SmtpClient smtpClient = new("smtp.gmail.com");
                smtpClient.Port = 587;
                smtpClient.Credentials = new NetworkCredential("raj.amnex@gmail.com", "rzlivmnchzibtanm");
                smtpClient.EnableSsl = true;



                MailMessage mailMessage = new()
                {
                    From = new MailAddress("raj.amnex@gmail.com"),
                    IsBodyHtml = true,
                    Subject = "AMS Reset Password",
                    Body = GetPasswordResetEmailTemplate(resetPasswordLink),
                };
                mailMessage.To.Add(email);


                smtpClient.Send(mailMessage);
            }
            catch (Exception ex)
            {
                // Log or handle the exception appropriately
                Console.WriteLine($"Error sending email: {ex.Message}");
                
            }

            return Task.CompletedTask;
        }

        private void SaveResetToken(string email, string resetToken)
        {
            using (NpgsqlConnection connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();

                using (NpgsqlCommand command = new NpgsqlCommand("UPDATE employees SET ResetToken = @ResetToken WHERE Email = @Email", connection))
                {
                    command.Parameters.AddWithValue("@ResetToken", resetToken);
                    command.Parameters.AddWithValue("@Email", email);
                    command.ExecuteNonQuery();
                }
            }
        }
        [HttpGet]
        public IActionResult ResetPassword(string email, string token)
        {
            var model = new ResetPassword { Email = email, Token = token };
            return View(model);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ResetPassword(ResetPassword model)
        {
            try
            {
                if (VerifyResetToken(model.Email!, model.Token!))
                {
                    if (ResetUserPassword(model.Email!, model.NewPassword!))
                    {
                        return Json(new { success = true, message = "Password reset successfully." });
                    }
                    else
                    {
                        return Json(new { success = false, message = "Failed to reset password." });
                    }
                }
                else
                {
                    return Json(new { success = false, message = "Invalid reset token." });
                }
            }
            catch 
            {
                return Json(new { success = false, message = "An error occurred while resetting the password. Please try again later." });
            }
        }

        private bool VerifyResetToken(string email, string token)
        {
            using (var connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();
                using (var command = new NpgsqlCommand("SELECT COUNT(*) FROM employees WHERE Email = @Email AND ResetToken = @ResetToken", connection))
                {
                    command.Parameters.AddWithValue("@Email", email);
                    command.Parameters.AddWithValue("@ResetToken", token);
                    int count = Convert.ToInt32(command.ExecuteScalar());
                    return count > 0;
                }
            }
        }

        public bool ResetUserPassword(string email, string newPassword)
        {
            // Encrypt the new password
            string encryptedPassword = EncryptPassword(newPassword);

            // Update the database with the new encrypted password and reset token
            using (var connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();
                using (var command = new NpgsqlCommand("UPDATE employees SET password = @Password, resettoken = NULL WHERE email = @Email", connection))
                {
                    command.Parameters.AddWithValue("@Password", encryptedPassword);
                    command.Parameters.AddWithValue("@Email", email);
                    int rowsAffected = command.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
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

        private static string GetPasswordResetEmailTemplate(string resetPasswordLink)
        {
            // Here you can define your HTML email template with placeholders for password
            string template = @"
    <html>
    <head>
        
    </head>
    <body>
        
        <p>You have requested to reset your password. Please click on the following button to reset your password:</p>
        <a href='{0}' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;'>Reset Password</a>
        <p>Alternatively, you can copy and paste the following link into your browser:</p>
        <p><a href='{0}'>{0}</a></p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Please keep your new password secure and do not share it with anyone.</p>
        <hr>
        <p>Contact Information:</p>
        <p>Name: Malav Vora</p>
        <p>Role: Intern - Integrated</p>
        <p>Phone: (+91)-9106632795</p>
        <p>Website: <a href='http://www.amnex.com'>www.amnex.com</a></p>
        <p>Company: Amnex Infotechnologies Pvt. Ltd.</p>
        <p>Address: Wing-B, 1201/1202/1301, Mondeal Heights, S.G.Highway, Ahmedabad - 380015</p>
    </body>
    </html>";

            return string.Format(template, resetPasswordLink);
        }

        public IActionResult Logout()
        {



            if (HttpContext.Session.GetInt32("EmployeeId") != null)
            {
                HttpContext.Session.Remove("EmployeeId");
                return RedirectToAction("LoginPage"); // Redirect to login page after logout
            }



            return View();
        }









        public IActionResult Dashboard()
        {
            int? employeeId = HttpContext.Session.GetInt32("EmployeeId");

            if (employeeId != null && employeeId > 0)
            {
                // Get employee details
                Employee employee = GetEmployeeDetails(employeeId.Value);

                // Retrieve data
                var dashboard = new Dashboard
                {
                    Employee = employee,
                    AvailableAssetCount = GetAvailableAssetCount(),
                    AllocatedAssetCount = GetAllocatedAssetCount(),
                    MaintenanceAssetCount = GetMaintenanceAssetCount(),
                    FreeAssetCount = GetFreeAssetCount(),
                    SubcategoriesCount = GetSubcategoriesCount(),
                    AssetAllocationsPerYear = GetAssetAllocationsPerYear()
                };

                var assetAllocationsByDepartment = GetAssetAllocationsByDepartment();
                dashboard.DepartmentNames = [];
                dashboard.AllocationCounts = [];
                foreach (DataRow row in assetAllocationsByDepartment.Rows)
                {
                    dashboard.DepartmentNames.Add(row["DepartmentName"].ToString()!);
                    dashboard.AllocationCounts.Add(Convert.ToInt32(row["AllocationCount"]));
                }

                return View(dashboard);
            }
            else
            {
                //Employee ID session data not found or invalid, redirect to login
                return RedirectToAction("LoginPage");
            }
        }


        private int GetAvailableAssetCount()
        {
            int count = 0;

            try
            {
                using NpgsqlConnection connection = new(_connectionstring);
                connection.Open();

                using NpgsqlCommand command = new("SELECT COUNT(*) FROM assets where isactive = true", connection);
                count = Convert.ToInt32(command.ExecuteScalar());
            }
            catch (Exception ex)
            {
                // Handle exceptions
                Console.WriteLine($"Error occurred while fetching available asset count: {ex.Message}");
            }

            return count;
        }
        private int GetAllocatedAssetCount()
        {
            int count = 0;

            try
            {
                using NpgsqlConnection connection = new(_connectionstring);
                connection.Open();

                using NpgsqlCommand command = new("SELECT COUNT(*) FROM assets a INNER JOIN assetallocation aa ON aa.assetid = a.assetid AND aa.isactive =true AND aa.freedate IS NULL where a.isavailable = false  AND a.isactive=true;", connection);
                count = Convert.ToInt32(command.ExecuteScalar());
            }
            catch (Exception ex)
            {
                // Handle exceptions
                Console.WriteLine($"Error occurred while fetching available asset count: {ex.Message}");
            }

            return count;
        }

        private int GetMaintenanceAssetCount()
        {
            int count = 0;

            try
            {
                using NpgsqlConnection connection = new(_connectionstring);
                connection.Open();

                using NpgsqlCommand command = new("SELECT COUNT(*) FROM maintenance where isactive = true ;", connection);
                count = Convert.ToInt32(command.ExecuteScalar());
            }
            catch (Exception ex)
            {
                // Handle exceptions
                Console.WriteLine($"Error occurred while fetching available asset count: {ex.Message}");
            }

            return count;
        }
        private int GetFreeAssetCount()
        {
            int count = 0;

            try
            {
                using NpgsqlConnection connection = new(_connectionstring);
                connection.Open();

                using NpgsqlCommand command = new("SELECT COUNT(*) FROM assets where isavailable = true and isactive = true ;", connection);
                count = Convert.ToInt32(command.ExecuteScalar());
            }
            catch (Exception ex)
            {
                // Handle exceptions
                Console.WriteLine($"Error occurred while fetching available asset count: {ex.Message}");
            }

            return count;
        }
        [HttpGet]
        private Employee GetEmployeeDetails(int employeeId)
        {
            Employee employee = new();

            using (NpgsqlConnection connection = new(_connectionstring))
            {
                connection.Open();

                using NpgsqlCommand command = new("SELECT * FROM getemployee(@employeeId)", connection);
                command.Parameters.AddWithValue("@employeeId", employeeId);
                command.CommandType = CommandType.Text;

                using NpgsqlDataReader reader = command.ExecuteReader();
                if (reader.Read())
                {
                    employee.EmployeeId = reader.GetInt32("employeeid");
                    employee.DepartmentId = reader.GetInt32("departmentid");
                    employee.DepartmentName = reader.GetString("departmentname");
                    employee.FirstName = reader.GetString("firstname");
                    employee.MiddleName = reader.IsDBNull("middlename") ? "" : reader.GetString("middlename");
                    employee.LastName = reader.GetString("lastname");
                    employee.Address = reader.GetString("address");
                    employee.CountryId = reader.GetInt32("countryid");
                    employee.CountryName = reader.GetString("countryname");
                    employee.StateId = reader.GetInt32("stateid");
                    employee.StateName = reader.GetString("statename");
                    employee.CityId = reader.GetInt32("cityid");
                    employee.CityName = reader.GetString("cityname");
                    employee.Designation = reader.GetString("designation");
                    employee.LoginEnabled = reader.GetBoolean("loginenabled");
                    employee.Email = reader.GetString("email");
                    employee.PhoneNumber = reader.GetInt64("phonenumber");
                    employee.EmployeeImage = reader.IsDBNull("employeeimage") ? "" : reader.GetString("employeeimage");
                }
            }

            return employee;
        }



        private Dictionary<string, long> GetSubcategoriesCount()
        {
            Dictionary<string, long> subcategoryAllocationCount = [];

            using (var connection = new NpgsqlConnection(_connectionstring))
            {
                connection.Open();

                var command = new NpgsqlCommand("SELECT * FROM public.getsubcategoryallocationcount()", connection);

                using var reader = command.ExecuteReader();
                while (reader.Read())
                {
                    string subcategoryName = reader.GetString(0);
                    long allocationCount = reader.GetInt64(1);
                    subcategoryAllocationCount.Add(subcategoryName, allocationCount);
                }
            }

            return subcategoryAllocationCount;
        }


        private Dictionary<int, int> GetAssetAllocationsPerYear()
        {
            Dictionary<int, int> allocationsPerYear = [];

            try
            {

                using NpgsqlConnection connection = new(_connectionstring);
                connection.Open();

                using NpgsqlCommand command = new("select * from getcountassetsbyyear();", connection);
                using NpgsqlDataReader reader = command.ExecuteReader();
                while (reader.Read())
                {
                    int year = reader.GetInt32(0);
                    int count = reader.GetInt32(1);
                    allocationsPerYear.Add(year, count);
                }
            }
            catch (Exception ex)
            {
                // Handle exceptions
                Console.WriteLine($"Error occurred while fetching asset allocations per year: {ex.Message}");
            }

            return allocationsPerYear;
        }

        private DataTable GetAssetAllocationsByDepartment()
        {
            DataTable dataTable = new();
            using (var connection = new NpgsqlConnection(_connectionstring))
            {

                string query = "select * from GetcountAssetAllocationsByDepartment();";

                using NpgsqlCommand command = new(query, connection);
                connection.Open();
                using NpgsqlDataAdapter adapter = new(command);
                adapter.Fill(dataTable);
            }
            return dataTable;
        }

        public IActionResult UserProfile(int employeeId)
        {
            // Call the GetEmployeeDetails method to fetch employee details
            Employee employee = GetEmployeeDetails(employeeId);

            // Pass the employee details to the view
            return View(employee); // Use a model-based approach
        }





        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }





}