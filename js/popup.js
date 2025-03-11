document.addEventListener("DOMContentLoaded", () => {
    // Check if tableHtml is available from the parent window
    if (window.opener && window.opener.tableHtml) {
        const tableHtml = window.opener.tableHtml;
        document.getElementById("table-container").innerHTML = tableHtml;
    } else {
        // Fallback if tableHtml is not provided
        document.getElementById("table-container").innerHTML = "<p>No data available to display.</p>";
        console.error("No tableHtml provided by parent window.");
    }

    // Export table data to CSV
    const exportButton = document.getElementById("export-csv");
    if (exportButton) {
        exportButton.addEventListener("click", () => {
            const table = document.getElementById("data-table");
            if (!table) {
                alert("No table found to export!");
                return;
            }

            let csvContent = "";

            // Extract headers
            const headers = Array.from(table.querySelectorAll("thead tr th"))
                .map(th => `"${th.textContent.trim()}"`)
                .join(",");
            csvContent += headers + "\n";

            // Extract rows
            const rows = table.querySelectorAll("tbody tr");
            rows.forEach(row => {
                const rowData = Array.from(row.querySelectorAll("td"))
                    .map(td => `"${td.textContent.trim()}"`)
                    .join(",");
                csvContent += rowData + "\n";
            });

            // Trigger download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "inspection_data.csv";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    } else {
        console.error("Export button not found in the DOM.");
    }
});
