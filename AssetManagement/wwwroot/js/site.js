$(function () {
    // menu toggle
    const toggle = $(".toggle");
    const navigation = $(".navigation");
    const main = $(".main");
    const list = $(".navigation li");

    toggle.on("click", function () {
        navigation.toggleClass("active");
        main.toggleClass("active");
    });

    let itemWithHoverClass = null;
    $(list).each(function () {
        const action = $(this).find("a").attr("asp-action");
        const href = $(this).find("a").attr("href");
        // Check if the current page's URL matches the href or contains the action
        if (window.location.pathname === href || window.location.pathname.includes(action)) {
            $(this).addClass("hovered");
            itemWithHoverClass = $(this);
        }
    });

    $(list).on({
        mouseover: function () {
            list.removeClass("hovered");
            $(this).addClass("hovered");
        },
        mouseout: function () {
            list.removeClass("hovered");
            itemWithHoverClass.addClass("hovered");
        }
    });


    $(document).on("click", ".showModalImage", function () {
        const imageSrc = $(this).attr('src');
        $("#viewImage").attr('src', imageSrc);
        $("#viewImageModal").modal('show');
        $(document).on("click", "#viewImage", function () {
            $(this).toggleClass("fullscreen");
        });
    });
});

function fetchData(url, callback) {
    $.ajax({
        url: url,
        type: 'GET',
        async: false,
        success: function (data, status) {
            if (status == "success") {
                callback(data);
            }
        },
        error: function (error) {
            console.error(error);
        }
    });
}

function initializeGrid(dataSource, shortingColumnName, exportName, toolbarTemplate, columns, pdfPaperSize = "A2", removeColumns = ["Action", "Image"]) {
    var exportFlag = false;
    return $("#grid").kendoGrid({
        dataSource: {
            data: dataSource,
            pageSize: 10,
            sort: [{ field: shortingColumnName, dir: "asc" }]
        },
        pageable: {
            refresh: true,
            pageSizes: [10, 25, 50, 100, "all"]
        },
        sortable: true,
        filterable: true,
        toolbar: [
            { template: toolbarTemplate },
            "search",
            "excel",
            "pdf"
        ],
        columnMenu: true,
        columns: columns,
        mobile: true,
        pdfExport: function (e) {
            if (!exportFlag) {
            
                removeColumns.forEach(function (columnName) {
                    var columnIndex = e.sender.columns.findIndex(function (column) {
                        return column.title === columnName;
                    });
                    if (columnIndex !== -1) {
                        e.sender.hideColumn(columnIndex);
                    }
                });

                // Additional PDF export options
                e.sender.options.pdf = {
                    fileName: exportName + ".pdf",
                    allPages: true,
                    avoidLinks: true,
                    paperSize: pdfPaperSize,
                    margin: { top: "2cm", left: "1cm", right: "1cm", bottom: "1cm" },
                    landscape: true,
                    repeatHeaders: true,
                    scale: 0.8,
                    title: exportName,

                };

                e.preventDefault();
                exportFlag = true;

                e.sender.saveAsPDF().then(function () {
               
                    removeColumns.forEach(function (columnName) {

                        var columnIndex = e.sender.columns.findIndex(function (column) {
                            return column.title === columnName;
                        });
                        if (columnIndex !== -1) {
                            e.sender.showColumn(columnIndex);
                        }
                    });

                    exportFlag = false;
                });
            }
        },
        excelExport: function (e) {
            if (!exportFlag) {
                // Find column indices by their field names and remove them
                removeColumns.forEach(function (columnName) {
                    var columnIndex = e.sender.columns.findIndex(function (column) {
                        return column.title === columnName;
                    });
                    if (columnIndex !== -1) {
                        e.sender.hideColumn(columnIndex);
                    }
                });

                // Additional Excel export options
                e.sender.options.excel = {
                    fileName: exportName + ".xlsx",
                    filterable: true,
                    allPages: true
                };

                e.preventDefault();
                exportFlag = true;
                e.sender.bind("excelExport", function (event) {
                    // Show the removed columns again
                    removeColumns.forEach(function (columnName) {
                        var columnIndex = e.sender.columns.findIndex(function (column) {
                            return column.title === columnName;
                        });
                        if (columnIndex !== -1) {
                            e.sender.showColumn(columnIndex);
                        }
                    });
                    exportFlag = false;

                    // Unbind the event listener to avoid multiple executions
                    e.sender.unbind("excelExport");
                });

                // Initiate the Excel export
                e.sender.saveAsExcel();
            }
        },
        dataBound: function () {
            $(".k-header-column-menu,.k-grid-filter").css("color", "white");
            $(".k-header-column-menu").on("mouseenter", function () { $(this).css("background-color", "#003f5c"); });
            $(".k-input .k-input-inner").one("focus", function () { $(".k-header-column-menu").css("background-color", "#003f5c"); });

            if (/Mobi/.test(navigator.userAgent)) {
                var labels = [];
                $("#grid thead th").each(function () {
                    labels.push($(this).text());
                });
                $("#grid tbody tr").each(function () {
                    $(this).find("td").each(function (column) {
                        $("<span class='colHeader'>" + labels[column] + ":</span>").prependTo($(this));
                    });
                });
                $("#grid").addClass("card");
            }
        },
    });
  
}
