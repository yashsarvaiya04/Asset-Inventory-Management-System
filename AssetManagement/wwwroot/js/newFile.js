$(function() {
    function initializeGrid(width) {


        $("#grid").kendoGrid({
            dataSource: {
                data: maintenanaceData,
                pageSize: 10,
                sort: { field: "Assetname", dir: "asc" }
            },
            pageable: {
                refresh: true,
                pageSizes: [10, 25, 50, 100, "all"],
                buttonCount: 10
            },
            sortable: true,
            navigatable: true,
            resizable: true,
            reorderable: true,
            filterable: true,

            toolbar: [
                { template: '<button class="k-button k-primary" id="openAddMaintenanceModalBtn"">Add Maintenance</button>' },
                "search",
                "excel",
                "pdf"
            ],
            excel: {
                fileName: "Maintenance.xlsx",
                filterable: true,
                allPages: true
            },
            pdf: {
                fileName: "Maintenance.pdf",
                allPages: true,
                avoidLinks: true,
                paperSize: "A4",
                margin: { top: "2cm", left: "1cm", right: "1cm", bottom: "1cm" },
                landscape: true,
                repeatHeaders: true,
                scale: 0.8
            },
            columnMenu: true,

            columns: [
                { field: "AssetName", title: "AssetName", width: "150px" },
                { field: "Description", title: "Description", width: "150px" },

                { field: "ScheduleDate", title: "ScheduleDate", width: "200px" },
                { field: "CompletionDate", title: "CompletionDate", width: "150px" },



                { command: [{ name: "edit", text: "Edit", click: openEditModal }], title: "Edit", width: "100px" },
                { command: [{ name: "delete", text: "Delete", click: openDeleteModal }], title: "Delete", width: "100px" }
            ],
            editable: false,

            dataBound: function() {
                $(".k-header-column-menu,.k-grid-filter").css("color", "white");
                $(".k-header-column-menu").on("mouseenter", function() {
                    $(this).css("background-color", "#003f5c");
                });
                $(".k-input .k-input-inner").one("focus", function() {
                    $(".k-header-column-menu").css("background-color", "#003f5c");
                });
            }
        }).width(width); // Set initial width
    }

    function checkAndInitializeGrid() {
        var mainDiv = $(".main");
        var width = mainDiv.hasClass("active") ? 1390 : 1170; // Initial width
        initializeGrid(width);
    }

    checkAndInitializeGrid();

    $(".toggle").on("click", function() {
        var width = $(".main").hasClass("active") ? 1390 : 1170;
        $(".main").hasClass("active") ? $("#grid").animate({ width: width }, 270) : $("#grid").animate({ width: width }, 250);
    });
    // ADD MODAL
    $("#openAddMaintenanceModalBtn").on("click", function() {
        $("#addMaintenanceModal").modal("show");
    });



    $("#saveMaintenanceBtn").click(function() {
        console.log("hello");
        var maintenanceData = new FormData();


        maintenanceData.append('MaintenanceId', $("#addMaintenanceId").val());
        maintenanceData.append('AssetId', $("#addAssetId").val());
        maintenanceData.append('AssetName', $("#addAssetName").val());
        maintenanceData.append('Description', $("#addDescription").val());
        maintenanceData.append('ScheduleDate', $("#addScheduleDate").val());
        maintenanceData.append('CompletionDate', $("#addCompletionDate").val());
        maintenanceData.append('CreatedBy', null);
        console.log("Hello 2");


        $.ajax({
            url: "/Asset/AddMaintenance",
            method: "POST",
            data: maintenanceData,
            processData: false,
            contentType: false,

            //contentType: "application/json",
            //data: JSON.stringify(maintenanceData),
            success: function(response) {
                Swal.fire({ icon: 'success', title: "Manufacture Added Successfully.", showConfirmButton: false, timer: 2000 });

                $("#addMaintenanceModal").modal("hide");
                location.reload();
            },
            error: function(error) {
                console.error(error);
                const response = error.responseText;

                // Show error message
                Swal.fire({ icon: 'error', title: 'Error', text: "Failed to add Maintenance data. Please try again later." });

                $("#addMaintenanceModal").modal("hide");
                location.reload();
            }
        });
    });
});
