$(function () {
    function departmentsDropdown(departmentsList) {
        departmentsList.forEach(function (department) {
            $("#departmentId").append('<option value="' + department.departmentId + '">' + department.departmentName + '</option>');
        });
    }

    function employeesDropdown(employeesList) {
        let firstOption = $("#employeeId option:first");
        $("#employeeId").empty().append(firstOption).val(firstOption.val());
        employeesList.forEach(function (employee) {
            $("#employeeId").append('<option value="' + employee.employeeId + '" data-departmentid=' + employee.departmentId + '>' + employee.firstName + " " + employee.lastName + " (" + employee.employeeNo + ")" + '</option>');
        });
    }

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
            $("#assetId").append('<option value="' + asset.assetId + '" data-categoryid=' + asset.categoryId + ' data-subcategoryid=' + asset.subCategoryId + '>' + asset.assetName + " (" + asset.assetSerialNo + ")" + '</option>');
        });
    }

    $(document).on('click', '#addAssetAllocationBtn', function () {
        fetchData('/Search/GetEmployees', employeesDropdown);
        fetchData('/Search/GetSubCategories', subCategoriesDropdown);
        fetchData('/Search/GetAvailableAssets', assetsDropdown);

        // Clear input fields
        $("#departmentId, #employeeId, #categoryId, #subCategoryId, #assetId, #assignedDate").val(null).trigger("change");

        // Enable input fields
        $("#departmentId, #employeeId, #categoryId, #subCategoryId, #assetId, #assignedDate").prop("disabled", false);
        // Hide elements
        $(".freeDate").prop("hidden", true);

        // Update Button Hide And Submit Button Show
        $("#assetAllocationModalUpdate").prop("hidden", true);
        $("#assetAllocationModalSubmit").prop("hidden", false);

        $("#departmentId-error,#employeeId-error,#categoryId-error,#subCategoryId-error,#assetId-error,#assignedDate-error").remove();
        // Show modal
        $('#assetAllocationModal').modal('show');
    });

    $(document).on("click", "#assetAllocationModalSubmit", function () {
        if ($("#assetAllocationModalForm").valid()) {
            $("#assetAllocationModalSubmit").prop('disabled', true);
            $('#overlay').css('display', 'block');
            $('.loader').css('display', 'block');

            const employeeId = $('#employeeId').val();
            const assetId = $('#assetId').val();
            const assignedDate = $('#assignedDate').val();

            $.ajax({
                url: '/Asset/AddAssetAllocation',
                type: 'POST',
                data: { employeeId, assetId, assignedDate },
                success: function (data, status) {
                    $("#assetAllocationModalSubmit").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    if (status == "success") {
                        if (typeof data !== 'string') {

                            Swal.fire({ icon: 'success', title: "Allocation Added Successfully.", showConfirmButton: false, timer: 2000 }).then(function () {
                                const grid = $("#grid").data("kendoGrid");
                                grid.dataSource.add(data);
                                grid.refresh();
                            
                                $('#assetAllocationModal').modal('hide');
                            });

                        } else {
                            const response = JSON.parse(data);
                            Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                $('#assetAllocationModal').modal('hide');
                            });
                        }

                    }
                },
                error: function (error) {
                    $("#assetAllocationModalSubmit").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    const response = JSON.parse(error.responseText);
                    Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                        $('#assetAllocationModal').modal('hide');
                    });
                }
            });
        }
    });

    $(document).on('click', '.edit-button', function () {
        fetchData('/Search/GetEmployees', employeesDropdown);
        fetchData('/Search/GetSubCategories', subCategoriesDropdown);
        fetchData('/Search/GetAssets', assetsDropdown);

        // Data fatch 
        const dataItem = $("#grid").data("kendoGrid").dataItem($(this).closest('tr'));

        // Value add in input fields
        $('#allocationId, #departmentId, #employeeId, #categoryId, #subCategoryId, #assetId, #assignedDate').val(function () {
            return dataItem[$(this).attr('id')];
        }).trigger("change");
        $('#freeDate').val("");
        $("#departmentId-error,#employeeId-error,#categoryId-error,#subCategoryId-error,#assetId-error,#assignedDate-error").remove();

        // Disable input fields
        $("#departmentId, #employeeId").prop("disabled", true);

        // Enable input fields
        $("#categoryId, #subCategoryId, #assetId, #assignedDate, #freeDate").prop("disabled", false);

        // Show elements
        $(".freeDate").prop("hidden", false);

        // Submit Button Hide And Update Button Show
        $("#assetAllocationModalUpdate").prop("hidden", false);
        $("#assetAllocationModalSubmit").prop("hidden", true);
        $("#assetAllocationModalUpdate").prop('disabled', true);

        $(".form-control").on("input", function () {
            var inputId = $(this).attr('id');
            var inputValue = $(this).val();
            var dataItemValue = dataItem[inputId];
      
            if (inputValue == dataItemValue) {
                $("#assetAllocationModalUpdate").prop('disabled', true);
            } else {
                $("#assetAllocationModalUpdate").prop('disabled', false);
            }
        });

        // Show Modal
        $('#assetAllocationModal').modal('show');
    });

    $(document).on("click", "#assetAllocationModalUpdate", function () {
        if ($("#assetAllocationModalForm").valid()) {
            $("#assetAllocationModalUpdate").prop('disabled', true);
            $('#overlay').css('display', 'block');
            $('.loader').css('display', 'block');

            const allocationId = $('#allocationId').val();
            const assetId = $('#assetId').val();
            const assignedDate = $('#assignedDate').val();
            const freeDate = $('#freeDate').val();

            if (allocationId.trim() == "" || assetId.trim() == "" || assignedDate.trim() == "") {
                Swal.fire({ title: 'Enter All Values', text: 'Please fill in all fields.', icon: 'info', showConfirmButton: false, timer: 5000 });
                return;
            }


            if (freeDate != "") {
                if (new Date(freeDate) < new Date(assignedDate)) {
                    Swal.fire({ title: 'date', text: 'Enter Proper Assigned and Free Date.', icon: 'info', showConfirmButton: false, timer: 5000 });
                    return;
                }
            }

            $.ajax({
                url: '/Asset/UpdateAssetAllocation',
                type: 'PUT',
                data: { allocationId, assetId, assetId, assignedDate, freeDate },
                success: function (data, status) {
                    $("#assetAllocationModalUpdate").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    if (status == "success") {
                        if (typeof data !== 'string') {
                            const grid = $("#grid").data("kendoGrid");
                            const dataItemToRemove = grid.dataSource.data().find(function (item) {
                                return item.allocationId == allocationId;
                            });
                            if (dataItemToRemove) {
                                grid.dataSource.remove(dataItemToRemove);
                                grid.dataSource.add(data);
                                grid.refresh();
                                Swal.fire({ icon: 'success', title: "Allocation Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#assetAllocationModal').modal('hide'); });
                            } else {
                                Swal.fire({ icon: 'success', title: "Allocation Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { location.reload(); });
                            }
                        }
                        else {
                            const response = JSON.parse(data);
                            Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                $('#assetAllocationModal').modal('hide');
                            });
                        }
                    }
                },
                error: function (error) {
                    $("#assetAllocationModalUpdate").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    const response = JSON.parse(error.responseText);
                    Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                        $('#assetAllocationModal').modal('hide');
                    });
                }
            });

        }
    });

    $(document).on('click', '.view-button', function () {
        fetchData('/Search/GetEmployees', employeesDropdown);
        fetchData('/Search/GetSubCategories', subCategoriesDropdown);
        fetchData('/Search/GetAssets', assetsDropdown);

        const dataItem = $("#grid").data("kendoGrid").dataItem($(this).closest('tr'));

        $('#allocationId, #departmentId, #employeeId, #categoryId, #subCategoryId, #assetId, #assignedDate, #freeDate').val(function () {
            return dataItem[$(this).attr('id')];
        }).trigger("change");

        $(".freeDate").prop("hidden", false);
        $("#departmentId-error,#employeeId-error,#categoryId-error,#subCategoryId-error,#assetId-error,#assignedDate-error").remove();
        $("#departmentId, #employeeId, #categoryId, #subCategoryId, #assetId, #assignedDate, #freeDate").prop("disabled", true);
        $("#assetAllocationModalUpdate, #assetAllocationModalSubmit").prop("hidden", true);

        $('#assetAllocationModal').modal('show');
    });

    $(document).on('click', '.delete-button', function () {

    
        const allocationId = $("#grid").data("kendoGrid").dataItem($(this).closest('tr')).allocationId;
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this Allocation!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $('#overlay').css('display', 'block');
                $('.loader').css('display', 'block');
                $.ajax({
                    url: '/Asset/DeleteAssetAllocation?allocationId=' + allocationId,
                    type: 'DELETE',
                    success: function (data, status) {
                        $('#overlay').css('display', 'none');
                        $('.loader').css('display', 'none');
                        if (status === "success") {
                            const response = JSON.parse(data);
                            if (response.status) {
                                var grid = $("#grid").data("kendoGrid");
                                var dataItemToRemove = grid.dataSource.data().find(item => item.allocationId === allocationId);
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
                                    $('#assetAllocationModal').modal('hide');
                                });
                            }

                        }
                    },
                    error: function (error) {
                        $('#overlay').css('display', 'block');
                        $('.loader').css('display', 'block');
                        const response = JSON.parse(error.responseText);
                        Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                            $('#assetAllocationModal').modal('hide');
                        });
                    }
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({ title: 'Cancelled', text: 'Allocation deletion has been cancelled', icon: 'info', showConfirmButton: false, timer: 2000 });
            }
        });
    });

    $('#assetAllocationModal').one('show.bs.modal', function () {
        // Event listeners for dynamic changes
        $(document).on("change", "#departmentId", function () {
            if ($("#employeeId").val() == null && $("#departmentId").val() != null) {
                fetchData('/Search/GetEmployeesByDepartmentsId?departmentId=' + $("#departmentId").val(), employeesDropdown);
            } else {
                let selectedDepartmentId = $("#employeeId option:selected").data("departmentid");
                if (selectedDepartmentId != $("#departmentId").val()) {
                    fetchData('/Search/GetEmployeesByDepartmentsId?departmentId=' + $("#departmentId").val(), employeesDropdown);
                }
            }
        });

        $(document).on("change", "#employeeId", function () {
            if ($("#departmentId").val() == null && $("#employeeId").val() != null) {
                let departmentId = $(this).find('option:selected').data('departmentid');
                $("#departmentId").val(departmentId).trigger('change');
            }
        });

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


        $("#departmentId, #employeeId, #categoryId, #subCategoryId, #assetId").select2({
            dropdownParent: $("#assetAllocationModal")
        });
        $(document).on("select2:open", () => {
            document.querySelector(".select2-container--open .select2-search__field").focus()
        });


        $("#assetAllocationModalForm").validate({
            rules: {
                departmentId: {
                    required: true
                },
                employeeId: {
                    required: true
                },
                categoryId: {
                    required: true
                },
                subCategoryId: {
                    required: true
                },
                assetId: {
                    required: true
                },
                assignedDate: {
                    required: true
                }
            },

            messages: {
                departmentId: {
                    required: "Please select department"
                },
                employeeId: {
                    required: "Please select employee"
                },
                categoryId: {
                    required: "Please select category"
                },
                subCategoryId: {
                    required: "Please select sub category"
                },
                assetId: {
                    required: "Please select asset"
                },
                assignedDate: {
                    required: "Please enter assigned date"
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

        $("#assetAllocationModalForm input, #assetAllocationModalForm select").on("input change", function () {
            $(this).next(".error").remove();
        });
    });


    const shortingColumnName = "employeeName";
    const toolbarTemplate = '<button class="k-button k-primary" id="addAssetAllocationBtn">Allocate</button>';
    const exportName = "Asset Allocation";
    const columns = [
        { field: "departmentName", title: "Department", hidden: true },
        { field: "employeeNo", title: "Employee Id", hidden: true },
        { field: "employeeName", title: "Name", },
        { field: "employeeEmail", title: "Email" },
        { field: "phoneNumber", title: "Phone Number" },
        { field: "assetSerialNo", title: "Asset Serial No" },
        { field: "assetName", title: "Asset name" },
        { field: "assignedDate", title: "Assigned Date", template: "#= kendo.toString(kendo.parseDate(assignedDate), 'dd-MM-yyyy') #" },
        { field: "freeDate", title: "Free Date", template: "#= kendo.toString(kendo.parseDate(freeDate), 'dd-MM-yyyy') #", hidden: true },
        {
            command: [
                { template: '<button class="edit-button k-grid-edit k-button k-button-md k-button-rectangle k-rounded-md k-button-solid k-button-solid-base k-icon-button" aria-label="Edit"><span class="k-icon k-i-edit"></span></button>', visible: function (dataItem) { return dataItem.freeDate == "0001-01-01"; } },
                { template: '<button class="view-button k-grid-view k-button k-button-md k-button-rectangle k-rounded-md k-button-solid k-button-solid-base k-icon-button" aria-label="View"><span class="k-icon k-i-eye"></span></button>', visible: function (dataItem) { return dataItem.freeDate !== "0001-01-01"; }, },
                { template: '<button class="delete-button k-grid-delete k-button k-button-md k-button-rectangle k-rounded-md k-button-solid k-button-solid-base k-icon-button" aria-label="View"><span class="k-icon k-i-delete"></span></button>', visible: function (dataItem) { return dataItem.freeDate == "0001-01-01"; } }
            ], title: "Action", width: "90px"
        }
    ];
    initializeGrid(assetAllocationData, shortingColumnName, exportName, toolbarTemplate, columns);

    fetchData('/Search/GetDepartments', departmentsDropdown);
    fetchData('/Search/GetCategories', categoriesDropdown);







    function openCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            })
                .then(function (stream) {
                    var video = document.getElementById('cameraFeed');
                    video.srcObject = stream;
                    video.play();

                    Quagga.init({
                        inputStream: {
                            name: "Live",
                            type: "LiveStream",
                            target: video,
                            constraints: {
                                width: 480,
                                height: 320,
                                facingMode: "environment" // Use the rear camera
                            }
                        },

                        decoder: {
                            readers: ["code_128_reader"]
                        }
                    }, function (err) {
                        if (err) {
                            console.error('Error initializing Quagga:', err);
                            return;
                        }
                        console.log('Initialization finished. Ready to start');
                        Quagga.start();
                    });

                    Quagga.onDetected(function (data) {
                        console.log("hi");
                        console.log(data);
                        var resultElement = document.getElementById('result');
                        resultElement.innerHTML = 'Barcode detected: ' + data.codeResult.code;

                    });
                })
                .catch(function (error) {
                    console.error('Error accessing the camera:', error);
                });
        } else {
            console.error('Browser does not support accessing the camera.');
        }
    }

    $('#scanBarcodeBtn').on('click', function () {
        openCamera();
    });



});