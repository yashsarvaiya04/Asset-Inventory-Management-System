$(function () {
    const shortingColumnName = "departmentName";
    const toolbarTemplate = '<button class="k-button k-primary" id="addAssetLocationBtn">Add Location</button>';
    const exportName = "Asset Location";
    const columns = [
        { field: "departmentName", title: "Department", width: "250px" },
        { field: "address", title: "Address", },
        {
            field: "locationImage",
            title: "Image",
            width: "150px",
            template: function (dataItem) {
                if (dataItem.locationImage) {
                    return '<img loading="lazy" src="/images/assetLocationImages/' + dataItem.locationImage + '" onerror="this.onerror=null;this.src=\'/images/locationDummyImage.jpg\';" alt="Location Image" class="showModalImage" style="max-width:50px;max-height:50px; border-radius: 50%;" />';
                } else {
                    return '<span>-</span>'
                }
            },
        },
        {
            command: [
                {
                    template: '<button class="edit-button k-grid-edit k-button k-button-md k-button-rectangle k-rounded-md k-button-solid k-button-solid-base k-icon-button" aria-label="Edit"><span class="k-icon k-i-edit"></span></button>',
                },
                {
                    template: '<button class="delete-button k-grid-delete k-button k-button-md k-button-rectangle k-rounded-md k-button-solid k-button-solid-base k-icon-button" aria-label="View"><span class="k-icon k-i-delete"></span></button>',
                }
            ], title: "Action", width: "90px"
        }
    ];
    initializeGrid(assetLocationData, shortingColumnName, exportName, toolbarTemplate, columns);



    function departmentsDropdown(departmentsList) {
        departmentsList.forEach(function (department) {
            $("#departmentId").append('<option value="' + department.departmentId + '">' + department.departmentName + '</option>');
        });
    }

    $(document).on('click', '#addAssetLocationBtn', function () {
        $("#departmentId,#address,#image,#locationImage").val(null).trigger("change");

        $('#imagePreviewDiv').prop("hidden", true);
        $("#departmentId-error,#address-error").remove();
        $("#assetLocationModalUpdate").prop("hidden", true);
        $("#assetLocationModalSubmit").prop("hidden", false);
        // Show modal
        $('#assetLocationModal').modal('show');
    });

    $(document).on("click", "#assetLocationModalSubmit", function () {
        if ($("#assetLocationModalForm").valid()) {
            $("#assetLocationModalSubmit").prop('disabled', true);
            $('#overlay').css('display', 'block');
            $('.loader').css('display', 'block');
            const departmentId = $('#departmentId').val();
            const address = $('#address').val();
            const locationImage = $('#locationImage').prop('files')[0];

                const formData = new FormData();
                formData.append('departmentId', departmentId);
                formData.append('address', address);
                formData.append('locationImage', locationImage);

                $.ajax({
                    url: '/Asset/AddAssetLocation',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function (data, status) {
                        $("#assetLocationModalSubmit").prop('disabled', false);
                        $('#overlay').css('display', 'none');
                        $('.loader').css('display', 'none');
                        if (status == "success") {
                            if (typeof data !== 'string') {
                                var grid = $("#grid").data("kendoGrid");
                                grid.dataSource.add(data);
                                grid.refresh();
                                Swal.fire({ icon: 'success', title: "Location Added Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#assetLocationModal').modal('hide'); });
                            } else {
                                const response = JSON.parse(data);
                                Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                    $('#assetLocationModal').modal('hide');
                                });
                            }
                        }
                    },
                    error: function (error) {
                        $("#assetLocationModalSubmit").prop('disabled', false);
                        $('#overlay').css('display', 'none');
                        $('.loader').css('display', 'none');
                        const response = JSON.parse(error.responseText);
                        Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                            $('#assetLocationModal').modal('hide');
                        });
                    }
                });
        }
    });

    $(document).on('click', '.edit-button', function () {
        var row = $(this).closest('tr');
        var dataItem = $("#grid").data("kendoGrid").dataItem(row);

        $('#locationId').val(dataItem.locationId);
        $('#departmentId').val(dataItem.departmentId).trigger('change');
        $('#address').val(dataItem.address);
        $('#locationImage').val("");
        if (dataItem.locationImage) {
            $('#imagePreview').attr('src', "/images/assetLocationImages/" + dataItem.locationImage);
            $('#imagePreviewDiv').prop("hidden", false);
        } else {
            $('#imagePreviewDiv').prop("hidden", true);
        }

        $("#departmentId-error,#address-error").remove();

        $("#assetLocationModalUpdate").prop("hidden", false);
        $("#assetLocationModalSubmit").prop("hidden", true);
        $("#assetLocationModalUpdate").prop("disabled", true);

        $(".form-control").on("input", function () {
            var inputId = $(this).attr('id');
            var inputValue = $(this).val();
            var dataItemValue = dataItem[inputId];

            if (inputValue == dataItemValue) {
                $("#assetLocationModalUpdate").prop('disabled', true);
            } else {
                $("#assetLocationModalUpdate").prop('disabled', false);
            }
        });

        $('#assetLocationModal').modal('show');
    });

    $(document).on("click", "#assetLocationModalUpdate", function () {
        if ($("#assetLocationModalForm").valid()) {
            $("#assetLocationModalUpdate").prop('disabled', true);
            $('#overlay').css('display', 'block');
            $('.loader').css('display', 'block');

            const locationId = $('#locationId').val();
            const departmentId = $('#departmentId').val();
            const address = $('#address').val();
            const locationImage = $('#locationImage').prop('files')[0] || null;

            const formData = new FormData();
            formData.append('locationId', locationId);
            formData.append('departmentId', departmentId);
            formData.append('address', address);
            formData.append('locationImage', locationImage);



            $.ajax({
                url: '/Asset/UpdateAssetLocation',
                type: 'PUT',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data, status) {
                    $("#assetLocationModalUpdate").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    if (status == "success") {
                        if (typeof data !== 'string') {
                            const grid = $("#grid").data("kendoGrid");

                            var dataItemToRemove = grid.dataSource.data().find(function (item) {
                                return item.locationId == locationId;
                            });

                            if (dataItemToRemove) {
                                grid.dataSource.remove(dataItemToRemove);
                                grid.dataSource.add(data);
                                grid.refresh();
                                Swal.fire({ icon: 'success', title: "Location Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#assetLocationModal').modal('hide'); });
                            } else {
                                Swal.fire({ icon: 'success', title: "Location Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { location.reload(); });
                            }
                        }
                        else {
                            const response = JSON.parse(data);
                            Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                $('#assetLocationModal').modal('hide');
                            });
                        }
                    }
                },
                error: function (error) {
                    $("#assetLocationModalUpdate").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    const response = JSON.parse(error.responseText);
                    Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                        $('#assetLocationModal').modal('hide');
                    });
                }
            });

        }


    });

    $(document).on('click', '.delete-button', function () {
        var row = $(this).closest('tr');
        var dataItem = $("#grid").data("kendoGrid").dataItem(row);
        var assetLocationId = dataItem.locationId;
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this Allocation!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $('#overlay').css('display', 'block');
                $('.loader').css('display', 'block');
                $.ajax({
                    url: '/Asset/DeleteAssetLocation?assetLocationId=' + assetLocationId,
                    type: 'DELETE',
                    success: function (data, status) {
                        $('#overlay').css('display', 'none');
                        $('.loader').css('display', 'none');
                        if (status == "success") {
                            const response = JSON.parse(data);
                            if (response.status) {
                                var grid = $("#grid").data("kendoGrid");
                                var dataItemToRemove = grid.dataSource.data().find(item => item.locationId === assetLocationId);
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
                                    $('#assetLocationModal').modal('hide');
                                });
                            }
                        }
                    },
                    error: function (error) {
                        $('#overlay').css('display', 'none');
                        $('.loader').css('display', 'none');
                        const response = JSON.parse(error.responseText);
                        Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                            $('#assetLocationModal').modal('hide');
                        });
                    }
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Show cancellation message
                Swal.fire({ title: 'Cancelled', text: 'Location deletion has been cancelled', icon: 'info', showConfirmButton: false, timer: 2000 });
            }
        });
    });


    $('#assetLocationModal').one('show.bs.modal', function () {
        fetchData('/Search/GetDepartments', departmentsDropdown);

        $("#departmentId").select2({
            dropdownParent: $("#assetLocationModal")
        });
        $(document).on("select2:open", () => {
            document.querySelector(".select2-container--open .select2-search__field").focus()
        });


        $("#assetLocationModalForm").validate({
            rules: {
                departmentId: {
                    required: true
                },
                address: {
                    required: true
                }
            },

            messages: {
                departmentId: {
                    required: "Please Select Department"
                },
                address: {
                    required: "Please Enter Address"
                }
            },
            errorPlacement: function (error, element) {

                if (element.hasClass("select2-hidden-accessible")) {
                    error.insertAfter(element.next("span.select2"));
                } else if (element.is("textarea")) { 
                    error.appendTo(element.parent());
                } else {
                    error.insertAfter(element);
                }
            }
        });
        $("#assetAllocationModalForm input, #assetAllocationModalForm select").on("input change", function () {
            $(this).next(".error").remove();
        });

    });

    $('#locationImage').on('change', function () {

        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').attr('src', e.target.result);
            }
            reader.readAsDataURL(this.files[0]);
        }
        $('#imagePreviewDiv').prop("hidden", false);
    });

});