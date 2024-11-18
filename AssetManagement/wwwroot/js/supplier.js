$(function () {

    function countryDropdown(countriesList) {
        countriesList.forEach(function (country) {
            $("#countryId").append('<option value="' + country.countryId + '">' + country.countryName + '</option>');
        });
    }

    function stateDropdown(stateList) {
        let firstOption = $("#stateId option:first");
        $("#stateId").empty().append(firstOption).val(firstOption.val());
        stateList.forEach(function (state) {
            $("#stateId").append('<option value="' + state.stateId + '" data-countryid=' + state.categoryId + '>' + state.stateName + '</option>');
        });
    }

    function cityDropdown(cityList) {
        let firstOption = $("#cityId option:first");
        $("#cityId").empty().append(firstOption).val(firstOption.val());
        cityList.forEach(function (city) {
            $("#cityId").append('<option value="' + city.cityId + '" data-countryid=' + city.countryId + ' data-stateid=' + city.stateId + '>' + city.cityName + '</option>');
        });
    }


    $(document).on("click", "#addSupplier", function () {


        $("#supplierName, #supplierEmail, #supplierPhoneNumber, #countryId, #stateId, #cityId,#supplierAddress,#supplierImage").val(null).trigger("change");

        $('#imagePreviewDiv').prop("hidden", true);
        // Enable input fields
        $("#supplierName, #supplierEmail, #supplierPhoneNumber, #countryId, #stateId, #cityId,#supplierAddress").prop("disabled", false);
        // Hide elements

        // Update Button Hide And Submit Button Show
        $("#supplierModalUpdate").prop("hidden", true);
        $("#supplierModalSubmit").prop("hidden", false);

        $("#supplierName-error,#supplierEmail-error,#supplierPhoneNumber-error,#countryId-error,#stateId-error,#cityId-error,#supplierAddress-error").remove();

        $("#supplierModal").modal("show");
    });

    $(document).on("click", "#supplierModalSubmit", function () {
        if ($("#supplierModalForm").valid()) {
            $("#supplierModalSubmit").prop('disabled', true);
            $('#overlay').css('display', 'block');
            $('.loader').css('display', 'block');
            const supplierData = new FormData();
            supplierData.append('supplierName', $("#supplierName").val());
            supplierData.append('supplierEmail', $("#supplierEmail").val());
            supplierData.append('supplierPhoneNumber', $("#supplierPhoneNumber").val());
            supplierData.append('supplierAddress', $("#supplierAddress").val());
            supplierData.append('countryId', $("#countryId").val());
            supplierData.append('stateId', $("#stateId").val());
            supplierData.append('cityId', $("#cityId").val());
            supplierData.append('supplierImage', $('#supplierImage').prop('files')[0]);
            $.ajax({
                url: "/Other/AddSupplier",
                type: "POST",
                data: supplierData,
                processData: false,
                contentType: false,
                success: function (data, status) {
                    $("#supplierModalSubmit").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    if (status == "success") {
                        if (typeof data !== 'string') {
                            console.log(data);
                            Swal.fire({ icon: 'success', title: "Supplier Added Successfully.", showConfirmButton: false, timer: 2000 }).then(function () {
                                const grid = $("#grid").data("kendoGrid");
                                grid.dataSource.add(data);
                                grid.refresh();
                                $('#supplierModal').modal('hide');
                            });

                        } else {
                            const response = JSON.parse(data);
                            Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                $('#supplierModal').modal('hide');
                            });
                        }

                    }
                },
                error: function (error) {
                    $("#supplierModalSubmit").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    const response = JSON.parse(error.responseText);
                    Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                        $('#supplierModal').modal('hide');
                    });
                }
            });
        }
    });

    $(document).on('click', '.edit-button', function () {
        // Data fatch 
        const dataItem = $("#grid").data("kendoGrid").dataItem($(this).closest('tr'));

        // Value add in input fields
        $('#supplierId,#supplierName, #supplierEmail, #supplierPhoneNumber, #countryId,#supplierAddress').val(function () {
            return dataItem[$(this).attr('id')];
        }).trigger("change");

        fetchData('/Search/GetStatesByCountryId?countryId=' + $("#countryId").val(), stateDropdown);
        $('#stateId').val(dataItem.stateId).trigger("change");
        fetchData('/Search/GetCitiesByStateId?stateId=' + $("#stateId").val(), cityDropdown);
        $('#cityId').val(dataItem.cityId).trigger("change");
        $('#supplierImage').val("");
        if (dataItem.supplierImage) {
            $('#imagePreview').attr('src', "/images/supplierImages/" + dataItem.supplierImage);
            $('#imagePreviewDiv').prop("hidden", false);
        } else {
            $('#imagePreviewDiv').prop("hidden", true);
        }


        $("#supplierName-error,#supplierEmail-error,#supplierPhoneNumber-error,#countryId-error,#stateId-error,#cityId-error,#supplierAddress-error").remove();
        // Enable input fields
        $("#supplierName, #supplierEmail, #supplierPhoneNumber, #countryId, #stateId, #cityId,#supplierAddress").prop("disabled", false);

        // Submit Button Hide And Update Button Show
        $("#supplierModalUpdate").prop("hidden", false);
        $("#supplierModalSubmit").prop("hidden", true);

        // Show Modal
        $('#supplierModal').modal('show');
    });

    $(document).on("click", "#supplierModalUpdate", function () {

        if ($("#supplierModalForm").valid()) {
            $("#supplierModalUpdate").prop('disabled', true);
            $('#overlay').css('display', 'block');
            $('.loader').css('display', 'block');
            const supplierId = $("#supplierId").val();
            const supplierImage = $('#supplierImage').prop('files')[0] || null;
            var supplierData = new FormData();
            supplierData.append('supplierId', $("#supplierId").val());
            supplierData.append('supplierName', $("#supplierName").val());
            supplierData.append('supplierEmail', $("#supplierEmail").val());
            supplierData.append('supplierPhoneNumber', $("#supplierPhoneNumber").val());
            supplierData.append('supplierAddress', $("#supplierAddress").val());
            supplierData.append('countryId', $("#countryId").val());
            supplierData.append('stateId', $("#stateId").val());
            supplierData.append('cityId', $("#cityId").val());
            supplierData.append('supplierImage', supplierImage);

            $.ajax({
                url: '/Other/UpdateSupplier',
                type: 'PUT',
                data: supplierData,
                processData: false,
                contentType: false,
                success: function (data, status) {
                    $("#supplierModalUpdate").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    if (status == "success") {
                        if (typeof data !== 'string') {
                            const grid = $("#grid").data("kendoGrid");
                            const dataItemToRemove = grid.dataSource.data().find(function (item) {
                                return item.supplierId == supplierId;
                            });
                            if (dataItemToRemove) {
                                grid.dataSource.remove(dataItemToRemove);
                                grid.dataSource.add(data);
                                grid.refresh();
                                Swal.fire({ icon: 'success', title: "Supplier Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#supplierModal').modal('hide'); });
                            } else {
                                Swal.fire({ icon: 'success', title: "Supplier Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { location.reload(); });
                            }
                        }
                        else {
                            const response = JSON.parse(data);
                            Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                                $('#supplierModal').modal('hide');
                            });
                        }
                    }
                },
                error: function (error) {
                    $("#supplierModalUpdate").prop('disabled', false);
                    $('#overlay').css('display', 'none');
                    $('.loader').css('display', 'none');
                    const response = JSON.parse(error.responseText);
                    Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                        $('#supplierModal').modal('hide');
                    });
                }
            });

        }
    });

    $(document).on('click', '.delete-button', function () {
        const supplierId = $("#grid").data("kendoGrid").dataItem($(this).closest('tr')).supplierId;
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this Supplier!',
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
                    url: '/Other/DeleteSupplier?supplierId=' + supplierId,
                    type: 'DELETE',
                    success: function (data, status) {
                        $('#overlay').css('display', 'none');
                        $('.loader').css('display', 'none');
                        if (status === "success") {
                            console.log(data);
                            const response = JSON.parse(data);
                            if (response.status) {
                                var grid = $("#grid").data("kendoGrid");
                                var dataItemToRemove = grid.dataSource.data().find(item => item.supplierId === supplierId);
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
                                    $('#supplierModal').modal('hide');vvv
                                });
                            }

                        }
                    },
                    error: function (error) {
                        $('#overlay').css('display', 'none');
                        $('.loader').css('display', 'none');
                        const response = JSON.parse(error.responseText);
                        Swal.fire({ icon: 'error', title: 'Error', text: response.message }).then(function () {
                            $('#supplierModal').modal('hide');
                        });
                    }
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({ title: 'Cancelled', text: 'Sopplier deletion has been cancelled', icon: 'info', showConfirmButton: false, timer: 2000 });
            }
        });
    });

    $('#supplierModal').one('show.bs.modal', function () {

        $(document).on("change", "#countryId", function () {
            fetchData('/Search/GetStatesByCountryId?countryId=' + $("#countryId").val(), stateDropdown);
            //$("#countryId").prop("disabled", false);
            $("#stateId").val(null).trigger('change');
            $("#cityId").val(null).trigger('change');
        });

        $(document).on("change", "#stateId", function () {
            fetchData('/Search/GetCitiesByStateId?stateId=' + $("#stateId").val(), cityDropdown);
            //$("#cityId").prop("disabled", false);
            $("#cityId").val(null).trigger('change');
        });

        $("#countryId,#stateId,#cityId").select2({
            dropdownParent: $("#supplierModal")
        });
        $(document).on("select2:open", () => {
            document.querySelector(".select2-container--open .select2-search__field").focus()
        });





        $('#supplierImage').on('change', function () {

            if (this.files && this.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    $('#imagePreview').attr('src', e.target.result);
                }
                reader.readAsDataURL(this.files[0]);
            }
            $('#imagePreviewDiv').prop("hidden", false);
        });


        $("#supplierModalForm").validate({
            rules: {
                supplierName: {
                    required: true
                },
                supplierEmail: {
                    required: true
                },
                supplierPhoneNumber: {
                    required: true
                },
                countryId: {
                    required: true
                },
                stateId: {
                    required: true
                },
                cityId: {
                    required: true
                },
                supplierAddress: {
                    required: true
                },

            },

            messages: {
                supplierName: {
                    required: "Please Enter Name"
                },
                supplierEmail: {
                    required: "Please Enter Email"
                },
                supplierPhoneNumber: {
                    required: "Please Enter Phonr Number"
                },
                countryId: {
                    required: "Please Select Country"
                },
                stateId: {
                    required: "Please Select State"
                },
                cityId: {
                    required: "Please Select City"
                },
                supplierAddress: {
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
        $("#supplierModalForm input, #supplierModalForm select").on("input change", function () {
            $(this).next(".error").remove();
        });

    });


    const shortingColumnName = "supplierName";
    const toolbarTemplate = '<button class="k-button k-primary" id="addSupplier"">Add Supplier</button>';
    const exportName = "Supplier";
    const columns = [
        { field: "supplierName", title: "Supplier Name" },
        { field: "supplierEmail", title: "Supplier Email" },
        { field: "supplierPhoneNumber", title: "Supplier Number" },
        { field: "supplierAddress", title: "Supplier Address" },
        { field: "countryName", title: "Country", hidden: true },
        { field: "stateName", title: "State", hidden: true },
        { field: "cityName", title: "City", hidden: true },
        {
            field: "supplierImage",
            title: "Image",
            width: "150px",
            template: function (dataItem) {
                if (dataItem.supplierImage) {
                    return '<img loading="lazy" src="/images/supplierImages/' + dataItem.supplierImage + '" onerror="this.onerror=null;this.src=\'/images/locationDummyImage.jpg\';" alt="Location Image" class="showModalImage" style="max-width:50px;max-height:50px; border-radius: 50%;" />';
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
    initializeGrid(suppliersData, shortingColumnName, exportName, toolbarTemplate, columns);





    fetchData('/Search/GetCountries', countryDropdown);
    //fetchData('/Search/GetStates', stateDropdown);
    //fetchData('/Search/GetCities', cityDropdown);
});
