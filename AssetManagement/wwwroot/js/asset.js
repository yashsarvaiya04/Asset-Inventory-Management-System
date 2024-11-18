$(function () {
    const categoryDataSource = new kendo.data.DataSource({
        data: [
            { text: "Electronic Consumable", value: "Electronic Consumable" },
            { text: "Clothing", value: "Clothing" }
        ]
    });

    const subcategoryDataSource = new kendo.data.DataSource({
        data: [
            { text: "Laptop", value: "Laptop" },
            { text: "Smartphone", value: "Smartphone" },
            { text: "Jeans", value: "Jeans" }
        ]
    });


    const shortingColumnName = "Categoryid";
    const toolbarTemplate = '<button class="k-button k-primary" id="openAddAssetModalBtn">Add Asset</button>';
    const exportName = "Asset";
    const columns = [
        { field: "AssetId", title: "Asset Id", hidden: true },
        { field: "AssetSerialNo", title: "Asset SerialNo", width: "150px" },
        { field: "AssetName", title: "Asset Name", width: "150px" },
        {
            field: "CategoryName",
            title: "Category Name",
            width: "150px",
            filterable: {
                multi: true,
                dataSource: categoryDataSource,
                ui: "dropdown"
            }
        },
        {
            field: "PurchaseDate",
            title: "Purchase Date",
            width: "150px",
            template: function (dataItem) {
                return formatToDDMMYYYY(dataItem.PurchaseDate);
            },
        },
        {
            field: "SubCategoryName",
            title: "Subcategory",
            width: "150px",
            filterable: {
                multi: true,
                dataSource: subcategoryDataSource,
                ui: "dropdown"
            }
        },
        { field: "ManufactureName", title: "Manufacture", width: "150px" },
        { field: "SupplierName", title: "Supplier Name", width: "150px" },
        { field: "Price", title: "Price", width: "150px" },
        { field: "PurchaseDate", title: "PurchaseDate", width: "150px" },
        {
            field: "Warranty",
            title: "Warranty",
            width: "150px",
            template: function (dataItem) {
                return formatDate(dataItem.Warranty);
            },
        },

        { field: "LocationName", title: "Location Name", width: "150px" },
        {
            field: "BarcodeImage",
            title: "Barcode",
            width: "150px",
            template: function (dataItem) {
                if (dataItem.BarcodeImage) {
                    return `<img src="/images/barcodeImages/${dataItem.BarcodeImage}" alt="Barcode" class="showModalImage" style="max-width:150px; max-height:50px;" />`;
                } else {
                    return '<span>-</span>';
                }
            },
        },
        {
            field: "Assetimage",
            title: "Image",
            width: "150px",
            template: function (dataItem) {
                if (dataItem.Assetimage) {
                    return `<img loading="lazy" src="/images/assetImages/${dataItem.Assetimage}" 
                    onerror="this.onerror=null; this.src='/images/locationDummyImage.jpg';" 
                    alt="Asset Image" 
                    class="showModalImage" 
                    style="max-width:50px; max-height:50px; border-radius: 50%;" />`;
                } else {
                    return '<span>-</span>';
                }
            },
        },

        {
            command: [
                {
                    name: "edit",
                    text: "",
                    iconClass: "k-icon k-i-edit",
                    click: openEditModal,
                    title: "&nbsp;",
                    width: "50px",
                    className: "edit-button"
                },
                {
                    name: "destroy",
                    text: "",
                    iconClass: "k-icon k-i-delete",
                    title: "&nbsp;",
                    width: "50px",
                    className: "delete-button"

                }
            ],
            title: "Action",
            width: "100px"
        }
    ];
    initializeGrid(AssetData, shortingColumnName, exportName, toolbarTemplate, columns);

    function formatToDDMMYYYY(date) {
        if (!date) {
            return '';
        }
        const d = new Date(date);
        const day = ('0' + d.getDate()).slice(-2);
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const year = d.getFullYear();
        return `${ day } - ${ month } -${ year }`;
    }
    function formatDate(date) {
        if (!date || date === "0001-01-01") {
            return "---";
        }

        const parsedDate = new Date(date);
        const day = ('0' + parsedDate.getDate()).slice(-2);
        const month = ('0' + (parsedDate.getMonth() + 1)).slice(-2);
        const year = parsedDate.getFullYear();
        return `${ day } -${ month } -${ year }`;
    }
    $(document).on("click", ".delete-button", function (e) {
        e.preventDefault();

        var grid = $("#grid").data("kendoGrid");
        var row = $(e.currentTarget).closest("tr");
        var dataItem = grid.dataItem(row);
        populateDeleteModal(dataItem);
        $('#deleteAssetModal').modal('show');
        $("#confirmDeleteBtn").off("click").on("click", function () {
            var assetId = $("#deleteAssetId").val();
            $.ajax({
                url: "/Asset/DeleteAsset?AssetId=" + assetId,
                method: "DELETE",
                success: function (response) {
                    console.log("Asset deleted successfully");

                    $('#deleteAssetModal').modal('hide');

                    Swal.fire({
                        icon: 'success',
                        title: 'Asset Deleted Successfully',
                        showConfirmButton: false,
                        timer: 2000
                    });
                    window.location.reload();
                },
                error: function (xhr, status, error) {
                    console.error("Error deleting asset:", error);
                    var errorMessage = xhr.responseText || "An unexpected error occurred";

                    Swal.fire({
                        icon: 'error',
                        title: 'Error Deleting Asset',
                        text: errorMessage,
                    });
                    $('#deleteAssetModal').modal('hide');
                }
            });
        });
    });
    function populateDeleteModal(dataItem) {
        $("#deleteAssetId").val(dataItem.AssetId);
        $("#deleteAssetSerialNo").val(dataItem.AssetSerialNo);
        $("#deleteAssetName").val(dataItem.AssetName);
        $("#deleteCategoryId").val(dataItem.CategoryName);
        $("#deleteSubcategoryId").val(dataItem.SubCategoryName);
        $("#deleteManufactureId").val(dataItem.ManufactureName);
        $("#deleteSupplierId").val(dataItem.SupplierName);
        $("#deletePrice").val(dataItem.Price);
        $("#deletePurchaseDate").val(dataItem.PurchaseDate);
    }
    function openEditModal(e) {
        e.preventDefault();

        const dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        if (dataItem) {
            populateEditModal(dataItem);
            $('#editAssetModal').modal('show');
        } else {
            console.error("Data item not found or invalid.");
        }
    }
    function populateEditModal(dataItem) {
        $('#editAssetid').val(dataItem.AssetId);
        $("#editSerialNo").val(dataItem.AssetSerialNo);
        $("#editAssetName").val(dataItem.AssetName);
        $("#editCId").val(dataItem.CategoryId);
        $("#editSubcategoryId").val(dataItem.SubCategoryId);
        $("#editManufactureId").val(dataItem.ManufactureId);
        $("#editSupplierId").val(dataItem.SupplierId);
        $("#editPrice").val(dataItem.Price);
        $("#editPurchaseDate").val(dataItem.PurchaseDate);
        $("#editWarranty").val(dataItem.Warranty);
        $("#editLocationId").val(dataItem.LocationId);


        populateEditCategoriesField(dataItem.CategoryId);
        populateEditSubcategoriesField(dataItem.CategoryId, dataItem.SubCategoryId);
    }

    populateEditCategoriesDropdown();

    function populateEditCategoriesField(categoryId) {
        console.log(categoryId);
        $.ajax({
            url: '/Asset/GetCategories',
            type: 'GET',
            success: function (response) {
                $("#editCId").empty();
                $("#editCId").append('<option value="">Select Category</option>');
                response.forEach(function (category) {
                    $("#editCId").append('<option value="' + category.categoryId + '">' + category.categoryName + '</option>');
                });
                $("#editCId").val(categoryId);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching categories:', error);
            }
        });
    }
    function populateEditSubcategoriesField(categoryId, subCategoryId) {
        $.ajax({
            url: '/Asset/GetSubcategories',
            type: 'GET',
            data: { categoryId: categoryId },
            success: function (response) {
                $("#editSubcategoryId").empty();
                $("#editSubcategoryId").append('<option value="">Select Subcategory</option>');
                response.forEach(function (subcategory) {
                    $("#editSubcategoryId").append('<option value="' + subcategory.subCategoryId + '">' + subcategory.subCategoryName + '</option>');
                });
                $("#editSubcategoryId").val(subCategoryId);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching subcategories:', error);
            }
        });
    }
    function populateEditCategoriesDropdown() {
        $.ajax({
            url: '/Asset/GetCategories',
            type: 'GET',
            success: function (response) {
                $("#editCId").empty();
                $("#editCId").append('<option value="">Select Category</option>');
                response.forEach(function (category) {
                    $("#editCId").append('<option value="' + category.categoryId + '">' + category.categoryName + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching categories:', error);
            }
        });
    }
    function populateEditSubcategoriesDropdown(selectedCategoryId) {
        $.ajax({
            url: '/Asset/GetSubcategories',
            type: 'GET',
            data: { categoryId: selectedCategoryId },
            success: function (response) {
                $("#editSubcategoryId").empty();
                $("#editSubcategoryId").append('<option value="">Select Subcategory</option>');
                response.forEach(function (subcategory) {
                    $("#editSubcategoryId").append('<option value="' + subcategory.subCategoryId + '">' + subcategory.subCategoryName + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching subcategories:', error);
            }
        });
    }
    $(document).on("change", "#editCId", function () {
        var selectedCategoryId = $(this).val();
        if (selectedCategoryId) {
            populateEditSubcategoriesDropdown(selectedCategoryId);
        } else {
            console.log("aaaa");
            $("#editSubcategoryId").empty().append('<option value="">Select Category First</option>');
        }
    });

    var initialSelectedEditCategoryId = $("#editCId").val();
    if (initialSelectedEditCategoryId) {
        populateEditSubcategoriesDropdown(initialSelectedEditCategoryId);
    }

    $(document).on("click", "#openAddAssetModalBtn", function () {
        var form = $("#addAssetForm");
        form[0].reset(); // Reset the form fields
        form.validate().resetForm(); // Clear validation errors

        $("#addAssetModal").modal("show"); // Show the modal
    });

    // Custom validation method for uppercase serial numbers
    $.validator.addMethod("noDashesOrUnderscores", function (value, element) {
        // Return true if the value contains only uppercase letters and digits
        return this.optional(element) || /^[A-Z0-9]+$/.test(value); // Only uppercase letters and digits
    }, "The serial number must contain only uppercase letters and digits. No dashes or underscores allowed.");

    // Set up validation rules and messages for the form
    $("#addAssetForm").validate({
        rules: {
            assetSerialNo: {
                required: true,
                noDashesOrUnderscores: true 
            },
            addAssetname: {
                required: true,
                minlength: 2
            },
            addCategoryId: {
                required: true
            },
            addSubcategoryId: {
                required: true
            },
            addManufactureId: {
                required: true
            },
            addSupplierId: {
                required: true
            },
            addPrice: {
                required: true,
                number: true
            },
            addPurchaseDate: {
                required: true,
                dateISO: true
            },
            addLocationId: {
                required: true
            }
        },
        messages: {
            assetSerialNo: {
                required: "Please enter the asset serial number.",
                noDashesOrUnderscores: "The serial number must contain only uppercase letters and digits. No dashes or underscores allowed."
            },
            addAssetname: {
                required: "Please enter the asset name.",
                minlength: "Asset name must be at least 2 characters long."
            },
            addCategoryId: {
                required: "Please select a category."
            },
            addSubcategoryId: {
                required: "Please select a subcategory."
            },
            addManufactureId: {
                required: "Please select a manufacturer."
            },
            addSupplierId: {
                required: "Please select a supplier."
            },
            addPrice: {
                required: "Please enter the price.",
                number: "Price must be a valid number."
            },
            addPurchaseDate: {
                required: "Please enter a purchase date.",
                dateISO: "Purchase date must be in YYYY-MM-DD format."
            },
            addLocationId: {
                required: "Please select a location."
            }
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        }
    });
    $(document).on("click", "#saveAssetBtn", function (event) {
        event.preventDefault(); 

        console.log("Validating form...");

        if (!$("#addAssetForm").valid()) {
            console.log("Form is invalid");
            return; 
        }

        console.log("Form is valid. Proceeding with submission...");

        var formData = new FormData();
        formData.append("AssetSerialNo", $("#assetSerialNo").val());
        formData.append("CategoryId", $("#addCategoryId").val());
        formData.append("SubCategoryId", $("#addSubcategoryId").val());
        formData.append("ManufactureId", $("#addManufactureId").val());
        formData.append("SupplierId", $("#addSupplierId").val());
        formData.append("AssetName", $("#addAssetname").val());
        formData.append("Price", $("#addPrice").val());
        formData.append("PurchaseDate", $("#addPurchaseDate").val());
        formData.append("Warranty", $("#addWarranty").val());
        formData.append("LocationId", $("#addLocationId").val());

        var assetImage = $("#addAssetImage")[0].files[0];
        if (assetImage) {
            formData.append("AssetImage", assetImage);
        }

        $.ajax({
            url: "/Asset/AddAsset",
            method: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                Swal.fire({
                    icon: "success",
                    title: "Asset added successfully",
                    showConfirmButton: false,
                    timer: 2000,
                });
                $("#addAssetModal").modal("hide");
                location.reload(); // Reload after successful addition
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Failed to add asset. Please try again later.",
                });
                console.error("Failed to add asset:", xhr.responseText);
            },
        });

    });
    $.validator.addMethod("noDashesOrUnderscores", function (value, element) {
        return this.optional(element) || /^[A-Z0-9]+$/.test(value); // Only uppercase letters and digits allowed
    }, "Serial number must contain only uppercase letters and digits. Dashes and underscores are not allowed.");

    $("#editAssetForm").validate({
        rules: {
            editSerialNo: {
                required: true,
                noDashesOrUnderscores: true  // Custom validation for uppercase letters and digits only
            },
            editAssetName: {
                required: true,
                minlength: 2
            },
            editCategoryId: {
                required: true
            },
            editSubcategoryId: {
                required: true
            },
            editManufactureId: {
                required: true
            },
            editSupplierId: {
                required: true
            },
            editPrice: {
                required: true,
                number: true
            },
            editPurchaseDate: {
                required: true,
                dateISO: true
            },
            editLocationId: {
                required: true
            }
        },
        messages: {
            editSerialNo: {
                required: "Serial number is required.",
                noDashesOrUnderscores: "Serial number must contain only uppercase letters and digits. Dashes and underscores are not allowed."
            },
            editAssetName: {
                required: "Asset name is required.",
                minlength: "Asset name must be at least 2 characters long."
            },
            editCategoryId: {
                required: "Please select a category."
            },
            editSubcategoryId: {
                required: "Please select a subcategory."
            },
            editManufactureId: {
                required: "Please select a manufacturer."
            },
            editSupplierId: {
                required: "Please select a supplier."
            },
            editPrice: {
                required: "Please enter the price.",
                number: "Price must be a valid number."
            },
            editPurchaseDate: {
                required: "Please enter the purchase date.",
                dateISO: "Purchase date must be in YYYY-MM-DD format."
            },
            editLocationId: {
                required: "Please select a location."
            }
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element); // Place error message after the element
        }
    });

    // Event handler to validate and submit the form
    $(document).on('click', '#editBtnSave', function (event) {
        event.preventDefault(); // Prevent default form submission

        if (!$("#editAssetForm").valid()) { // Check if the form is valid
            return; // If not, do not proceed
        }

        var formData = new FormData();
        formData.append("AssetId", $("#editAssetid").val()); // Assuming asset ID
        formData.append("AssetSerialNo", $("#editSerialNo").val()); // Serial number
        formData.append("AssetName", $("#editAssetName").val());
        formData.append("CategoryId", $("#editCategoryId").val());
        formData.append("SubCategoryId", $("#editSubcategoryId").val());
        formData.append("ManufactureId", $("#editManufactureId").val());
        formData.append("SupplierId", $("#editSupplierId").val());
        formData.append("Price", $("#editPrice").val());
        formData.append("PurchaseDate", $("#editPurchaseDate").val());
        formData.append("Warranty", $("#editWarranty").val());
        formData.append("LocationId", $("#editLocationId").val());

        var assetImage = $("#editAssetImage")[0].files[0]; // Check for image
        if (assetImage) {
            formData.append("AssetImage", assetImage);
        }

        $.ajax({
            url: "/Asset/UpdateAsset",
            method: "PUT",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Asset Updated Successfully',
                    showConfirmButton: false,
                    timer: 2000
                });
                $('#editAssetModal').modal("hide"); // Hide the modal on success
                location.reload(); // Reload the page to refresh data
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to update asset. Please try again later.',
                });
                console.error("Failed to update asset:", xhr.responseText); // Log error
            },
        });
    });
    $("#openAddAssetModalBtn").on("click", function () {
        $("#addAssetModal").modal("show");
    });
    function populateCategoriesDropdown() {
        $.ajax({
            url: '/Asset/GetCategories',
            type: 'GET',

            success: function (response) {
                $("#addCategoryId").empty();
                $("#addCategoryId").append('<option value="">Select Category</option>');
                response.forEach(function (category) {
                    $("#addCategoryId").append('<option value="' + category.categoryId + '">' + category.categoryName + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching categories:', error);
            }
        });
    }

    function populateSubcategoriesDropdown(categoryId) {
        $.ajax({
            url: '/Asset/GetSubcategories',
            type: 'GET',
            data: { categoryId: categoryId },
            success: function (response) {
                $("#addSubcategoryId").empty();
                $("#addSubcategoryId").append('<option value="">Select Subcategory</option>');
                response.forEach(function (subcategory) {
                    $("#addSubcategoryId").append('<option value="' + subcategory.subCategoryId + '">' + subcategory.subCategoryName + '</option>');
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching subcategories:', error);
            }
        });
    }
    function populateLocationDropdown() {
        $.ajax({
            url: '/Asset/GetAssetLocation',
            type: 'GET',
            success: function (response) {

                $("#addLocationId").empty();
                $("#addLocationId").append('<option value="">Select Location</option>');


                response.forEach(function (location) {
                    $("#addLocationId").append(
                        '<option value="' + location.locationId + '">' + location.address + '</option>'
                    );
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching asset locations:', error);
            }
        });
    }
    populateLocationDropdown();
    function populateEditLocationDropdown() {
        $.ajax({
            url: '/Asset/GetAssetLocation',
            type: 'GET',
            success: function (response) {

                $("#editLocationId").empty();
                $("#editLocationId").append('<option value="">Select Location</option>');


                response.forEach(function (location) {
                    $("#editLocationId").append(
                        '<option value="' + location.locationId + '">' + location.address + '</option>'
                    );
                });
            },
            error: function (xhr, status, error) {
                console.error('Error fetching asset locations:', error);
               }
        });
    }
    populateEditLocationDropdown();

    $("#addCategoryId").on("change", function () {
        var selectedCategoryId = $(this).val();
        if (selectedCategoryId) {
            populateSubcategoriesDropdown(selectedCategoryId);
            $("#addSubcategoryId").prop("disabled", false);
        } else {
            $("#addSubcategoryId").empty().append('<option value="">Select Category First</option>');
            $("#addSubcategoryId").prop("disabled", true);
        }
    });
    populateCategoriesDropdown();

    var initialSelectedCategoryId = $("#addCategoryId").val();
    if (initialSelectedCategoryId) {
        populateSubcategoriesDropdown(initialSelectedCategoryId);
    }

    function populateeditManufacturersDropdown() {
        $.ajax({
            url: '/Asset/GetManufacturers',
            type: 'GET',
            success: function (response) {
                if (response && response.length > 0) {
                    $("#editManufactureId").empty();
                    $("#editManufactureId").append('<option value="">Select Manufacturer</option>'); // Default option
                    response.forEach(function (manufacturer) {
                        $("#editManufactureId").append('<option value="' + manufacturer.manufactureId + '">' + manufacturer.manufactureName + '</option>');
                    });
                } else {
                    console.error('No manufacturers found in the response');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching manufacturers:', error);
            }
        });
    }

    populateeditManufacturersDropdown();
    function populateaddManufacturersDropdown() {
        $.ajax({
            url: '/Asset/GetManufacturers',
            type: 'GET',
            success: function (response) {
                if (response && response.length > 0) {
                    $("#addManufactureId").empty();
                    $("#addManufactureId").append('<option value="">Select Manufacturer</option>');
                    response.forEach(function (manufacturer) {
                        $("#addManufactureId").append('<option value="' + manufacturer.manufactureId + '">' + manufacturer.manufactureName + '</option>');
                    });
                } else {
                    console.error('No manufacturers found in the response');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching manufacturers:', error);
            }
        });
    }
    populateaddManufacturersDropdown();

    function populateSuppliersDropdown() {
        $.ajax({
            url: '/Asset/GetSuplier',
            type: 'GET',
            success: function (response) {
                if (response && response.length > 0) {
                    $("#editSupplierId").empty();
                    $("#editSupplierId").append('<option value="">Select Supplier</option>');
                    response.forEach(function (supplier) {
                        $("#editSupplierId").append('<option value="' + supplier.supplierId + '">' + supplier.supplierName + '</option>');
                    });
                } else {
                    console.error('No suppliers found in the response');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching suppliers:', error);
            }
        });
    }


    populateSuppliersDropdown();
    function populateaddSuppliersDropdown() {
        $.ajax({
            url: '/Asset/GetSuplier',
            type: 'GET',
            success: function (response) {
                if (response && response.length > 0) {
                    $("#addSupplierId").empty();
                    $("#addSupplierId").append('<option value="">Select Supplier</option>');
                    response.forEach(function (supplier) {
                        $("#addSupplierId").append('<option value="' + supplier.supplierId + '">' + supplier.supplierName + '</option>');
                    });
                } else {
                    console.error('No suppliers found in the response');
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching suppliers:', error);
            }
        });
    }


    populateaddSuppliersDropdown();
});