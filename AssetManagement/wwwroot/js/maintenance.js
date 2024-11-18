$(function () {

    const shortingColumnName = "AssetName";
    const toolbarTemplate = '<button class="k-button k-primary" id="openAddMaintenanceModalBtn"">Add Maintenance</button>';
    const exportName = "Maintenance";
    const columns = [
        { field: "AssetName", title: "AssetName", width: "150px" },
        { field: "Description", title: "Description", width: "150px" },
        { field: "ScheduleDate", title: "ScheduleDate", width: "200px", template: "#= kendo.toString(kendo.parseDate(ScheduleDate), 'dd-MM-yyyy') #" },
        { field: "CompletionDate", title: "CompletionDate", width: "150px", template: "#= kendo.toString(kendo.parseDate(CompletionDate), 'dd-MM-yyyy') #" },
        {
            command: [
                { template: '<button class="edit-button k-grid-edit k-button k-button-md k-button-rectangle k-rounded-md k-button-solid k-button-solid-base k-icon-button" aria-label="Edit"><span class="k-icon k-i-edit"></span></button>' },
                { template: '<button class="delete-button k-grid-delete k-button k-button-md k-button-rectangle k-rounded-md k-button-solid k-button-solid-base k-icon-button" aria-label="View"><span class="k-icon k-i-delete"></span></button>' }
            ], title: "Action", width: "90px"
        }
    ];
    initializeGrid(maintenanaceData, shortingColumnName, exportName, toolbarTemplate, columns);



    // ADD MODAL
    function categoriesDropdown(categoriessList) {
        categoriessList.forEach(function (category) {
            $("#categoryId").append('<option value="' + category.categoryId + '">' + category.categoryName + '</option>');
        });
    }

    function subCategoriesDropdown(subCategoriesList) {
        let firstOption = $("#subCategoryId option:first");
        $("#subCategoryId").empty().append(firstOption).val(firstOption.val());
        subCategoriesList.forEach(function (subCategory) {
            $("#subCategoryId").append('<option value="' + subCategory.subCategoryId + '" data-categoryid=' + subCategory.categoryId + '>' + subCategory.subCategoryName + '</option>');
        });
    }

    function assetsDropdown(assetsList) {
        let firstOption = $("#assetId option:first");
        $("#assetId").empty().append(firstOption).val(firstOption.val());
        assetsList.forEach(function (asset) {
            $("#assetId").append('<option value="' + asset.assetId + '" data-categoryid=' + asset.categoryId + ' data-subcategoryid=' + asset.subCategoryId + '>' + asset.assetName + '</option>');
        });
    }

    $(document).on('click', '#openAddMaintenanceModalBtn', function () {

        fetchData('/Search/GetSubCategories', subCategoriesDropdown);
        fetchData('/Search/GetAvailableAssets', assetsDropdown);

        // Clear input fields
        $("#categoryId, #subCategoryId, #assetId, #Description,#ScheduleDate").val(null).trigger("change");

        // Enable input fields
        $("#categoryId, #subCategoryId, #assetId, #Description,#ScheduleDate").prop("disabled", false);
        // Hide elements
        $(".CompletionDate").prop("hidden", true);

        // Update Button Hide And Submit Button Show
        $("#MaintenanceModalUpdate").prop("hidden", true);
        $("#MaintenanceModalSubmit").prop("hidden", false);

        // Show modal
        $('#MaintenanceModal').modal('show');
    });



    $(document).on("click", "#MaintenanceModalSubmit", function () {
        console.log("hi")
        if ($("#MaintenanceForm").valid()) {
            const assetId = $('#assetId').val();
            const description = $('#Description').val();
            const scheduleDate = $('#ScheduleDate').val();
            const completionDate = $('#CompletionDate').val();
            $.ajax({
                url: '/Asset/AddMaintenance',
                type: 'POST',
                data: { assetId, description, scheduleDate, completionDate },
                success: function (data, status) {
                    if (status == "success") {
                        if (typeof data !== 'string') {

                            Swal.fire({ icon: 'success', title: "Maintenance Added Successfully.", showConfirmButton: false, timer: 2000 }).then(function () {
                                location.reload();
                            });

                        } else {
                            const response = JSON.parse(data);
                            Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                $('#MaintenanceModal').modal('hide');
                            });
                        }

                    }
                },
                error: function (error) {
                    const response = JSON.parse(error.responseText);
                    Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                        $('#MaintenanceModal').modal('hide');
                    });
                }
            });
        }
    });

    $(document).on('click', '.edit-button', function () {

        fetchData('/Search/GetSubCategories', subCategoriesDropdown);
        fetchData('/Search/GetAssets', assetsDropdown);

        // Data fatch 
        const dataItem = $("#grid").data("kendoGrid").dataItem($(this).closest('tr'));

        $("#maintenanceId").val(dataItem.MaintenanceId);
        $("#categoryId").val(dataItem.CategoryId).trigger('change');
        console.log(dataItem.CategoryId);
        $("#subCategoryId").val(dataItem.SubCategoryId).trigger('change');
        $("#assetId").val(dataItem.AssetId).trigger('change');
        $("#Description").val(dataItem.Description);
        $("#ScheduleDate").val(dataItem.ScheduleDate);
        $("#CompletionDate").val(dataItem.CompletionDate);

        // Enable input fields
        $("#categoryId, #subCategoryId, #assetId, #ScheduleDate, #CompletionDate").prop("disabled", false);

        // Show elements
        /$(".CompletionDate").prop("hidden", false);/

        // Submit Button Hide And Update Button Show
        $("#MaintenanceModalUpdate").prop("hidden", false);
        $("#MaintenanceModalSubmit").prop("hidden", true);

        // Show Modal
        $('#MaintenanceModal').modal('show');
    });


    $(document).on("click", "#MaintenanceModalUpdate", function () {
        if ($("#MaintenanceForm").valid()) {
            const maintenanceId = $('#maintenanceId').val();
            const assetId = $('#assetId').val();
            const description = $('#Description').val();
            const scheduleDate = $('#ScheduleDate').val();
            const completionDate = $('#CompletionDate').val();

            if (maintenanceId == null || assetId == null || ScheduleDate == null) {
                Swal.fire({ title: 'Enter All Values', text: 'Please fill in all fields.', icon: 'info', showConfirmButton: false, timer: 5000 });
                return;
            }


            if (CompletionDate != "") {
                if (new Date(CompletionDate) < new Date(ScheduleDate)) {
                    Swal.fire({ title: 'date', text: 'Enter Proper Schedule and Completion Date.', icon: 'info', showConfirmButton: false, timer: 5000 });
                    return;
                }
            }



            $.ajax({
                url: '/Asset/UpdateMaintenance',
                type: 'POST',
                data: { maintenanceId, assetId, description, scheduleDate, completionDate },
                success: function (data, status) {

                    if (status == "success") {
                        if (typeof data !== 'string') {
                            const grid = $("#grid").data("kendoGrid");
                            const dataItemToRemove = grid.dataSource.data().find(function (item) {
                                return item.maintenanceId == maintenanceId;
                            });
                            if (dataItemToRemove) {
                                grid.dataSource.remove(dataItemToRemove);
                                grid.dataSource.add(data);
                                grid.refresh();
                                Swal.fire({ icon: 'success', title: "Maintenance Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#MaintenanceModal').modal('hide'); });
                            } else {
                                Swal.fire({ icon: 'success', title: "Maintenance Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { location.reload(); });
                            }
                        }
                        else {
                            const response = JSON.parse(data);
                            Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                $('#MaintenanceModal').modal('hide');
                            });
                        }
                    }
                },
                error: function (error) {
                    console.log(error.responseText);
                    const response = JSON.parse(error.responseText);
                    Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                        $('#MaintenanceModal').modal('hide');
                    });
                }
            });
        }

    });

    $(document).on('click', '.view-button', function () {


        const dataItem = $("#grid").data("kendoGrid").dataItem($(this).closest('tr'));

        $('#maintenanceId,#categoryId, #subCategoryId, #assetId, #ScheduleDate, #CompletionDate').val(function () {
            return dataItem[$(this).attr('id')];
        }).trigger("change");

        /*  $(".CompletionDate").prop("hidden", false);*/
        $("#categoryId, #subCategoryId, #assetId, #ScheduleDate, #CompletionDate").prop("disabled", true);
        $("#MaintenanceModalUpdate, #MaintenanceModalSubmit").prop("hidden", true);

        $('#MaintenanceModal').modal('show');
    });

    $(document).on('click', '.delete-button', function () {
        const maintenanceId = $("#grid").data("kendoGrid").dataItem($(this).closest('tr')).MaintenanceId;
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not store this asset into Maintenance!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {

                $.ajax({

                    url: '/Asset/DeleteMaintenances?maintenanceId=' + maintenanceId,
                    type: 'DELETE',
                    success: function (data, status) {
                        if (status === "success") {
                            const response = JSON.parse(data);
                            if (response.status) {
                                var grid = $("#grid").data("kendoGrid");
                                var dataItemToRemove = grid.dataSource.data().find(item => item.maintenanceId === maintenanceId);
                                if (dataItemToRemove) {
                                    grid.dataSource.remove(dataItemToRemove);
                                    grid.refresh();
                                    Swal.fire({ icon: 'success', title: response.message, showConfirmButton: false, timer: 2000 });
                                } else {
                                    Swal.fire({ icon: 'success', title: response.message, showConfirmButton: false, timer: 2000 }).then(function () {
                                        location.reload();
                                    });
                                }
                            } else {
                                Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                    $('#MaintenanceModal').modal('hide');
                                });
                            }

                        }
                    },
                    error: function (error) {
                        const response = JSON.parse(error.responseText);
                        Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                            $('#MaintenanceModal').modal('hide');
                        });
                    }
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({ title: 'Cancelled', text: 'Maintenance deletion has been cancelled', icon: 'info', showConfirmButton: false, timer: 2000 });
            }
        });
    });

    $('#MaintenanceModal').one('show.bs.modal', function () {


        // Event listeners for dynamic changes

        $(document).on("change", "#categoryId", function () {
            if ($("#subCategoryId").val() == null && $("#categoryId").val() != null) {
                fetchData('/Search/GetSubCategoriesByCategoryId?categoryId=' + $("#categoryId").val(), subCategoriesDropdown);
            } else {
                let selectedCategoryId = $("#subCategoryId option:selected").data("categoryid");
                if (selectedCategoryId != $("#categoryId").val()) {
                    fetchData('/Search/GetSubCategoriesByCategoryId?categoryId=' + $("#categoryId").val(), subCategoriesDropdown);
                }
            }
            if ($("#assetId").val() == null && $("#categoryId").val() != null) {
                fetchData('/Search/GetAssetsByCategoryId?categoryId=' + $("#categoryId").val(), assetsDropdown);
            } else {
                let selectedCategoryId = $("#assetId option:selected").data("categoryid");
                if (selectedCategoryId != $("#categoryId").val()) {
                    fetchData('/Search/GetAssetsByCategoryId?categoryId=' + $("#categoryId").val(), assetsDropdown);
                }
            }
        });

        $(document).on("change", "#subCategoryId", function () {
            if ($("#categoryId").val() == null && $("#subCategoryId").val() != null) {
                let categoryId = $(this).find('option:selected').data('categoryid');
                $("#categoryId").val(categoryId).trigger('change');
            }
            if ($("#assetId").val() == null && $("#subCategoryId").val() != null) {
                fetchData('/Search/GetAssetsBySubCategoryId?subCategoryId=' + $("#subCategoryId").val(), assetsDropdown);
            } else {
                let selectedSubCategoryId = $("#assetId option:selected").data("subcategoryid");
                if (selectedSubCategoryId != $("#subCategoryId").val()) {
                    fetchData('/Search/GetAssetsBySubCategoryId?subCategoryId=' + $("#subCategoryId").val(), assetsDropdown);
                }
            }
        });

        $(document).on("change", "#assetId", function () {
            if ($("#subCategoryId").val() == null && $("#assetId").val() != null) {
                let subCategoryId = $(this).find('option:selected').data('subcategoryid');
                $("#subCategoryId").val(subCategoryId).trigger('change');
            }
            if ($("#categoryId").val() == null && $("#assetId").val() != null) {
                let categoryId = $(this).find('option:selected').data('categoryid');
                $("#categoryId").val(categoryId).trigger('change');
            }
        });

        $("#categoryId, #subCategoryId, #assetId").select2({
            dropdownParent: $("#MaintenanceModal")
        });
        $(document).on("select2:open", () => {
            document.querySelector(".select2-container--open .select2-search__field").focus()
        });


        $("#MaintenanceForm").validate({
            rules: {
                categoryId: {
                    required: true
                },
                subCategoryId: {
                    required: true
                },
                assetId: {
                    required: true
                },
                ScheduleDate: {
                    required: true
                },
                CompletionDate: {
                    required: true
                }
            },

            messages: {
                categoryId: {
                    required: "Please select category"
                },
                subCategoryId: {
                    required: "Please select sub category"
                },
                assetId: {
                    required: "Please select asset"
                },
                ScheduleDate: {
                    required: "Please enter schedule date"
                },
                CompletionDate: {
                    required: "Please enter completion date"
                }
            },
            errorPlacement: function (error, element) {

                if (element.hasClass("select2-hidden-accessible")) {
                    error.insertAfter(element.next("span.select2"));
                } else {
                    error.insertAfter(element);
                }
            }
        });
        $("#MaintenanceForm input, #MaintenanceForm select").on("input change", function () {
            $(this).next(".error").remove();
        });

    });



    fetchData('/Search/GetCategories', categoriesDropdown);
});