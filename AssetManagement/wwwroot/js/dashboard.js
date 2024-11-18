// Extract subcategory names and counts
var subcategoryNames = Object.keys(subcategoriesCount);
var subcategoryCounts = Object.values(subcategoriesCount);


var ctx = document.getElementById('subcategoriesChart').getContext('2d');
var chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: subcategoryNames,
        datasets: [{
            label: 'Assets Count',
            data: subcategoryCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            stepsize: 1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Assets'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Count'
                },
                min: 0,
                max: 5,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }
});


// Extract years and allocation counts
var years = Object.keys(assetAllocationsPerYear);
var counts = Object.values(assetAllocationsPerYear);


var ctx = document.getElementById('assetAllocationsChart').getContext('2d');
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: years,
        datasets: [{
            label: 'Assets Allocated Per Year',
            data: counts,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Year'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Allocation Counts'
                },
                min: 0,
                max: 10,
                ticks: {
                    stepSize: 1
                }
            }
        }
    }
});
var ctx = document.getElementById('pieChart').getContext('2d');
var chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: labelDepartmentNames,
        datasets: [{
            data: allocationCounts,
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)'
            ]
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
});