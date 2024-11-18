using Npgsql;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Net.Http;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSession();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseSession();
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=LoginPage}/{id?}");

app.Use(async (context, next) =>
{
    var path = context.Request.Path;
    var session = context.Session;
    var employeeId = session.GetString("EmployeeId");
    if (path.StartsWithSegments("/Home/LoginPage") || path.StartsWithSegments("/") || path.StartsWithSegments("/Home/ForgotPassword") || path.StartsWithSegments("/Home/ResetPassword") || !string.IsNullOrEmpty(employeeId))
    {
        await next();
        if (context.Response.StatusCode == 404)
        {
            context.Response.Redirect("/Home/Error");
        }
        return;
    }

    context.Response.Redirect("/Home/LoginPage");
});
app.Use(async (context, next) =>
{

    try
    {
        await next();
    }
    catch (Exception ex)
    {
        var controllerName = context.Request.RouteValues["controller"];
        var actionName = context.Request.RouteValues["action"];
        var stackTrace = ex.StackTrace;
        var errorMessage = ex.Message;

        IConfiguration configuration = new ConfigurationBuilder()
           .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
           .Build();

        string _connectionString = configuration.GetConnectionString("DefaultConnection")!;

        using NpgsqlConnection connection = new(_connectionString);
        using NpgsqlCommand cmd = new("SELECT adderrorlog(@controllerName, @actionName,@stackTrace,@errorMessage)", connection);
        cmd.Parameters.AddWithValue("@controllerName", controllerName!);
        cmd.Parameters.AddWithValue("@actionName", actionName!);
        cmd.Parameters.AddWithValue("@stackTrace", stackTrace!);
        cmd.Parameters.AddWithValue("@errorMessage", errorMessage);
        connection.Open();
        if ((int)cmd.ExecuteScalar()! > 0)
        {
            if (errorMessage != "")
            {
                context.Response.StatusCode = StatusCodes.Status500InternalServerError;
                await context.Response.WriteAsync(errorMessage);
            }
            else
            {
                context.Response.Redirect("/Home/Error");
            }
        }
        else
        {
            context.Response.Redirect("/Home/Error");
        }
    }
});

app.Run();







