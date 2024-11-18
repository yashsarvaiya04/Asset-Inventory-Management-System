$(function () {


    const shortingColumnName = "ManufactureName";
    const toolbarTemplate = '<button class="k-button k-primary" id="openAddManufactureModalBtn"">Add Manufacture</button>';
    const exportName = "Manufacture";
    const columns = [
        { field: "ManufactureName", title: "Manufacture Name", width: "150px" },
        { field: "Url", title: "Url", width: "150px" },
        { field: "Address", title: "Address", width: "200px" },
        { field: "SupportEmail", title: "Manufacture Email", width: "200px" },
        { field: "SupportPhoneNumber", title: "Manufacture Number", width: "200px" },
        //{ field: "CountryName", title: "Country", width: "150px" },
        //{ field: "StateName", title: "State", width: "150px" },
       // { field: "CityName", title: "City", width: "150px" },
        {
            command: [
                { name: "edit", text: "", iconClass: "k-icon k-i-edit", click: openEditModal },
                { name: "delete", text: "", iconClass: "k-icon k-i-delete", click: openDeleteModal }
            ],
            title: "Action",
            width: "100px"
        }


    ];
    initializeGrid(manufacturesData, shortingColumnName, exportName, toolbarTemplate, columns);
    
    // ADD MODAL
    $(document).on("click", "#openAddManufactureModalBtn", function () {

        $("#addManufactureModal").modal("show");
    });


    $("#addManufactureForm").validate({
        rules: {
            addManufactureName: {
                required: true
            },
            addUrl: {
                required: true,
                url:true
            },
            addAddress: {
                required: true
            },

            addSupportPhonenumber: {
                required: true,
                phoneIN: true
            },
            addSupportEmail: {
                required: true,
                email: true
            },

            addCountryId: {
                required: true
            },
            addStateId: {
                required: true
            },
            addCityId: {
                required: true
            }

        },
        // Customize error messages
        messages: {
            addManufactureName: {
                required: "Please enter Manufacture name"
            },
            addUrl: {
                required: "Please enter Url"
            },
            addAddress: {
                required: "Please enter address"
            },
            addSupportPhonenumber: {
                required: "Please enter phone number"
            },
            addSupportEmail: {
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








    $(document).on("click", "#saveManufactureBtn", function () {

        //alert($("#ManufactureName").val());
        console.log("url : ", $("#addUrl").val());
        //alert("url : ", $("#addUrl").val());
        if ($("#addManufactureForm").valid()) {
            var manufactureData = new FormData();

            //manufactureData.append('manufactureid', $("addManufactureId").val());
            manufactureData.append('ManufactureName', $("#addManufactureName").val());
            manufactureData.append('Url', $("#addUrl").val());
            manufactureData.append('Address', $("#addAddress").val());
            manufactureData.append('SupportEmail', $("#addSupportEmail").val());
            manufactureData.append('SupportPhoneNumber', $("#addSupportPhoneNumber").val());
            manufactureData.append('Countryid', $("#addCountryId").val());
            manufactureData.append('Stateid', $("#addStateId").val());
            manufactureData.append('Cityid', $("#addCityId").val());
            //manufactureData.append('CountryName', $("#addCountryname").val());
            //manufactureData.append('StateName', $("#addStatename").val());
            //manufactureData.append('CityName', $("#addCityname").val());

            manufactureData.append('Createdby', null);
            console.log("manufacturer : ", manufactureData);

            //alert(manufactureData.ManufactureName);

            $.ajax({
                url: "/Other/AddManufacture",
                method: "POST",
                processData: false,
                contentType: false,

                data: manufactureData,
                success: function (response) {
                    Swal.fire({ icon: 'success', title: "Manufacture Added Successfully.", showConfirmButton: false, timer: 100000 });
                    $("#addManufactureModal").modal("hide");

                    // Show success message

                    location.reload();

                },
                error: function (error) {
                    console.log(error);
                    const response = error.responseText;

                    // Show error message
                    Swal.fire({ icon: 'error', title: 'Error', text: "Failed to add Manufacture data. Please try again later." });

                    $("#addManufactureModal").modal("hide");
                    location.reload();
                }
            });
        }

    });


    populateCountriesDropdown();

    function populateCountriesDropdown() {
        $.ajax({
            url: '/Search/GetCountries',
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
            url: '/Search/GetStatesByCountryId',
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
            url: '/Search/GetCitiesByStateId',
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
        $('#editModal').modal('show');
    }

    function populateEditModal(dataItem) {
        // Log the dataItem to verify its structure and properties
        console.log(dataItem);
        //// Populate dropdowns for states and cities
        populateEditCountriesDropdown1(dataItem.CountryId);
        populateEditStatesField(dataItem.CountryId, dataItem.StateId);
        populateEditCitiesField(dataItem.CountryId, dataItem.StateId, dataItem.CityId);

        // Populate input fields with data from dataItem
        $("#editManufactureId").val(dataItem.ManufactureId);
        $("#editManufacturename").val(dataItem.ManufactureName);
        $("#editUrl").val(dataItem.Url);
        $("#editSupportEmail").val(dataItem.SupportEmail);


        $("#editAddress").val(dataItem.Address);
        $("#editSupportPhoneNumber").val(dataItem.SupportPhoneNumber);

        $("#editCountryId").val(dataItem.CountryId);
        $("#editStateId").val(dataItem.StateId);
        $("#editCityId").val(dataItem.CityId);

        // Set the values of country, state, and city names
        $("#editCountryName").val(dataItem.CountryName);
        $("#editCountryCode").val(dataItem.CountryCode);
        $("#editStateName").val(dataItem.StateName);
        $("#editCityName").val(dataItem.CityName);




    }


    $("#editForm").validate({
        rules: {
            editManufacturename: {
                required: true
            },
            editUrl: {
                required: true,
                url: true
            },
            editAddress: {
                required: true
            },
            editSupportPhoneNumber: { // Corrected rule name
                required: true,
                phoneIN: true
            },
            editSupportEmail: {
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


        },
        messages: {
            editManufacturename: {
                required: "Please enter Manufacture name"
            },
            editUrl: {
                required: "Please enter Url"
            },
            editAddress: {
                required: "Please enter address"
            },

            editSupportPhoneNumber: { // Corrected message name
                required: "Please enter phone number"
            },
            editSupportEmail: {
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


        },
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        }
    });

    $.validator.addMethod("phoneIN", function (phoneNumber, element) {
        phoneNumber = phoneNumber.replace(/\s+/g, ""); // Remove spaces
        return this.optional(element) || /^[0-9]{10}$/.test(phoneNumber);
    }, "Please enter a valid phone number.");








    populateEditCountriesDropdown();
    // Function to populate countries dropdown in edit modal
    function populateEditCountriesDropdown1(countryId) {
        console.log(countryId);
        $.ajax({
            url: '/Search/GetCountries',
            type: 'GET',
            success: function (response) {
                $("#editCountryId").empty();
                $("#editCountryId").append('<option value="">Select Country</option>');
                response.forEach(function (country) {
                    $("#editCountryId").append('<option value="' + country.countryId + '">' + country.countryName + '</option>');
                    console.log("hooo");
                    //populateEditStatesDropdown(country.countryId);


                });
                $("#editCountryId").val(countryId);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching countries:', error);
            }
        });
    }

    // Function to populate states dropdown based on selected country in edit modal
    function populateEditStatesField(countryId, stateId) {
        $.ajax({

            url: '/Search/GetStatesByCountryId',
            type: 'GET',
            data: { CountryId: countryId },

            success: function (response) {

                $("#editStateId").empty();
                $("#editStateId").append('<option value="">Select State</option>');

                response.forEach(function (state) {

                    $("#editStateId").append('<option value="' + state.stateId + '">' + state.stateName + '</option>');


                });
                $("#editStateId").val(stateId);

                // After states dropdown is populated, trigger population of cities dropdown
                // Assuming you want to select the first state by default
            },
            error: function (xhr, status, error) {
                console.error('Error fetching states:', error);
            }
        });
    }


    // Function to populate cities dropdown based on selected state in edit modal
    function populateEditCitiesField(countryId, stateId, cityId) {

        //console.log("city");
        $.ajax({
            url: '/Search/GetCitiesByStateId',
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
                console.error('Error fetching cities:', error);
            }
        });
    }


    function populateEditCountriesDropdown() {
        $.ajax({
            url: '/Search/GetCountries',
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
        console.log("state");
        $.ajax({
            url: '/Search/GetStatesByCountryId',
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
            url: '/Search/GetCitiesByStateId',
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




    // Event listener for change in country selection in edit modal
    $(document).on("change", "#editCountryId", function () {
        var selectedCountryId = $(this).val();
        if (selectedCountryId) {
            populateEditStatesDropdown(selectedCountryId);
        } else {
            $("#editStateId").empty().append('<option value="">Select Country First</option>');
            //$("#editCityId").empty().append('<option value="">Select State First</option>');
        }
    });

    // Event listener for change in state selection in edit modal
    $(document).on("change", "#editStateId", function () {

        var selectedStateId = $(this).val();
        if (selectedStateId) {
            populateEditCitiesDropdown(selectedStateId);
        } else {
            $("#editCityId").empty().append('<option value="">Select State First</option>');
        }
    });



    var initialSelectedCountryId = $("#editCountryId").val();
    if (initialSelectedCountryId) {
        populateEditStatesDropdown(initialSelectedCountryId);
    }

    var initialSelectedStateId = $("#editStateId").val();
    if (initialSelectedStateId) {
        populateEditCitiesDropdown(initialSelectedStateId);
    }

    $(document).on("click", "#saveChangesBtn", function () {

        console.log("123");
        if ($("#editForm").valid()) {
            var editedManufacturesData = {

                ManufactureId: $("#editManufactureId").val(),
                ManufactureName: $("#editManufacturename").val(),
                Url: $("#editUrl").val(),
                Address: $("#editAddress").val(),
                SupportEmail: $("#editSupportEmail").val(),
                SupportPhoneNumber: $("#editSupportPhoneNumber").val(),
                cityId: $("#editCityId").val(),

            };
            console.log(editedManufacturesData)
            $.ajax({
                url: "/Other/UpdateManufacture",
                type: 'PUT',
                data: editedManufacturesData,
                success: function (response) {
                    Swal.fire({ icon: 'success', title: "Manufacture Updated Successfully.", showConfirmButton: false, timer: 3000 });
                    $("#editModal").modal("hide");

                    // Show success message

                    location.reload();

                },
                error: function (error) {
                    console.log(error);
                    const response = error.responseText;

                    // Show error message
                    Swal.fire({ icon: 'error', title: 'Error', text: "Failed to Update Manufacture data." });

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
            var manufactureId = $("#deleteManufactureId").val();

            $.ajax({
                url: "/Other/DeleteManufacture",
                method: "POST",
                data: { manufactureId: manufactureId },
                success: function (response) {
                    var grid = $("#grid").data("kendoGrid");
                    var dataItemToRemove = grid.dataSource.data().find(function (item) {
                        return item.ManufactureId == manufactureId;
                    });

                    if (dataItemToRemove) {
                        grid.dataSource.remove(dataItemToRemove);
                        grid.refresh();
                        $("#deleteModal").modal("hide");
                    } else {
                        console.log("No row found with the specified ManufactureId.");
                    }
                    Swal.fire({ icon: 'success', title: "Manufacture Deleted Successfully.", showConfirmButton: false, timer: 2000 });
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
        $("#deleteManufactureId").val(dataItem.ManufactureId);
        $("#deleteManufactureName").val(dataItem.ManufactureName);
        $("#deleteUrl").val(dataItem.Url);
        $("#deleteSupportEmail").val(dataItem.SupportEmail);
        $("#deleteAddress").val(dataItem.Address);
        $("#deleteSupportPhoneNumber").val(dataItem.SupportPhoneNumber);
        $("#deleteCountryId").val(dataItem.CountryId);
        $("#deleteStateId").val(dataItem.StateId);
        $("#deleteCityId").val(dataItem.CityId);
        $("#deleteCountryName").val(dataItem.CountryName);
        $("#deleteCountryCode").val(dataItem.CountryCode);
        $("#deleteStateName").val(dataItem.StateName);
        $("#deleteCityName").val(dataItem.CityName);
        $("#deleteLoginenabled").val(dataItem.LoginEnabled ? "true" : "false");
    }

    // Clean up event handlers when the modal is hidden
    $('#deleteModal').on('hidden.bs.modal', function () {
        $("#confirmDeleteBtn").off("click");
    });

});