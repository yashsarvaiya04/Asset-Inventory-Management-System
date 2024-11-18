//function getEmployeeD(employeeId) {

//    $.ajax({
//        url: "/Home/GetEmployeeDetails",
//        type: "GET",
//        data: { EmployeeId: employeeId },
//        success: function (employee) {
//            console.log("Employee data:", employee);

//            $("#profileDisplayName").text(employee.firstName + ' ' + employee.lastName);
//            $("#profileDisplayEmail").text(employee.email);

//            $("#EmpName").val(employee.firstName + ' ' + employee.lastName);
//            $("#DepartmentName").val(employee.departmentName);
//            $("#Designation").val(employee.designation);
//            $("#EmployeeEmail").val(employee.email);
//            $("#PhoneNo").val(employee.phoneNumber);
//            $("#Country").val(employee.countryName || "");
//            $("#State").val(employee.stateName || "");
//            $("#City").val(employee.cityName);
//        },
//        error: function (xhr, status, error) {
//            console.error("Error fetching employee details:", error);
//            alert("Error fetching employee details. Please try again later.");
//        }
//    });
//}


//    // Ensure the event handler is bound only once
//$(document).ready(function () {
//    var employeeId = "@ViewBag.EmployeeId"; // Get employeeId from ViewBag
//    console.log("Page loaded. Employee ID:", employeeId);

//    if (employeeId && employeeId > 0) {
//        getEmployeeD(employeeId); // Call the function to fetch data
//    } else {
//        console.error("Employee ID not found");
//        alert("Employee ID not found");
//    }
//});
