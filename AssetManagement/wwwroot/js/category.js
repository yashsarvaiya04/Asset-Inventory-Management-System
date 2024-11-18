$(function () {
    const shortingColumnName = "CategoryName";
    const toolbarTemplate = '<button class="k-button k-primary" id="addCategoriesBtn">Add Category</button>';
    const exportName = "Category";
    const columns = [
        { field: "CategoryName", title: "Name", width: "150px" },
        { field: "Description", title: "Description", width: "150px" },
        {
            field: "CategoryLogo",
            title: "Logo",
            width: "60px",
            template: function (dataItem) {
                if (dataItem.CategoryLogo) {
                    return '<img src="/images/categoryImages/' + dataItem.CategoryLogo + '"class="showModalImage" style="max-width:80px;max-height:80px; border-radius: 50%;" />';
                } else {
                    return '<p>Image not Available<p/>';
                }
            },
            visible: function (dataItem) {
                return dataItem.CategoryLogo !== null;
            },

        },
        { command: [{ name: "subCategory", text: "Sub Categories", click: openSubCategory }], title: "Sub Category", width: "55px" },
        {
            command: [
                { name: "edit", text: "", iconClass: "k-icon k-i-edit", click: openEditModal },
                { name: "delete", text: "", iconClass: "k-icon k-i-delete", click: openDeleteModal }
            ],
            title: "Action",
            width: "40px"
        }

    ];
    initializeGrid(categoriesData, shortingColumnName, exportName, toolbarTemplate, columns);

 


    // Add Category
    $('#addCategoriesBtn').on('click', function () {
        $("#saveChangesBtn").addClass("d-none");
        $("#saveCategoryBtn").removeClass("d-none");
        $('#addModal').modal('show');
    });

    $('#saveCategoryBtn').on('click', function () {
        if ($("#addForm").valid()) {
            var categoryData = new FormData();
            categoryData.append('CategoryName', $("#categoryName").val());
            categoryData.append('Description', $("#categoryDescription").val());
            categoryData.append('CategoryLogo', $('#categoryLogo').prop('files')[0]);

            $.ajax({
                url: '/Category/AddCategories',
                type: 'POST',
                data: categoryData,
                processData: false,
                contentType: false,
                success: function (response) {
                    Swal.fire({ icon: 'success', title: "Category Added Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#addModal').modal('hide'); location.reload(); });
                },
                error: function (xhr, status, error) {
                    console.error('Error adding category:', error);
                    const response = error.responseText;
                    Swal.fire({ icon: 'error', title: 'Error', text: response });
                }
            });
        }
    });



    // Update Category
    function openEditModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        console.log(dataItem);
        populateEditModal(dataItem);
        $('#addModal').modal('show');
    }

    function populateEditModal(dataItem) {
        console.log(dataItem);
        console.log(dataItem.CategoryLogo);
        $("#saveCategoryBtn").addClass("d-none");
        $("#saveChangesBtn").removeClass("d-none").prop('disabled', true);

        $("#categoryId").val(dataItem.CategoryId);
        $("#categoryName").val(dataItem.CategoryName).data('original-name', dataItem.CategoryName);
        $("#categoryDescription").val(dataItem.Description).data('original-description', dataItem.Description);

        $(".form-control").on("input", function () {
            $("#saveChangesBtn").prop('disabled', false);
        });

        if (dataItem.CategoryLogo) {
            $(".preview-column").removeClass("d-none");
            $("#imagePreview").attr("src", "/images/categoryImages/" + dataItem.CategoryLogo);
        } else {
            $(".preview-column").addClass("d-none");
        }
    }



    
    $(document).on("click", "#saveChangesBtn", function () {
        if ($("#addForm").valid()) {
            var categoryData = new FormData();
            categoryData.append('CategoryId', $("#categoryId").val());
            categoryData.append('CategoryName', $("#categoryName").val());
            categoryData.append('Description', $("#categoryDescription").val());
            categoryData.append('CategoryLogo', $('#categoryLogo').prop('files')[0]);
            $.ajax({
                url: '/Category/UpdateCategory',
                type: 'PUT',
                data: categoryData,
                processData: false,
                contentType: false,
                success: function (response) {
                    console.log(response);
                    console.log('Category updated successfully');
                    Swal.fire({ icon: 'success', title: "Category Updated Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { $('#addForm').modal('hide'); location.reload(); });
                },
                error: function (xhr, status, error) {
                    console.error('Error updating category:', error);
                    const response = error.responseText;
                    Swal.fire({ icon: 'error', title: 'Error', text: response });
                }
            });
        }
    });

    // Open Sub Category
    function openSubCategory(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        window.location.href = '/Category/Subcategory/' + dataItem.CategoryId;
    }

    // Delete Category
    function openDeleteModal(e) {
        e.preventDefault();
        var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
        $("#deleteModal").modal("show");
        $("#confirmDeleteBtn").off("click").on("click", function () {
            deleteCategory(dataItem.CategoryId);
            $("#deleteModal").modal("hide");
        });
    }

    function deleteCategory(categoryId) {
        $.ajax({
            url: '/Category/DeleteCategory?categoryId=' + categoryId,
            type: 'DELETE',
            success: function (response) {
                console.log('Category deleted successfully');
                Swal.fire({ icon: 'success', title: "Category Deleted Successfully.", showConfirmButton: false, timer: 2000 }).then(function () { location.reload(); });
            },
            error: function (xhr, status, error) {
                console.error('Error deleting category:', error);
                const response = error.responseText;
                Swal.fire({ icon: 'error', title: 'Error', text: response });
            }
        });
    }

    // Validate Add and Edit Category Form
    $("#addForm").validate({
        rules: {
            categoryName: { required: true, minlength: 2 },
            categoryDescription: { required: true }
        },
        messages: {
            categoryName: { required: "Please Enter Category Name!", minlength: "Category Name Must Be At Least 2 Characters Long!" },
            categoryDescription: { required: "Please Enter Category Description!" }
        },
        errorPlacement: function (error, element) {
            error.addClass("error-message").insertAfter(element);
        }
    });

    document.getElementById('categoryLogo').addEventListener('change', function (event) {
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