$(function () {

    // To get the Category Id of current Sub Category
    function getCategoryFromUrl() {
        var categoryId = window.location.pathname.split('/').pop();
        return categoryId;
    }

  
    const shortingColumnName = "SubCategoryName";
    const toolbarTemplate = '<button class="k-button k-primary" id="addSubCategoriesBtn">Add New Record</button>';
    const exportName = "Sub Category";
    const columns = [
        { field: "SubCategoryName", title: "Name", width: "120px" },
        { field: "CategoryName", title: "Category", width: "150px" },
        { field: "Description", title: "Description", width: "250px" },
        {
            field: "SubCategoryLogo",
            title: "Logo",
            width: "60px",
            template: function (dataItem) {
                return '<img src="/images/subCategoryImages/' + dataItem.SubCategoryLogo + '" style="max-width:60px;max-height:60px; border-radius: 50%;" />';
            },
            visible: function (dataItem) {
                return dataItem.SubCategoryLogo !== null;
            },

        },
        {
            command: [
                { name: "edit", text: "", iconClass: "k-icon k-i-edit", click: openEditModal },
                { name: "delete", text: "", iconClass: "k-icon k-i-delete", click: openDeleteModal }
            ],
            title: "Action",
            width: "60px"
        }];
    initializeGrid(subCategoriesData, shortingColumnName, exportName, toolbarTemplate, columns);




    // Add Sub Category
    $('#addSubCategoriesBtn').on('click', function () {
        $("#addModalLabel").text("Add Sub Category");

        $("#saveChangesBtn").addClass("d-none");
        $("#saveSubCategoryBtn").removeClass("d-none");
        $('#addModal').modal('show');
    });

    $('#saveSubCategoryBtn').on('click', function () {
        if ($("#addForm").valid()) {
            var subCategoryData = new FormData();
            subCategoryData.append('CategoryId', getCategoryFromUrl());
            subCategoryData.append('SubCategoryName', $("#subCategoryName").val());
            subCategoryData.append('Description', $("#subCategoryDescription").val());
            subCategoryData.append('SubCategoryLogo', $('#subCategoryLogo').prop('files')[0]);

            $.ajax({
                url: '/Category/Subcategory/AddSubCategories',
                type: 'POST',
                data: subCategoryData,
                processData: false,
                contentType: false,
                success: function (response) {
                    console.log(response);
                    console.log('SubCategory added successfully');
                    Swal.fire({ icon: 'success', title: "Sub Category Added Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#addModal').modal('hide'); location.reload(); });
                },
                error: function (xhr, status, error) {
                    console.error('Error adding subcategory:', error);
                    const response = error.responseText;
                    Swal.fire({ icon: 'error', title: 'Error', text: response });
                }
            });
        }
    });

    // Edit Sub Category
    function openEditModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        console.log(dataItem);
        populateEditModal(dataItem);
        $('#addModal').modal('show');
    }

    function populateEditModal(dataItem) {
        $("#addModalLabel").text("Update Sub Category");

        $("#saveSubCategoryBtn").addClass("d-none");
        $("#saveChangesBtn").removeClass("d-none");

        $("#subCategoryId").val(dataItem.SubCategoryId);
        $("#subCategoryName").val(dataItem.SubCategoryName);
        $("#subCategoryDescription").val(dataItem.Description);

        if (dataItem.SubCategoryLogo) {
            $(".preview-column").removeClass("d-none");
            $('#SubCategoryLogo').val("");
            $("#imagePreview").attr("src", "/images/subCategoryImages/" + dataItem.SubCategoryLogo);
        } else {
            $(".preview-column").addClass("d-none");
        }
    }

    $(document).on("click", "#saveChangesBtn", function () {
        if ($("#addForm").valid()) {
            var subCategoryData = new FormData();
            subCategoryData.append('CategoryId', getCategoryFromUrl());
            subCategoryData.append('SubCategoryId', $("#subCategoryId").val());
            subCategoryData.append('SubCategoryName', $("#subCategoryName").val());
            subCategoryData.append('Description', $("#subCategoryDescription").val());
            subCategoryData.append('SubCategoryLogo', $('#subCategoryLogo').prop('files')[0] || null);

            $.ajax({
                url: '/Category/Subcategory/UpdateSubCategory',
                type: 'PUT',
                data: subCategoryData,
                processData: false,
                contentType: false,
                success: function (response) {
                    console.log('Category updated successfully');
                    Swal.fire({ icon: 'success', title: "Sub Category Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#addModal').modal('hide'); location.reload(); });
                },
                error: function (xhr, status, error) {
                    console.error('Error updating category:', error);
                    const response = error.responseText;
                    Swal.fire({ icon: 'error', title: 'Error', text: response });
                }
            });
        }
    });

    // Delete Sub Category
    function openDeleteModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $("#deleteModal").modal("show");
        $("#confirmDeleteBtn").off("click").on("click", function () {
            var categoryId = getCategoryFromUrl();
            deleteSubCategory(dataItem.SubCategoryId);
            $("#deleteModal").modal("hide");
        });
    }

    function deleteSubCategory(subCategoryId) {
        $.ajax({
            url: '/Category/Subcategory/DeleteSubCategory?subCategoryId=' + subCategoryId,
            type: 'DELETE',
            success: function (response) {
                console.log('Category deleted successfully');
                Swal.fire({ icon: 'success', title: "Sub Category Deleted Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { location.reload(); });
            },
            error: function (xhr, status, error) {
                console.error('Error deleting category:', error);
                const response = error.responseText;
                Swal.fire({ icon: 'error', title: 'Error', text: response });
            }
        });
    }


    // Validate Add and Edit Form
    $("#addForm").validate({
        rules: {
            subCategoryName: {
                required: true,
                minlength: 2
            },
            subCategoryDescription: {
                required: true
            }
        },
        messages: {
            subCategoryName: {
                required: "Please enter Sub Category Name",
                minlength: "Sub Category Name must be at least 2 characters long"
            },
            subCategoryDescription: {
                required: "Please enter Sub Category Description"
            }
        },
        errorPlacement: function (error, element) {
            error.addClass("error-message");
            error.insertAfter(element);
        }
    });


    document.getElementById('subCategoryLogo').addEventListener('change', function (event) {
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function (event) {
            var imageUrl = event.target.result;
            document.getElementById('imagePreview').src = imageUrl;
            document.querySelector('.preview-column').classList.remove('d-none');
        };
        reader.readAsDataURL(file);
    });

});