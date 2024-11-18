$(function () {
   



    const shortingColumnName = "FirstName";
    const toolbarTemplate = '<button class="k-button k-primary" id="openAddEmployeeModalBtn"">Add Employee</button>';
    const exportName = "Employees";
    const columns = [
        { field: "EmployeeId", hidden: true },
        //{
        //    field: "EmployeeName",
        //    title: "Name",
        //    template: "#= FirstName # # if(MiddleName) { # #= MiddleName # # } # #= LastName #",
        //    width: "250px"
        //},
        { field: "EmployeeNo", title: "Employee No", width: "150px" },
        { field: "FirstName", title: "First Name", width: "150px" },
        { field: "MiddleName", title: "Middle Name", width: "150px", hidden: true },
        { field: "LastName", title: "Last Name", width: "150px" },
        { field: "DepartmentName", title: "Department", width: "150px" },
        { field: "Designation", title: "Designation", width: "150px" },
        { field: "Email", title: "Email", width: "200px" },
        { field: "PhoneNumber", title: "Phone Number", width: "150px" },

        { field: "CountryName", title: "Country", width: "150px" },
        { field: "StateName", title: "State", width: "150px" },
        { field: "CityName", title: "City", width: "150px" },
        { field: "Address", title: "Address", width: "200px" },
        {
            field: "EmployeeImage",
            title: "Image",
            width: "150px",
            hidden: true,
            template: function (dataItem) {
                return '<img src="/images/employeeImages/' + dataItem.EmployeeImage + '" onerror="this.onerror=null;this.src=\'/images/locationDummyImage.jpg\';" alt="Location Image" class="showModalImage" style="max-width:50px;max-height:50px; border-radius: 50%;"  />';
            },
            visible: function (dataItem) {
                return dataItem.EmployeeImage !== null;
            },

        },
        {
            command: [
                { name: "edit", text: "", iconClass: "k-icon k-i-edit", click: openEditModal },
                { name: "delete", text: "", iconClass: "k-icon k-i-delete", click: openDeleteModal }
            ],
            title: "Action",
            width: "100px"
        }
    ];
    initializeGrid(employeesData, shortingColumnName, exportName, toolbarTemplate, columns);






















    // ADD MODAL
    $(document).on("click", "#openAddEmployeeModalBtn", function () {

        $("#addEmployeeModal").modal("show");

    });
    $("#addEmployeeForm").validate({
        rules: {
            addEmployeeNo: {
                required:true
            },
            addFirstname: {
                required: true
            },
            addLastname: {
                required: true
            },
            addDesignation: {
                required: true
            },
            addDepartmentId: {
                required: true
            },

            addPhonenumber: {
                required: true,
                phoneIN: true
            },
            addnewEmail: {
                required: true,
                email: true
            },
            addnewPassword: {
                required: true
            },
            addCountryId: {
                required: true
            },
            addStateId: {
                required: true
            },
            addCityId: {
                required: true
            },
            addAddress: {
                required: true
            },
            addLoginenabled: {
                required: true
            }
        },
        // Customize error messages
        messages: {
            addEmployeeNo: {
                required: "Please enter employee no"
            },
            addFirstname: {
                required: "Please enter first name"
            },
            addLastname: {
                required: "Please enter last name"
            },
            addDesignation: {
                required: "Please enter designation"
            },
            addDepartmentId: {
                required: "Please Selete the Department"
            },
            addPhonenumber: {
                required: "Please enter phone number"
            },
            addnewEmail: {
                required: "Please enter email address",
                email: "Please enter a valid email address"
            },
            addCountryId: {
                required: "Please select country"
            },
            addStateId: {
                required: "Please select state"
            },
            addCityId: {
                required: "Please select city"
            },
            addAddress: {
                required: "Please enter address"
            },
            addnewPassword: {
                required: "Please enter password"
            },


            addLoginenabled: {
                required: "Please select login enabled status"
            }
        },
        // Specify where to display error messages
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        }
    });
    $.validator.addMethod("phoneIN", function (phoneNumber, element) {
        phoneNumber = phoneNumber.replace(/\s+/g, ""); // Remove spaces
        return this.optional(element) || /^[0-9]{10}$/.test(phoneNumber);
    }, "Please enter a valid phone number.");
    $(document).on("click", "#closeadd", function () {
        console.log("close button clicked");
        $('#addEmployeeForm')[0].reset();
        $('#addEmployeeForm').validate().resetForm();
    });

    $(document).on("click", "#saveEmployeeBtn", function () {
        console.log("hello");
        if ($("#addEmployeeForm").valid()) {
            var employeeData = new FormData();
            employeeData.append('DepartmentId', $("#addDepartmentId").val());
            employeeData.append('EmployeeNo', $("#addEmployeeNo").val());
            employeeData.append('FirstName', $("#addFirstname").val());
            employeeData.append('MiddleName', $("#addMiddlename").val());
            employeeData.append('LastName', $("#addLastname").val());
            employeeData.append('Password', $("#addnewPassword").val());
            employeeData.append('Designation', $("#addDesignation").val());
            employeeData.append('LoginEnabled', $("#addLoginenabled").val() === "true");
            employeeData.append('Email', $("#addnewEmail").val());
            employeeData.append('PhoneNumber', $("#addPhonenumber").val());
            employeeData.append('Address', $("#addAddress").val());
            employeeData.append('CountryId', $("#addCountryId").val());
            employeeData.append('StateId', $("#addStateId").val());
            employeeData.append('CityId', $("#addCityId").val());
            employeeData.append('EmployeeImage', $('#addEmployeeImage').prop('files')[0]);
            employeeData.append('Createdby', null);
            console.log("Malav");
            $.ajax({
                url: "/Employee/AddEmployee",
                method: "POST",
                data: employeeData,
                processData: false,
                contentType: false,
                success: function (response) {
                    Swal.fire({ icon: 'success', title: "Employee Added Successfully.", showConfirmButton: false, timer: 2000 });
                    $("#addEmployeeModal").modal("hide");

                    // Show success message
                    location.reload();
                },
                error: function (error) {
                    console.log(error);
                    const response = error.responseText;

                    // Show error message
                    Swal.fire({ icon: 'error', title: 'Error', text: "Failed to add employee data. Please try again later." });

                    $("#addEmployeeModal").modal("hide");
                    location.reload();
                }
            });
        }
    });





    populateCountriesDropdown();
    function populateCountriesDropdown() {
        $.ajax({
            url: '/Employee/GetCountries',
            type: 'GET',
            success: function (response) {
                $("#addCountryId").empty();
                $("#addCountryId").append('<option value="">Select Country</option>');
                response.forEach(function (country) {
                    $("#addCountryId").append('<option value="' + country.countryId + '">' + country.countryName + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching countries:', error);
            }
        });
    }


    function populateStatesDropdown(selectedCountryId) {
        $("#addStateId").empty();
        $("#addStateId").append('<option value="">Select State</option>');

        $.ajax({
            url: '/Employee/GetStatesByCountryId',
            type: 'GET',
            data: { countryId: selectedCountryId },
            success: function (response) {
                response.forEach(function (state) {
                    $("#addStateId").append('<option value="' + state.stateId + '">' + state.stateName + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching states:', error);
            }
        });
    }

    function populateCitiesDropdown(selectedStateId) {
        $("#addCityId").empty();
        $("#addCityId").append('<option value="">Select City</option>');

        $.ajax({
            url: '/Employee/GetCitiesByStateId',
            type: 'GET',
            data: { stateId: selectedStateId },
            success: function (response) {
                response.forEach(function (city) {
                    $("#addCityId").append('<option value="' + city.cityId + '">' + city.cityName + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching cities:', error);
            }
        });
    }


    $(document).on("change", "#addCountryId", function () {

        var selectedCountryId = $(this).val();
        if (selectedCountryId) {
            populateStatesDropdown(selectedCountryId);
            $("#addStateId").prop("disabled", false);
        } else {
            $("#addStateId").empty().append('<option value="">Select Country First</option>');
            $("#addStateId").prop("disabled", true);
        }
    });

    $(document).on("change", "#addStateId", function () {

        var selectedStateId = $(this).val();
        if (selectedStateId) {
            populateCitiesDropdown(selectedStateId);
            $("#addCityId").prop("disabled", false);
        } else {
            $("#addCityId").empty().append('<option value="">Select State First</option>');
            $("#addCityId").prop("disabled", true);
        }
    });

    var initialSelectedCountryId = $("#addCountryId").val();
    if (initialSelectedCountryId) {
        populateStatesDropdown(initialSelectedCountryId);
    }

    var initialSelectedStateId = $("#addStateId").val();
    if (initialSelectedStateId) {
        populateCitiesDropdown(initialSelectedStateId);
    }


    // EDIT MODAL
    function openEditModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        populateEditModal(dataItem);
        console.log("hello");
        $('#editModal').modal('show');
    }

    function populateEditModal(dataItem) {
        console.log(dataItem);

        $("#editEmployeeId").val(dataItem.EmployeeId);
        $("#editEmployeeNo").val(dataItem.EmployeeNo);
        $("#editFirstname").val(dataItem.FirstName);
        $("#editLastname").val(dataItem.LastName);
        $("#editEmail").val(dataItem.Email);
        $("#editDepartmentId").val(dataItem.DepartmentId);
        $("#editMiddlename").val(dataItem.MiddleName);
        $("#editAddress").val(dataItem.Address);
        $("#editPhonenumber").val(dataItem.PhoneNumber);
        $("#editDesignation").val(dataItem.Designation);
        $("#editCountryId").val(dataItem.CountryId);

        $("#editStateId").val(dataItem.StateId);
        $("#editCityId").val(dataItem.CityId);

        $("#editCountryName").val(dataItem.CountryName);
        $("#editStateName").val(dataItem.StateName);
        $("#editCityName").val(dataItem.CityName);


        $("#editLoginenabled").val(dataItem.LoginEnabled ? "true" : "false");
        populateEditCountriesField(dataItem.CountryId);
        populateEditStatesField(dataItem.CountryId, dataItem.StateId);
        populateEditCitiesField(dataItem.CountryId, dataItem.StateId, dataItem.CityId);
    }
    $("#editForm").validate({
        rules: {
            editFirstname: {
                required: true
            },
            editLastname: {
                required: true
            },
            editDesignation: {
                required: true
            },
            editDepartmentId: {
                required: true
            },
            editPhonenumber: {
                required: true,
                phoneIN: true
            },
            editEmail: {
                required: true,
                email: true
            },
            editCountryId: {
                required: true
            },
            editStateId: {
                required: true
            },
            editCityId: {
                required: true
            },
            editAddress: {
                required: true
            },
            editLoginenabled: {
                required: true
            }
        },
        messages: {
            editFirstname: {
                required: "Please enter first name"
            },
            editLastname: {
                required: "Please enter last name"
            },
            editDesignation: {
                required: "Please enter designation"
            },
            editDepartmentId: {
                required: "Please select department"
            },
            editPhonenumber: {
                required: "Please enter phone number",
                pattern: "Please enter a valid 10-digit Indian phone number"
            },
            editEmail: {
                required: "Please enter email address",
                email: "Please enter a valid email address"
            },
            editCountryId: {
                required: "Please select country"
            },
            editStateId: {
                required: "Please select state"
            },
            editCityId: {
                required: "Please select city"
            },
            editAddress: {
                required: "Please enter address"
            },
            editLoginenabled: {
                required: "Please select login enabled status"
            }
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        }
    });
    populateEditCountriesDropdown();

    function populateEditCountriesField(countryId) {
        console.log(countryId);
        $.ajax({
            url: '/Employee/GetCountries',
            type: 'GET',
            success: function (response) {
                $("#editCountryId").empty();
                $("#editCountryId").append('<option value="">Select Country</option>');
                response.forEach(function (country) {
                    $("#editCountryId").append('<option value="' + country.countryId + '">' + country.countryName + '</option>');
                });

                $("#editCountryId").val(countryId);

            },
            error: function (xhr, status, error) {
                console.error('Error fetching countries:', error);
            }
        });
    }

    function populateEditStatesField(countryId, stateId) {
        $.ajax({
            url: '/Employee/GetStatesByCountryId',
            type: 'GET',
            data: { countryId: countryId },
            success: function (response) {
                $("#editStateId").empty();
                $("#editStateId").append('<option value="">Select State</option>');
                response.forEach(function (state) {

                    $("#editStateId").append('<option value="' + state.stateId + '">' + state.stateName + '</option>');

                });
                $("#editStateId").val(stateId);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching states:', error);
            }
        });
    }

    function populateEditCitiesField(countryId, stateId, cityId) {
        $.ajax({
            url: '/Employee/GetCitiesByStateId',
            type: 'GET',
            data: { stateId: stateId },
            success: function (response) {
                $("#editCityId").empty();
                $("#editCityId").append('<option value="">Select City</option>');
                response.forEach(function (city) {

                    $("#editCityId").append('<option value="' + city.cityId + '">' + city.cityName + '</option>');

                });
                $("#editCityId").val(cityId);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching states:', error);
            }
        });
    }


    function populateEditCountriesDropdown() {
        $.ajax({
            url: '/Employee/GetCountries',
            type: 'GET',
            success: function (response) {
                $("#editCountryId").empty();
                $("#editCountryId").append('<option value="">Select Country</option>');
                response.forEach(function (country) {
                    $("#editCountryId").append('<option value="' + country.countryId + '">' + country.countryName + '</option>');
                });


            },
            error: function (xhr, status, error) {
                console.error('Error fetching countries:', error);
            }
        });
    }


    function populateEditStatesDropdown(selectedCountryId) {
        $.ajax({
            url: '/Employee/GetStatesByCountryId',
            type: 'GET',
            data: { countryId: selectedCountryId },
            success: function (response) {
                $("#editStateId").empty();
                $("#editStateId").append('<option value="">Select State</option>');
                response.forEach(function (state) {

                    $("#editStateId").append('<option value="' + state.stateId + '">' + state.stateName + '</option>');

                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching states:', error);
            }
        });
    }

    function populateEditCitiesDropdown(selectedStateId) {
        $.ajax({
            url: '/Employee/GetCitiesByStateId',
            type: 'GET',
            data: { stateId: selectedStateId },
            success: function (response) {
                $("#editCityId").empty();
                $("#editCityId").append('<option value="">Select City</option>');
                response.forEach(function (city) {
                    $("#editCityId").append('<option value="' + city.cityId + '">' + city.cityName + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching states:', error);
            }
        });
    }

    $(document).on("change", "#editCountryId", function () {

        var selectedCountryId = $(this).val();
        if (selectedCountryId) {
            populateEditStatesDropdown(selectedCountryId);
        } else {
            $("#editStateId").empty().append('<option value="">Select Country First</option>');
        }
    });

    $(document).on("change", "#editStateId", function () {

        var selectedStateId = $(this).val();
        if (selectedStateId) {
            populateEditCitiesDropdown(selectedStateId);
        } else {
            $("#editCityId").empty().append('<option value="">Select State First</option>');
        }
    });
    $(document).on("click", ".closeedit", function () {
        
        $('#editForm').validate().resetForm();
    });
    var initialSelectedCountryId = $("#editCountryId").val();
    if (initialSelectedCountryId) {
        populateEditStatesDropdown(initialSelectedCountryId);
    }

    var initialSelectedStateId = $("#editStateId").val();
    if (initialSelectedStateId) {
        populateEditCitiesDropdown(initialSelectedStateId);
    }

    // Event listener for change in country selection in edit modal
    //$(document).on("change", "#editCountryId", function () {
    //    var selectedCountryId = $(this).val();
    //    if (selectedCountryId) {
    //        populateEditStatesDropdown(selectedCountryId);
    //    } else {
    //        $("#editStateId").empty().append('<option value="">Select Country First</option>');
    //        $("#editCityId").empty().append('<option value="">Select State First</option>');
    //    }
    //});

    // Event listener for change in state selection in edit modal
    //$(document).on("change", "#editStateId", function () {

    //    var selectedStateId = $(this).val();
    //    if (selectedStateId) {
    //        populateEditCitiesDropdown(selectedStateId);
    //    } else {
    //        $("#editCityId").empty().append('<option value="">Select State First</option>');
    //    }
    //});



    //var initialSelectedCountryId = $("#editCountryId").val();
    //if (initialSelectedCountryId) {
    //    populateEditStatesDropdown(initialSelectedCountryId);
    //}

    //var initialSelectedStateId = $("#editStateId").val();
    //if (initialSelectedStateId) {
    //    populateEditCitiesDropdown(initialSelectedStateId);
    //}


    $(document).on("click", "#saveChangesBtn", function () {
        if ($("#editForm").valid()) {
            var editedEmployeeData = {
                EmployeeId: $("#editEmployeeId").val(),
                DepartmentId: $("#editDepartmentId").val(),
                FirstName: $("#editFirstname").val(),
                MiddleName: $("#editMiddlename").val() || null,
                LastName: $("#editLastname").val(),
                Designation: $("#editDesignation").val(),
                Email: $("#editEmail").val(),
                Phonenumber: $("#editPhonenumber").val(),
                CityId: $("#editCityId").val(),
                Address: $("#editAddress").val(),
                Loginenabled: ($("#editLoginenabled").val() === "true") ? true : false
            };
            
            $.ajax({
                url: "/Employee/UpdateEmployee",
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(editedEmployeeData),
                success: function (response) {
                    Swal.fire({ icon: 'success', title: "Employee Updated Successfully.", showConfirmButton: false, timer: 3000 });
                    $("#editModal").modal("hide");

                    // Show success message

                    location.reload();

                },
                error: function (error) {
                    console.log(error);
                    const response = error.responseText;

                    // Show error message
                    Swal.fire({ icon: 'error', title: 'Error', text: "Failed to Update employee data." });

                    $("#editModal").modal("hide");
                    location.reload();
                }
            });
        }
    });




    // DELETE MODAL

    function openDeleteModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        populateDeleteModal(dataItem);
        $("#deleteModal").modal("show");

        $("#confirmDeleteBtn").off("click").on("click", function () {
            var employeeId = $("#deleteEmployeeId").val();

            $.ajax({
                url: "/Employee/DeleteEmployee",
                method: "Delete",
                data: { employeeId: employeeId },
                success: function (response) {

                    var grid = $("#grid").data("kendoGrid");

                    var dataItemToRemove = grid.dataSource.data().find(function (item) {
                        return item.EmployeeId == employeeId;
                    });

                    if (dataItemToRemove) {
                        grid.dataSource.remove(dataItemToRemove);

                        grid.refresh();
                        $("#deleteModal").modal("hide");
                    } else {
                        console.log("No row found with the specified AllocationId.");
                    }
                    Swal.fire({ icon: 'success', title: "Employee Deleted Successfully.", showConfirmButton: false, timer: 2000 });

                },
                error: function (error) {
                    console.log(error);
                    const response = error.responseText;
                    Swal.fire({ icon: 'error', title: 'Error', text: response });

                    $("#deleteModal").modal("hide");

                }
            });
        });

    }
    function populateDeleteModal(dataItem) {
        $("#deleteEmployeeId").val(dataItem.EmployeeId);
        $("#deleteEmployeeNo").val(dataItem.EmployeeNo);
        $("#deleteFirstname").val(dataItem.FirstName);
        $("#deleteMiddlename").val(dataItem.MiddleName);
        $("#deleteLastname").val(dataItem.LastName);
        $("#deleteDepartmentName").val(dataItem.DepartmentName);
        $("#deleteDesignation").val(dataItem.Designation);
        $("#deleteEmail").val(dataItem.Email);
        $("#deletePhonenumber").val(dataItem.PhoneNumber);
        $("#deleteCountryName").val(dataItem.CountryName);
        $("#deleteStateName").val(dataItem.StateName);
        $("#deleteCityName").val(dataItem.CityName);
        $("#deleteAddress").val(dataItem.Address);
        $("#deleteLoginenabled").val(dataItem.LoginEnabled ? "true" : "false");
    }
});