
const shortingColumnName = "CreatedTime";
const toolbarTemplate = '<div></div>';
const exportName = "Logs";
const columns = [
    // {field: "LogId", hidden: true },
    { field: "EntityTableName", title: "Table Name" },
    { field: "EntityName", title: "Entity Name" },
    { field: "Description", title: "Description" },

    { field: "Action", title: "Action" },
    {
        field: "CreatedTime", title: "Date", template: function (dataItem) {
            var date = new Date(dataItem.CreatedTime);
            var formattedDate = ("0" + date.getDate()).slice(-2) + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" + date.getFullYear();
            var formattedTime = ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
            return formattedDate + " " + formattedTime;
        }
    }
];
initializeGrid(logsData, shortingColumnName, exportName, toolbarTemplate, columns);